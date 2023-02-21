import AdmZip from "adm-zip";
import child_process from "child_process";
import crypto from "crypto";
import fs from "fs-extra";
import os from "os";
import path from "path";
import { URL } from "url";
import { ConfigManager } from "./config/configManager";
import { ModSettingValue } from "./config/modSetting";
import { AuthAccount } from "./config/msAccount";
import { Types } from "./distribution/constatnts";
import { Module } from "./distribution/module";
import { Required } from "./distribution/required";
import { Server } from "./distribution/server";
import { isAutoconnectBroken } from "./jvmArgBuilder/argBuilder113";
import { validateRules } from "./versionManifest/helper";

import LoggerUtil from "./loggerutil";
import { getJDKPath, mcVersionAtLeast, mojangFriendlyOS } from "./utils/util";
import { ForgeData112 } from "./versionManifest/forgeData112";
import { ForgeData113 } from "./versionManifest/forgeData113";
import { VersionData112 } from "./versionManifest/versionData112";
import { VersionData113 } from "./versionManifest/versionData113";

const logger = LoggerUtil("%c[ProcessBuilder]", "color: #003996; font-weight: bold");

export class ProcessBuilder {
  gameDir: string;
  commonDir: string;
  server: Server;
  versionData: VersionData112 | VersionData113;
  forgeData: ForgeData112 | ForgeData113;
  authUser: AuthAccount;
  launcherVersion: string;
  forgeModListFile: string;
  fmlDir: string;
  llDir: string;
  libPath: string;
  usingLiteLoader: boolean;
  llPath: string | null;
  constructor(
    distroServer: Server,
    versionData: VersionData112 | VersionData113,
    forgeData: ForgeData112 | ForgeData113,
    authUser: AuthAccount,
    launcherVersion: string
  ) {
    this.gameDir = ConfigManager.getLauncherSetting().getDataDirectory().instances.$join(distroServer.id);
    this.commonDir = ConfigManager.getLauncherSetting().getDataDirectory().common.$path;
    this.server = distroServer;
    this.versionData = versionData;
    this.forgeData = forgeData;
    this.authUser = authUser;
    this.launcherVersion = launcherVersion;
    this.forgeModListFile = path.join(this.gameDir, "forgeMods.list"); // 1.13+
    this.fmlDir = path.join(this.gameDir, "forgeModList.json");
    this.llDir = path.join(this.gameDir, "liteloaderModList.json");
    this.libPath = path.join(this.commonDir, "libraries");

    this.usingLiteLoader = false;
    this.llPath = null;
  }

  /**
   * Convienence method to run the functions typically used to build a process.
   */
  build() {
    fs.ensureDirSync(this.gameDir);
    const tempNativePath = path.join(
      os.tmpdir(),
      ConfigManager.getTempNativeFolder(),
      crypto.pseudoRandomBytes(16).toString("hex")
    );
    process.throwDeprecation = true;
    this.setupLiteLoader();
    logger.log("Using liteloader:", this.usingLiteLoader);
    const modObj = this.resolveModConfiguration(
      ConfigManager.getModsSetting(this.server.id)!.mods,
      this.server.modules
    );

    // Mod list below 1.13
    if (!mcVersionAtLeast("1.17", this.server.minecraftVersion)) {
      this.constructJSONModList("forge", modObj.fMods, true);
      if (this.usingLiteLoader) {
        this.constructJSONModList("liteloader", modObj.lMods, true);
      }
    }

    const uberModArr = modObj.fMods.concat(modObj.lMods);
    let args: any = this.constructJVMArguments(uberModArr, tempNativePath);

    if (mcVersionAtLeast("1.17", this.server.minecraftVersion)) {
      //args = args.concat(this.constructModArguments(modObj.fMods))
      args = args.concat(this.constructModList(modObj.fMods));
    }

    logger.log("Launch Arguments:", args);
    const child = child_process.spawn(getJDKPath(), args, {
      cwd: this.gameDir,
      detached: ConfigManager.getGameSetting().launchDetached,
    });

    if (ConfigManager.getGameSetting().launchDetached) {
      child.unref();
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    const loggerMCstdout = LoggerUtil("%c[Minecraft]", "color: #36b030; font-weight: bold");
    const loggerMCstderr = LoggerUtil("%c[Minecraft]", "color: #b03030; font-weight: bold");

    child.stdout.on("data", (data) => {
      loggerMCstdout.log(data);
    });
    child.stderr.on("data", (data) => {
      loggerMCstderr.log(data);
    });
    child.on("close", (code, signal) => {
      logger.log("Exited with code", code);
      fs.remove(tempNativePath, (err) => {
        if (err) {
          logger.warn("Error while deleting temp dir", err);
        } else {
          logger.log("Temp dir deleted successfully.");
        }
      });
    });

    return child;
  }

  /**
   * Get the platform specific classpath separator. On windows, this is a semicolon.
   * On Unix, this is a colon.
   *
   * @returns {string} The classpath separator for the current operating system.
   */
  static getClasspathSeparator() {
    return process.platform === "win32" ? ";" : ":";
  }

  /**
   * Determine if an optional mod is enabled from its configuration value. If the
   * configuration value is null, the required object will be used to
   * determine if it is enabled.
   *
   * A mod is enabled if:
   *   * The configuration is not null and one of the following:
   *     * The configuration is a boolean and true.
   *     * The configuration is an object and its 'value' property is true.
   *   * The configuration is null and one of the following:
   *     * The required object is null.
   *     * The required object's 'def' property is null or true.
   *
   * @param {Object | boolean} modCfg The mod configuration object.
   * @param {Object} required Optional. The required object from the mod's distro declaration.
   * @returns {boolean} True if the mod is enabled, false otherwise.
   */
  static isModEnabled(modCfg: ModSettingValue, required: Required | null = null) {
    return modCfg != null
      ? (typeof modCfg === "boolean" && modCfg) ||
          (typeof modCfg === "object" && (typeof modCfg.value !== "undefined" ? modCfg.value : true))
      : required != null
      ? required.def
      : true;
  }

  /**
   * Function which performs a preliminary scan of the top level
   * mods. If liteloader is present here, we setup the special liteloader
   * launch options. Note that liteloader is only allowed as a top level
   * mod. It must not be declared as a submodule.
   */
  setupLiteLoader() {
    for (const ll of this.server.modules) {
      if (ll.type === Types.LiteLoader) {
        if (!ll.required.value) {
          const modCfg = ConfigManager.getModsSetting(this.server.id)!.mods;
          if (ProcessBuilder.isModEnabled(modCfg[ll.versionLessID], ll.required)) {
            if (fs.existsSync(ll.artifactPath)) {
              this.usingLiteLoader = true;
              this.llPath = ll.artifactPath;
            }
          }
        } else {
          if (fs.existsSync(ll.artifactPath)) {
            this.usingLiteLoader = true;
            this.llPath = ll.artifactPath;
          }
        }
      }
    }
  }

  /**
   * Resolve an array of all enabled mods. These mods will be constructed into
   * a mod list format and enabled at launch.
   *
   * @param {Object} modCfg The mod configuration object.
   * @param {Array.<Object>} mdls An array of modules to parse.
   * @returns {{fMods: Array.<Object>, lMods: Array.<Object>}} An object which contains
   * a list of enabled forge mods and litemods.
   */
  resolveModConfiguration(modCfg: Record<string, ModSettingValue>, mdls: Module[]) {
    let fMods: Module[] = [];
    let lMods: Module[] = [];

    for (const mdl of mdls) {
      const type = mdl.type;
      if (type === Types.ForgeMod || type === Types.LiteMod || type === Types.LiteLoader) {
        const o = !mdl.required.value;
        const e = ProcessBuilder.isModEnabled(modCfg[mdl.versionLessID], mdl.required);
        if (!o || (o && e)) {
          if (mdl.subModules) {
            // @ts-expect-error aaa
            const v = this.resolveModConfiguration(modCfg[mdl.versionLessID].mods, mdl.subModules);
            fMods = fMods.concat(v.fMods);
            lMods = lMods.concat(v.lMods);
            if (mdl.type === Types.LiteLoader) {
              continue;
            }
          }
          if (mdl.type === Types.ForgeMod) {
            fMods.push(mdl);
          } else {
            lMods.push(mdl);
          }
        }
      }
    }

    return {
      fMods,
      lMods,
    };
  }

  _lteMinorVersion(version: string | number) {
    return Number(this.forgeData.id.split("-")[0].split(".")[1]) <= Number(version);
  }

  /**
   * Test to see if this version of forge requires the absolute: prefix
   * on the modListFile repository field.
   */
  _requiresAbsolute() {
    try {
      if (this._lteMinorVersion(9)) {
        return false;
      }
      const ver = this.forgeData.id.split("-")[2];
      const pts = ver.split(".");
      const min = [14, 23, 3, 2655];
      for (let i = 0; i < pts.length; i++) {
        const parsed = Number.parseInt(pts[i]);
        if (parsed < min[i]) {
          return false;
        } else if (parsed > min[i]) {
          return true;
        }
      }
    } catch (err) {
      // We know old forge versions follow this format.
      // Error must be caused by newer version.
    }

    // Equal or errored
    return true;
  }

  /**
   * Construct a mod list json object.
   *
   * @param {'forge' | 'liteloader'} type The mod list type to construct.
   * @param {Array.<Object>} mods An array of mods to add to the mod list.
   * @param {boolean} save Optional. Whether or not we should save the mod list file.
   */
  constructJSONModList(type: "forge" | "liteloader", mods: Module[], save = false) {
    const modList: {
      modRef?: string[];
      repositoryRoot: string;
    } = {
      repositoryRoot:
        (type === "forge" && this._requiresAbsolute() ? "absolute:" : "") + path.join(this.commonDir, "modstore"),
    };

    const ids = [];
    if (type === "forge") {
      for (const mod of mods) {
        ids.push(mod.getExtensionlessID());
      }
    } else {
      for (const mod of mods) {
        ids.push(mod.getExtensionlessID() + "@" + mod.getExtension());
      }
    }
    modList.modRef = ids;

    if (save) {
      const json = JSON.stringify(modList, null, 4);
      fs.writeFileSync(type === "forge" ? this.fmlDir : this.llDir, json, "utf-8");
    }

    return modList;
  }

  // /**
  //  * Construct the mod argument list for forge 1.13
  //  *
  //  * @param {Array.<Object>} mods An array of mods to add to the mod list.
  //  */
  // constructModArguments(mods){
  //     const argStr = mods.map(mod => {
  //         return mod.getExtensionlessID()
  //     }).join(',')

  //     if(argStr){
  //         return [
  //             '--fml.mavenRoots',
  //             path.join('..', '..', 'common', 'modstore'),
  //             '--fml.mods',
  //             argStr
  //         ]
  //     } else {
  //         return []
  //     }

  // }

  /**
   * Construct the mod argument list for forge 1.13
   *
   * @param {Array.<Object>} mods An array of mods to add to the mod list.
   */
  constructModList(mods: Module[]) {
    const writeBuffer = mods
      .map((mod) => {
        return mod.getExtensionlessID();
      })
      .join("\n");

    if (writeBuffer) {
      fs.writeFileSync(this.forgeModListFile, writeBuffer, "utf-8");
      return ["--fml.mavenRoots", path.join("..", "..", "common", "modstore"), "--fml.modLists", this.forgeModListFile];
    } else {
      return [];
    }
  }

  _processAutoConnectArg(args: string[]) {
    if (ConfigManager.getGameSetting().autoConnect && this.server.autoconnect) {
      const serverURL = new URL("my://" + this.server.address);
      args.push("--server");
      args.push(serverURL.hostname);
      if (serverURL.port) {
        args.push("--port");
        args.push(serverURL.port);
      }
    }
  }

  /**
   * Construct the argument array that will be passed to the JVM process.
   *
   * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
   * @param {string} tempNativePath The path to store the native libraries.
   * @returns {Array.<string>} An array containing the full JVM arguments for this process.
   */
  constructJVMArguments(mods: Module[], tempNativePath: string) {
    if (mcVersionAtLeast("1.13", this.server.minecraftVersion)) {
      return this._constructJVMArguments113(mods, tempNativePath);
    } else {
      return this._constructJVMArguments112(mods, tempNativePath);
    }
  }

  /**
   * Construct the argument array that will be passed to the JVM process.
   * This function is for 1.12 and below.
   *
   * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
   * @param {string} tempNativePath The path to store the native libraries.
   * @returns {Array.<string>} An array containing the full JVM arguments for this process.
   */
  _constructJVMArguments112(mods: Module[], tempNativePath: string) {
    let args = [];

    // Classpath Argument
    args.push("-cp");
    args.push(this.classpathArg(mods, tempNativePath).join(ProcessBuilder.getClasspathSeparator()));

    args.push("-Dlog4j2.formatMsgNoLookups=true");

    // Java Arguments
    if (process.platform === "darwin") {
      args.push("-Xdock:name=NumaLauncher");
      args.push("-Xdock:icon=" + path.join(__dirname, "..", "images", "minecraft.icns"));
    }
    args.push("-Xmx" + ConfigManager.getJavaSetting().maxRAM);
    args.push("-Xms" + ConfigManager.getJavaSetting().maxRAM);
    args = args.concat(ConfigManager.getJavaSetting().jvmOptions);
    args.push("-Djava.library.path=" + tempNativePath);

    // Main Java Class
    args.push(this.forgeData.mainClass);

    // Forge Arguments
    args = args.concat(this._resolveForgeArgs());

    return args;
  }

  /**
   * Construct the argument array that will be passed to the JVM process.
   * This function is for 1.13+
   *
   * Note: Required Libs https://github.com/MinecraftForge/MinecraftForge/blob/af98088d04186452cb364280340124dfd4766a5c/src/fmllauncher/java/net/minecraftforge/fml/loading/LibraryFinder.java#L82
   *
   * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
   * @param {string} tempNativePath The path to store the native libraries.
   * @returns {Array.<string>} An array containing the full JVM arguments for this process.
   */
  _constructJVMArguments113(mods: Module[], tempNativePath: string) {
    const argDiscovery = /\${*(.*)}/;

    // JVM Arguments First
    let args: any = this.versionData.arguments.jvm;
    const forgeData = this.forgeData as ForgeData113;
    if (forgeData.arguments.jvm != null) {
      for (const argStr of forgeData.arguments.jvm) {
        args.push(
          argStr
            .replaceAll("${library_directory}", this.libPath)
            .replaceAll("${classpath_separator}", ProcessBuilder.getClasspathSeparator())
            .replaceAll("${version_name}", forgeData.id)
        );
      }
    }
    //args.push('-Dlog4j.configurationFile=D:\\WesterosCraft\\game\\common\\assets\\log_configs\\client-1.12.xml')
    args.push("-Dlog4j2.formatMsgNoLookups=true");

    // Java Arguments
    if (process.platform === "darwin") {
      args.push("-Xdock:name=NumaLauncher");
      args.push("-Xdock:icon=" + path.join(__dirname, "..", "images", "minecraft.icns"));
    }
    args.push("-Xmx" + ConfigManager.getJavaSetting().maxRAM);
    args.push("-Xms" + ConfigManager.getJavaSetting().minRAM);
    args = args.concat(ConfigManager.getJavaSetting().jvmOptions);

    // Main Java Class
    args.push(this.forgeData.mainClass);

    // Vanilla Arguments
    args = args.concat(this.versionData.arguments.game);

    for (let i = 0; i < args.length; i++) {
      if (typeof args[i] === "object" && args[i].rules != null) {
        let checksum = 0;
        for (const rule of args[i].rules) {
          if (rule.os != null) {
            if (
              rule.os.name === mojangFriendlyOS() &&
              (rule.os.version == null || new RegExp(rule.os.version).test(os.release()))
            ) {
              if (rule.action === "allow") {
                checksum++;
              }
            } else {
              if (rule.action === "disallow") {
                checksum++;
              }
            }
          } else if (rule.features != null) {
            // We don't have many 'features' in the index at the moment.
            // This should be fine for a while.
            if (rule.features.has_custom_resolution != null && rule.features.has_custom_resolution === true) {
              if (ConfigManager.getGameSetting().fullscreen) {
                args[i].value = ["--fullscreen", "true"];
              }
              checksum++;
            }
          }
        }

        // TODO splice not push
        if (checksum === args[i].rules.length) {
          if (typeof args[i].value === "string") {
            args[i] = args[i].value;
          } else if (typeof args[i].value === "object") {
            //args = args.concat(args[i].value)
            args.splice(i, 1, ...args[i].value);
          }

          // Decrement i to reprocess the resolved value
          i--;
        } else {
          args[i] = null;
        }
      } else if (typeof args[i] === "string") {
        if (argDiscovery.test(args[i])) {
          const identifier = args[i].match(argDiscovery)[1];
          let val = null;
          switch (identifier) {
            case "auth_player_name":
              val = this.authUser.displayName.trim();
              break;
            case "version_name":
              //val = versionData.id
              val = this.server.id;
              break;
            case "game_directory":
              val = this.gameDir;
              break;
            case "assets_root":
              val = path.join(this.commonDir, "assets");
              break;
            case "assets_index_name":
              val = this.versionData.assets;
              break;
            case "auth_uuid":
              val = this.authUser.uuid.trim();
              break;
            case "auth_access_token":
              val = this.authUser.accessToken;
              break;
            case "user_type":
              val = "mojang";
              break;
            case "version_type":
              val = this.versionData.type;
              break;
            case "resolution_width":
              val = ConfigManager.getGameSetting().resWidth;
              break;
            case "resolution_height":
              val = ConfigManager.getGameSetting().resHeight;
              break;
            case "natives_directory":
              val = args[i].replace(argDiscovery, tempNativePath);
              break;
            case "launcher_name":
              val = args[i].replace(argDiscovery, "Numa-Launcher");
              break;
            case "launcher_version":
              val = args[i].replace(argDiscovery, this.launcherVersion);
              break;
            case "classpath":
              val = this.classpathArg(mods, tempNativePath).join(ProcessBuilder.getClasspathSeparator());
              break;
          }
          if (val != null) {
            args[i] = val;
          }
        }
      }
    }

    // Autoconnect
    try {
      if (isAutoconnectBroken(this.forgeData.id.split("-")[2])) {
        logger.error(
          "Server autoconnect disabled on Forge 1.15.2 for builds earlier than 31.2.15 due to OpenGL Stack Overflow issue."
        );
        logger.error("Please upgrade your Forge version to at least 31.2.15!");
      } else {
        this._processAutoConnectArg(args);
      }
    } catch (err) {
      logger.error(err);
      logger.error("Forge version format changed.. assuming autoconnect works.");
      logger.debug("Forge version:", this.forgeData.id);
    }

    // Forge Specific Arguments
    args = args.concat(forgeData.arguments.game);

    // Filter null values
    args = args.filter((arg: any) => {
      return arg != null;
    });

    return args;
  }

  /**
   * Resolve the arguments required by forge.
   *
   * @returns {Array.<string>} An array containing the arguments required by forge.
   */
  _resolveForgeArgs() {
    const forgeData = this.forgeData as ForgeData112;
    const mcArgs = forgeData.minecraftArguments.split(" ");
    const argDiscovery = /\${*(.*)}/;

    // Replace the declared variables with their proper values.
    for (let i = 0; i < mcArgs.length; ++i) {
      if (argDiscovery.test(mcArgs[i])) {
        const identifier = mcArgs[i].match(argDiscovery)![1];
        let val = null;
        switch (identifier) {
          case "auth_player_name":
            val = this.authUser.displayName.trim();
            break;
          case "version_name":
            //val = versionData.id
            val = this.server.id;
            break;
          case "game_directory":
            val = this.gameDir;
            break;
          case "assets_root":
            val = path.join(this.commonDir, "assets");
            break;
          case "assets_index_name":
            val = this.versionData.assets;
            break;
          case "auth_uuid":
            val = this.authUser.uuid.trim();
            break;
          case "auth_access_token":
            val = this.authUser.accessToken;
            break;
          case "user_type":
            val = "mojang";
            break;
          case "user_properties": // 1.8.9 and below.
            val = "{}";
            break;
          case "version_type":
            val = this.versionData.type;
            break;
        }
        if (val != null) {
          mcArgs[i] = val;
        }
      }
    }

    // Autoconnect to the selected server.
    this._processAutoConnectArg(mcArgs);

    // Prepare game resolution
    if (ConfigManager.getGameSetting().fullscreen) {
      mcArgs.push("--fullscreen");
      mcArgs.push(true + "");
    } else {
      mcArgs.push("--width");
      mcArgs.push(ConfigManager.getGameSetting().resWidth.toString());
      mcArgs.push("--height");
      mcArgs.push(ConfigManager.getGameSetting().resHeight.toString());
    }

    // Mod List File Argument
    mcArgs.push("--modListFile");
    if (this._lteMinorVersion(9)) {
      mcArgs.push(path.basename(this.fmlDir));
    } else {
      mcArgs.push("absolute:" + this.fmlDir);
    }

    // LiteLoader
    if (this.usingLiteLoader) {
      mcArgs.push("--modRepo");
      mcArgs.push(this.llDir);

      // Set first arg to liteloader tweak class
      mcArgs.unshift("com.mumfrey.liteloader.launch.LiteLoaderTweaker");
      mcArgs.unshift("--tweakClass");
    }

    return mcArgs;
  }

  /**
   * Ensure that the classpath entries all point to jar files.
   *
   * @param {Array.<String>} list Array of classpath entries.
   */
  _processClassPathList(list: string[]) {
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
   * Resolve the full classpath argument list for this process. This method will resolve all Mojang-declared
   * libraries as well as the libraries declared by the server. Since mods are permitted to declare libraries,
   * this method requires all enabled mods as an input
   *
   * @param {Array.<Object>} mods An array of enabled mods which will be launched with this process.
   * @param {string} tempNativePath The path to store the native libraries.
   * @returns {Array.<string>} An array containing the paths of each library required by this process.
   */
  classpathArg(mods: Module[], tempNativePath: string) {
    let cpArgs: string[] = [];

    // Add the version.jar to the classpath.
    // const version = this.versionData.id
    // cpArgs.push(path.join(this.commonDir, 'versions', version, version + '.jar'))

    if (!mcVersionAtLeast("1.17", this.server.minecraftVersion)) {
      // Add the version.jar to the classpath.
      // Must not be added to the classpath for Forge 1.17+.
      const version = this.versionData.id;
      cpArgs.push(path.join(this.commonDir, "versions", version, version + ".jar"));
    }

    if (this.usingLiteLoader) {
      cpArgs.push(this.llPath!);
    }

    // Resolve the Mojang declared libraries.
    const mojangLibs = this._resolveMojangLibraries(tempNativePath);

    // Resolve the server declared libraries.
    const servLibs = this._resolveServerLibraries(mods);

    // Merge libraries, server libs with the same
    // maven identifier will override the mojang ones.
    // Ex. 1.7.10 forge overrides mojang's guava with newer version.
    const finalLibs = { ...mojangLibs, ...servLibs };
    cpArgs = cpArgs.concat(Object.values(finalLibs));

    this._processClassPathList(cpArgs);

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
  _resolveMojangLibraries(tempNativePath: string) {
    const libs = {};

    const libArr = this.versionData.libraries;
    fs.ensureDirSync(tempNativePath);
    for (let i = 0; i < libArr.length; i++) {
      const lib = libArr[i];
      // @ts-expect-error aaa
      if (validateRules(lib.rules, lib.natives)) {
        // @ts-expect-error aaa
        if (lib.natives == null) {
          const dlInfo = lib.downloads;
          const artifact = dlInfo.artifact;
          const to = path.join(this.libPath, artifact.path);
          const versionIndependentId = lib.name.substring(0, lib.name.lastIndexOf(":"));
          // @ts-expect-error aaa
          libs[versionIndependentId] = to;
        } else {
          // Extract the native library.
          // @ts-expect-error aaa
          const exclusionArr = lib.extract != null ? lib.extract.exclude : ["META-INF/"];
          const artifact =
            // @ts-expect-error aaa
            lib.downloads.classifiers[
              // @ts-expect-error aaa
              lib.natives[mojangFriendlyOS()].replace("${arch}", process.arch.replace("x", ""))
            ];

          // Location of native zip.
          const to = path.join(this.libPath, artifact.path);

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
                  logger.error("Error while extracting native library:", err);
                }
              });
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
  _resolveServerLibraries(mods: Module[]) {
    const mdls = this.server.modules;
    let libs: Record<ObjectKey, any> = {};

    // Locate Forge/Libraries
    for (const mdl of mdls) {
      const type = mdl.type;
      if (type === Types.ForgeHosted || type === Types.Library) {
        libs[mdl.versionLessID] = mdl.artifactPath;
        if (mdl.subModules) {
          const res = this._resolveModuleLibraries(mdl);
          if (res.length > 0) {
            libs = { ...libs, ...res };
          }
        }
      } else if (type === Types.Forge) {
        // Forgeインストーラで生成されたライブラリを追加
        const forgeLibs = [];
        for (const library of this.forgeData.libraries) {
          forgeLibs.push(
            ConfigManager.getLauncherSetting()
              .getDataDirectory()
              .common.libraries.$join(library.downloads.artifact.path)
          );
        }
        libs = { ...libs, ...forgeLibs };
      }
    }

    return libs;
  }

  /**
   * Recursively resolve the path of each library required by this module.
   *
   * @param {Object} mdl A module object from the server distro index.
   * @returns {Array.<string>} An array containing the paths of each library this module requires.
   */
  _resolveModuleLibraries(mdl: Module) {
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
        libs.push(sm.artifactPath);
      }
      // If this module has submodules, we need to resolve the libraries for those.
      // To avoid unnecessary recursive calls, base case is checked here.
      if (mdl.subModules) {
        const res: any[] = this._resolveModuleLibraries(sm);
        if (res.length > 0) {
          libs = libs.concat(res);
        }
      }
    }
    return libs;
  }
}
