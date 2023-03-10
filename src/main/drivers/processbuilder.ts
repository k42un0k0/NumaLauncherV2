import child_process from "child_process";
import crypto from "crypto";
import fs from "fs-extra";
import os from "os";
import path from "path";

import { ConfigManager } from "./configManager";
import { Module } from "../entities/distribution/module";
import { Server } from "../entities/distribution/server";
import { Types } from "../entities/distribution/constatnts";
import { ForgeData112 } from "../entities/versionManifest/forgeData112";
import { ForgeData113 } from "../entities/versionManifest/forgeData113";
import { ArgBuilder112 } from "./jvmArgBuilder/argBuilder112";
import { ArgBuilder113 } from "./jvmArgBuilder/argBuilder113";
import { classpathArgs } from "./jvmArgBuilder/classpathArgs";
import { classpathSeparator, resolveModConfiguration } from "./jvmArgBuilder/helper";
import { AuthAccount } from "../entities/config/msAccount";
import { getJDKPath, mcVersionAtLeast, _lteMinorVersion } from "../utils/util";
import { VersionData112 } from "../entities/versionManifest/versionData112";
import { VersionData113 } from "../entities/versionManifest/versionData113";

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
    const gameDir = ConfigManager.getLauncherSetting().getDataDirectory().instances.game(distroServer.id);
    this.gameDir = gameDir.$path;
    this.commonDir = ConfigManager.getLauncherSetting().getDataDirectory().common.$path;
    this.server = distroServer;
    this.versionData = versionData;
    this.forgeData = forgeData;
    this.authUser = authUser;
    this.launcherVersion = launcherVersion;
    this.forgeModListFile = gameDir.forgeModListFile; // 1.13+
    this.fmlDir = gameDir.fmlFile;
    this.llDir = gameDir.llFile;
    this.libPath = ConfigManager.getLauncherSetting().getDataDirectory().common.libraries.$path;

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
    const modObj = resolveModConfiguration(ConfigManager.getModsSetting(this.server.id)!, this.server.modules);

    // Mod list below 1.13
    if (!mcVersionAtLeast("1.17", this.server.minecraftVersion)) {
      this.constructJSONModList("forge", modObj.fMods, true);
      if (this.usingLiteLoader) {
        this.constructJSONModList("liteloader", modObj.lMods, true);
      }
    }

    const uberModArr = modObj.fMods.concat(modObj.lMods);
    let args: string[] = [];
    if (mcVersionAtLeast("1.13", this.server.minecraftVersion)) {
      const classpath = classpathArgs(
        uberModArr,
        tempNativePath,
        this.server,
        this.versionData,
        this.forgeData,
        this.commonDir,
        this.usingLiteLoader,
        this.llPath || "",
        this.libPath
      ).join(classpathSeparator);
      const valueAfterReplace = ArgBuilder113.genValueAfterReplace(
        tempNativePath,
        this.versionData as VersionData113,
        this.authUser,
        this.server,
        this.gameDir,
        this.launcherVersion,
        classpath
      );
      args = args.concat(
        ArgBuilder113.build(
          this.versionData as VersionData113,
          this.forgeData as ForgeData113,
          this.libPath,
          this.server,
          valueAfterReplace
        )
      );
    } else {
      const classpath = classpathArgs(
        uberModArr,
        tempNativePath,
        this.server,
        this.versionData,
        this.forgeData,
        this.commonDir,
        this.usingLiteLoader,
        this.llPath || "",
        this.libPath
      ).join(classpathSeparator);
      const valueAfterReplace = ArgBuilder112.genValueAfterReplace(
        this.authUser,
        this.server,
        this.gameDir,
        this.versionData
      );
      args = args.concat(
        ArgBuilder112.build(
          tempNativePath,
          this.forgeData as ForgeData112,
          this.server,
          this.fmlDir,
          this.llDir,
          this.usingLiteLoader,
          valueAfterReplace,
          classpath
        )
      );
    }

    if (mcVersionAtLeast("1.17", this.server.minecraftVersion)) {
      //args = args.concat(this.constructModArguments(modObj.fMods))
      args = args.concat(this.constructModList(modObj.fMods));
    }
    console.log(args);
    const child = child_process.spawn(getJDKPath(), args, {
      cwd: this.gameDir,
      // detached: ConfigManager.getGameSetting().launchDetached,
    });

    if (ConfigManager.getGameSetting().launchDetached) {
      child.unref();
    }

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    // const loggerMCstdout = LoggerUtil("%c[Minecraft]", "color: #36b030; font-weight: bold");
    // const loggerMCstderr = LoggerUtil("%c[Minecraft]", "color: #b03030; font-weight: bold");

    child.stdout.on("data", (data) => {
      console.log(data);
    });
    child.stderr.on("data", (data) => {
      console.log(data);
    });
    child.on("close", (code, signal) => {
      console.log("Exited with code", code);
      try {
        fs.removeSync(tempNativePath);
        console.log("Temp dir deleted successfully.");
      } catch (e) {
        console.warn("Error while deleting temp dir", e);
      }
    });

    return child;
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
          const modCfg = ConfigManager.getModsSetting(this.server.id);
          if (modCfg && modCfg.isModEnabled(ll.versionLessID, ll.required.def)) {
            if (fs.existsSync(ll.artifact.path)) {
              this.usingLiteLoader = true;
              this.llPath = ll.artifact.path;
            }
          }
        } else {
          if (fs.existsSync(ll.artifact.path)) {
            this.usingLiteLoader = true;
            this.llPath = ll.artifact.path;
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

  /**
   * Test to see if this version of forge requires the absolute: prefix
   * on the modListFile repository field.
   */
  _requiresAbsolute() {
    try {
      if (_lteMinorVersion(this.forgeData, 9)) {
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
      repositoryRoot: string;
      modRef?: string[];
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
        ids.push(mod.getExtensionlessID() + "@" + mod.artifactExt);
      }
    }
    modList.modRef = ids;

    if (save) {
      const json = JSON.stringify(modList, null, 4);
      fs.writeFileSync(type === "forge" ? this.fmlDir : this.llDir, json, "utf-8");
    }

    return modList;
  }

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
}
