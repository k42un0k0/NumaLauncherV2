import path from "path";
import { ConfigManager } from "../config/configManager";
import { Types } from "../distribution/constatnts";
import { Module } from "../distribution/module";
import { Server } from "../distribution/server";
import { mcVersionAtLeast, mojangFriendlyOS } from "../utils/util";
import { ForgeData112 } from "../versionManifest/forgeData112";
import { ForgeData113 } from "../versionManifest/forgeData113";
import { VersionData112 } from "../versionManifest/versionData112";
import { VersionData113 } from "../versionManifest/versionData113";
import fs from "fs-extra";
import AdmZip from "adm-zip";
import { validateRules } from "../versionManifest/helper";
export function classpathArgs(
  mods: Module[],
  tempNativePath: string,
  server: Server,
  versionData: VersionData112 | VersionData113,
  forgeData: ForgeData112 | ForgeData113,
  commonDir: string,
  usingLiteLoader: boolean,
  llPath: string,
  libPath: string
) {
  let cpArgs: string[] = [];

  // Add the version.jar to the classpath.
  // const version = this.versionData.id
  // cpArgs.push(path.join(this.commonDir, 'versions', version, version + '.jar'))

  if (!mcVersionAtLeast("1.17", server.minecraftVersion)) {
    // Add the version.jar to the classpath.
    // Must not be added to the classpath for Forge 1.17+.
    const version = versionData.id;
    cpArgs.push(path.join(commonDir, "versions", version, version + ".jar"));
  }

  if (usingLiteLoader) {
    cpArgs.push(llPath!);
  }

  // Resolve the Mojang declared libraries.
  const mojangLibs = _resolveMojangLibraries(tempNativePath, versionData, libPath);

  // Resolve the server declared libraries.
  const servLibs = _resolveServerLibraries(mods, server, forgeData);

  // Merge libraries, server libs with the same
  // maven identifier will override the mojang ones.
  // Ex. 1.7.10 forge overrides mojang's guava with newer version.
  const finalLibs = { ...mojangLibs, ...servLibs };
  cpArgs = cpArgs.concat(Object.values(finalLibs));

  _processClassPathList(cpArgs);

  return cpArgs;
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
  const libs: Record<string, string> = {};

  const libArr = versionData.libraries;
  fs.ensureDirSync(tempNativePath);
  for (let i = 0; i < libArr.length; i++) {
    const lib = libArr[i];

    if (validateRules(lib)) {
      if (!("natives" in lib) || lib.natives == null) {
        const dlInfo = lib.downloads;
        const artifact = dlInfo.artifact;
        const to = path.join(libPath, artifact.path);
        const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(":"));
        libs[versionIndependentId] = to;
      } else {
        // Extract the native library.
        const exclusionArr = lib.extract != null ? lib.extract.exclude : ["META-INF/"];
        const artifact =
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
          exclusionArr.forEach(function (exclusion: any) {
            if (fileName.indexOf(exclusion) > -1) {
              shouldExclude = true;
            }
          });

          // Extract the file.
          if (!shouldExclude) {
            fs.writeFile(path.join(tempNativePath, fileName), zipEntries[i].getData(), (err) => {
              if (err) {
                console.log("Error while extracting native library:", err);
              }
            });
          }
        }
      }
    }
  }

  return libs;
}
function _resolveModuleLibraries(mdl: Module) {
  if (!mdl.subModules) {
    return [];
  }
  let libs: string[] = [];
  for (const sm of mdl.subModules) {
    if (sm.type === Types.Library) {
      // TODO Add as file or something.
      const x = sm.id;
      console.log(x);
      if (
        x.includes(":universal") ||
        x.includes(":slim") ||
        x.includes(":extra") ||
        x.includes(":srg") ||
        x.includes(":client")
      ) {
        console.log("SKIPPING " + x);
        continue;
      }
      libs.push(sm.artifact.path);
    }
    // If this module has submodules, we need to resolve the libraries for those.
    // To avoid unnecessary recursive calls, base case is checked here.
    if (mdl.subModules) {
      const res: any[] = _resolveModuleLibraries(sm);
      if (res.length > 0) {
        libs = libs.concat(res);
      }
    }
  }
  return libs;
}

function _resolveServerLibraries(mods: Module[], server: Server, forgeData: ForgeData112 | ForgeData113) {
  const mdls = server.modules;
  let libs: Record<ObjectKey, any> = {};

  // Locate Forge/Libraries
  for (const mdl of mdls) {
    const type = mdl.type;
    if (type === Types.ForgeHosted || type === Types.Library) {
      libs[mdl.versionLessID] = mdl.artifact.path;
      if (mdl.subModules) {
        const res = _resolveModuleLibraries(mdl);
        if (res.length > 0) {
          libs = { ...libs, ...res };
        }
      }
    } else if (type === Types.Forge) {
      // Forgeインストーラで生成されたライブラリを追加
      const forgeLibs = [];
      for (const library of forgeData.libraries) {
        forgeLibs.push(
          ConfigManager.getLauncherSetting().getDataDirectory().common.libraries.$join(library.downloads.artifact.path)
        );
      }
      libs = { ...libs, ...forgeLibs };
    }
  }

  return libs;
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
