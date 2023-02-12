import path from "path";
import { ConfigManager } from "../config/configManager";
import { ForgeData112 } from "../versionManifest/forgeData112";
import { ForgeData113 } from "../versionManifest/forgeData113";
import { mcVersionAtLeast, mojangFriendlyOS } from "../utils/util";
import { VersionData112 } from "../versionManifest/versionData112";
import { VersionData113 } from "../versionManifest/versionData113";
import fs from "fs-extra";
import { validateRules } from "./helper";
import AdmZip from "adm-zip";
import { Module } from "../distribution/module";
import { Server } from "../distribution/server";
import { Types } from "../distribution/constatnts";
/**
 * Resolve the full classpath argument list for this process. This method will resolve all Mojang-declared
 * libraries as well as the libraries declared by the server. Since mods are permitted to declare libraries,
 * this method requires all enabled mods as an input
 *
 * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
 * @param {string} tempNativePath The path to store the native libraries.
 * @returns {Array.<string>} An array containing the paths of each library required by this process.
 */
export function classpathArg(
  mods: Module[],
  tempNativePath: string,
  server: Server,
  versionData: VersionData112 | VersionData113,
  forgeData: ForgeData112 | ForgeData113,
  usingLiteLoader: boolean,
  llPath: string,
  libPath: string
): string[] {
  let cpArgs = [];

  // Add the version.jar to the classpath.
  // const version = this.versionData.id
  // cpArgs.push(path.join(this.commonDir, 'versions', version, version + '.jar'))

  if (!mcVersionAtLeast("1.17", server.minecraftVersion)) {
    // Add the version.jar to the classpath.
    // Must not be added to the classpath for Forge 1.17+.
    const version = versionData.id;
    cpArgs.push(
      ConfigManager.getLauncherSetting()
        .getDataDirectory()
        .common.versions.$join(version, version + ".jar")
    );
  }

  if (usingLiteLoader) {
    cpArgs.push(llPath);
  }

  // Resolve the Mojang declared libraries.
  const mojangLibs = _resolveMojangLibraries(tempNativePath, versionData, libPath);

  // Resolve the server declared libraries.
  const servLibs = _resolveServerLibraries(
    mods,
    server.modules,
    ConfigManager.getLauncherSetting().getDataDirectory().common.$path,
    forgeData
  );

  // Merge libraries, server libs with the same
  // maven identifier will override the mojang ones.
  // Ex. 1.7.10 forge overrides mojang's guava with newer version.
  const finalLibs = [...mojangLibs, ...servLibs];
  console.log("adsfasdfasdfa", mojangLibs);
  console.log("we8ufewlfjlej;", servLibs);
  cpArgs = cpArgs.concat(finalLibs);

  _processClassPathList(cpArgs);

  return cpArgs;
}

function _processClassPathList(list: string[]) {
  const ext = ".jar";
  const extLen = ext.length;
  for (let i = 0; i < list.length; i++) {
    const extIndex = list[i].indexOf(ext);
    if (extIndex > -1 && extIndex !== list[i].length - extLen) {
      list[i] = list[i].substring(0, extIndex + extLen);
    }
  }
}
/**
 * Resolve the libraries defined by Mojang's version data. This method will also extract
 * native libraries and point to the correct location for its classpath.
 *
 * TODO - clean up function
 *
 * @param {string} tempNativePath The path to store the native libraries.
 * @returns {{[id: string]: string}} An object containing the paths of each library mojang declares.
 */
function _resolveMojangLibraries(
  tempNativePath: string,
  versionData: VersionData112 | VersionData113,
  libPath: string
) {
  const libs = [];

  const libArr = versionData.libraries;
  fs.ensureDirSync(tempNativePath);
  for (let i = 0; i < libArr.length; i++) {
    const lib = libArr[i];
    console.log(lib);
    // @ts-expect-error aaaa
    if (validateRules(lib.rules, lib.natives)) {
      // @ts-expect-error aaa
      if (lib.natives == null) {
        const dlInfo = lib.downloads;
        const artifact = dlInfo.artifact;
        const to = path.join(libPath, artifact.path);
        const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(":"));
        libs.push(to);
      } else {
        // Extract the native library.
        // @ts-expect-error aaa
        const exclusionArr = lib.extract != null ? lib.extract.exclude : ["META-INF/"];
        const artifact =
          // @ts-expect-error aaa
          lib.downloads.classifiers[lib.natives[mojangFriendlyOS()]!.replace("${arch}", process.arch.replace("x", ""))];

        // Location of native zip.
        const to = path.join(libPath, artifact.path);

        const zip = new AdmZip(to);
        const zipEntries = zip.getEntries();

        // Unzip the native zip.
        for (let i = 0; i < zipEntries.length; i++) {
          const fileName = zipEntries[i].entryName;

          let shouldExclude = false;

          // Exclude noted files.
          // @ts-expect-error aaa
          exclusionArr.forEach(function (exclusion) {
            if (fileName.indexOf(exclusion) > -1) {
              shouldExclude = true;
            }
          });

          // Extract the file.
          if (!shouldExclude) {
            fs.writeFileSync(path.join(tempNativePath, fileName), zipEntries[i].getData());
          }
        }
      }
    }
  }

  return libs;
}

/**
 * Resolve the libraries declared by this server in order to add them to the classpath.
 * This method will also check each enabled mod for libraries, as mods are permitted to
 * declare libraries.
 *
 * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
 * @returns {{[id: string]: string}} An object containing the paths of each library this server requires.
 */
function _resolveServerLibraries(
  mods: Module[],
  modules: Module[],
  commonDir: string,
  forgeData: ForgeData113 | ForgeData112
) {
  let libs: string[] = [];

  // Locate Forge/Libraries
  libs = modules.reduce((acc, mdl) => {
    const type = mdl.type;
    if (type === Types.ForgeHosted || type === Types.Library) {
      libs.push(mdl.artifactPath);
      if (mdl.subModules) {
        const res = _resolveModuleLibraries(mdl);
        if (res.length > 0) {
          return acc.concat(res);
        }
      }
    } else if (type === Types.Forge) {
      // Forgeインストーラで生成されたライブラリを追加
      const forgeLibs = forgeData.libraries.map((library) => {
        return path.join(commonDir, "libraries", library.downloads.artifact.path);
      });
      return acc.concat(forgeLibs);
    }
    return acc;
  }, libs);

  //Check for any libraries in our mod list.
  return mods.reduce((acc, mod) => {
    if (mod.subModules != null) {
      const res = _resolveModuleLibraries(mod);
      if (res.length > 0) {
        return acc.concat(res);
      }
    }
    return acc;
  }, libs);
}

/**
 * Recursively resolve the path of each library required by this module.
 *
 * @param {Object} mdl A module object from the server distro index.
 * @returns {Array.<string>} An array containing the paths of each library this module requires.
 */
function _resolveModuleLibraries(mdl: Module): string[] {
  return (
    mdl.subModules?.reduce<string[]>((acc, sm) => {
      if (sm.type === Types.Library) {
        // TODO Add as file or something.
        const x = sm.id;
        if (
          x.includes(":universal") ||
          x.includes(":slim") ||
          x.includes(":extra") ||
          x.includes(":srg") ||
          x.includes(":client")
        ) {
          return acc;
        }
        acc = acc.concat(sm.artifactPath);
      }
      if (sm.subModules) {
        acc = acc.concat(_resolveModuleLibraries(sm));
      }
      return acc;
    }, []) || []
  );
}
