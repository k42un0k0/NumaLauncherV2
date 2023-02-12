// Requirements
import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { BinaryLike, createHash } from "crypto";
import EventEmitter from "events";
import {
  existsSync,
  readFileSync,
  writeFile,
  readFile,
  ensureDirSync,
  writeFileSync,
  createWriteStream,
  pathExists,
} from "fs-extra";
import { join } from "path";
import fetch from "node-fetch";
import { validateRules } from "./jvmArgBuilder/helper";
import { forEachOfLimit, isDev, isForgeGradle3, mojangFriendlyOS } from "./utils/util";
import { VersionData112 } from "./versionManifest/versionData112";
import { VersionData113 } from "./versionManifest/versionData113";
import fs from "fs-extra";
import { Server } from "./distribution/server";
import { Module } from "./distribution/module";
import { Required } from "./distribution/required";
import { ModSettingValue } from "./config/modSetting";
import { ConfigManager } from "./config/configManager";
import { Types } from "./distribution/constatnts";
import { DistroManager } from "./distribution/distroManager";
// Constants
// const PLATFORM_MAP = {
//     win32: '-windows-x64.tar.gz',
//     darwin: '-macosx-x64.tar.gz',
//     linux: '-linux-x64.tar.gz'
// }

// Classes

/** Class representing a base asset. */
class Asset {
  id: any;
  hash: string;
  size: number;
  from: string;
  to: string;
  /**
   * Create an asset.
   *
   * @param {any} id The id of the asset.
   * @param {string} hash The hash value of the asset.
   * @param {number} size The size in bytes of the asset.
   * @param {string} from The url where the asset can be found.
   * @param {string} to The absolute local file path of the asset.
   */
  constructor(id: any, hash: string, size: number, from: string, to: string) {
    this.id = id;
    this.hash = hash;
    this.size = size;
    this.from = from;
    this.to = to;
  }
}

/**
 * Class representing a download tracker. This is used to store meta data
 * about a download queue, including the queue itself.
 */
class DLTracker {
  dlqueue: Asset[];
  dlsize: number;
  callback?: (asset: Asset) => void;
  /**
   * Create a DLTracker
   *
   * @param {Array.<Asset>} dlqueue An array containing assets queued for download.
   * @param {number} dlsize The combined size of each asset in the download queue array.
   * @param {function(Asset)} callback Optional callback which is called when an asset finishes downloading.
   */
  constructor(dlqueue: Asset[], dlsize: number, callback?: (asset: Asset) => void) {
    this.dlqueue = dlqueue;
    this.dlsize = dlsize;
    this.callback = callback;
  }
}

/**
 * Central object class used for control flow. This object stores data about
 * categories of downloads. Each category is assigned an identifier with a
 * DLTracker object as its value. Combined information is also stored, such as
 * the total size of all the queued files in each category. This event is used
 * to emit events so that external modules can listen into processing done in
 * this module.
 */
export class AssetGuard extends EventEmitter {
  totaldlsize: number;
  progress: number;
  assets: DLTracker;
  libraries: DLTracker;
  files: DLTracker;
  forge: DLTracker;
  java: DLTracker;
  extractQueue: string[];
  commonPath: string;
  javaexec: string;
  /**
   * Create an instance of AssetGuard.
   * On creation the object's properties are never-null default
   * values. Each identifier is resolved to an empty DLTracker.
   *
   * @param {string} commonPath The common path for shared game files.
   * @param {string} javaexec The path to a java executable which will be used
   * to finalize installation.
   */
  constructor(commonPath: string, javaexec: string) {
    super();
    this.totaldlsize = 0;
    this.progress = 0;
    this.assets = new DLTracker([], 0);
    this.libraries = new DLTracker([], 0);
    this.files = new DLTracker([], 0);
    this.forge = new DLTracker([], 0);
    this.java = new DLTracker([], 0);
    this.extractQueue = [];
    this.commonPath = commonPath;
    this.javaexec = javaexec;
  }

  // Static Utility Functions
  // #region

  // Static Hash Validation Functions
  // #region

  /**
   * Calculates the hash for a file using the specified algorithm.
   *
   * @param {Buffer} buf The buffer containing file data.
   * @param {string} algo The hash algorithm.
   * @returns {string} The calculated hash in hex.
   */
  static _calculateHash(buf: Buffer | BinaryLike, algo: string) {
    return createHash(algo).update(buf).digest("hex");
  }

  /**
   * Used to parse a checksums file. This is specifically designed for
   * the checksums.sha1 files found inside the forge scala dependencies.
   *
   * @param {string} content The string content of the checksums file.
   * @returns {Object} An object with keys being the file names, and values being the hashes.
   */
  static _parseChecksumsFile(content: string) {
    const finalContent: Record<string, string> = {};
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const bits = lines[i].split(" ");
      if (bits[1] == null) {
        continue;
      }
      finalContent[bits[1]] = bits[0];
    }
    return finalContent;
  }

  /**
   * Validate that a file exists and matches a given hash value.
   *
   * @param {string} filePath The path of the file to validate.
   * @param {string} algo The hash algorithm to check against.
   * @param {string} hash The existing hash to check against.
   * @returns {boolean} True if the file exists and calculated hash matches the given hash, otherwise false.
   */
  static _validateLocal(filePath: string, algo: string, hash: string) {
    if (existsSync(filePath)) {
      //No hash provided, have to assume it's good.
      if (hash == null) {
        return true;
      }
      const buf = readFileSync(filePath);
      const calcdhash = AssetGuard._calculateHash(buf, algo);
      return calcdhash === hash.toLowerCase();
    }
    return false;
  }

  /**
   * Validates a file in the style used by forge's version index.
   *
   * @param {string} filePath The path of the file to validate.
   * @param {Array.<string>} checksums The checksums listed in the forge version index.
   * @returns {boolean} True if the file exists and the hashes match, otherwise false.
   */
  static _validateForgeChecksum(filePath: string, checksums: string | string[] | null) {
    if (existsSync(filePath)) {
      if (checksums == null || checksums.length === 0) {
        return true;
      }
      const buf = readFileSync(filePath);
      const calcdhash = AssetGuard._calculateHash(buf, "sha1");
      let valid = checksums.includes(calcdhash);
      if (!valid && filePath.endsWith(".jar")) {
        valid = AssetGuard._validateForgeJar(filePath, checksums);
      }
      return valid;
    }
    return false;
  }

  /**
   * Validates a forge jar file dependency who declares a checksums.sha1 file.
   * This can be an expensive task as it usually requires that we calculate thousands
   * of hashes.
   *
   * @param {Buffer} buf The buffer of the jar file.
   * @param {Array.<string>} checksums The checksums listed in the forge version index.
   * @returns {boolean} True if all hashes declared in the checksums.sha1 file match the actual hashes.
   */
  static _validateForgeJar(buf: string | Buffer | undefined, checksums: string | any[]) {
    // Double pass method was the quickest I found. I tried a version where we store data
    // to only require a single pass, plus some quick cleanup but that seemed to take slightly more time.

    const hashes: Record<string, string> = {};
    let expected: Record<string, string> = {};

    const zip = new AdmZip(buf);
    const zipEntries = zip.getEntries();

    //First pass
    for (let i = 0; i < zipEntries.length; i++) {
      const entry = zipEntries[i];
      if (entry.entryName === "checksums.sha1") {
        expected = AssetGuard._parseChecksumsFile(zip.readAsText(entry));
      }
      hashes[entry.entryName] = AssetGuard._calculateHash(entry.getData(), "sha1");
    }

    if (!checksums.includes(hashes["checksums.sha1"])) {
      return false;
    }

    //Check against expected
    const expectedEntries = Object.keys(expected);
    for (let i = 0; i < expectedEntries.length; i++) {
      if (expected[expectedEntries[i]] !== hashes[expectedEntries[i]]) {
        return false;
      }
    }
    return true;
  }

  // #endregion

  // Miscellaneous Static Functions
  // #region

  /**
   * Extracts and unpacks a file from .pack.xz format.
   *
   * @param {Array.<string>} filePaths The paths of the files to be extracted and unpacked.
   * @returns {Promise.<void>} An empty promise to indicate the extraction has completed.
   */
  static _extractPackXZ(filePaths: any[], javaExecutable: string): Promise<void> {
    console.log("[PackXZExtract] Starting");
    return new Promise((resolve) => {
      let libPath;
      if (isDev) {
        libPath = join(process.cwd(), "libraries", "java", "PackXZExtract.jar");
      } else {
        if (process.platform === "darwin") {
          libPath = join(process.cwd(), "Contents", "Resources", "libraries", "java", "PackXZExtract.jar");
        } else {
          libPath = join(process.cwd(), "resources", "libraries", "java", "PackXZExtract.jar");
        }
      }

      const filePath = filePaths.join(",");
      const child = spawn(javaExecutable, ["-jar", libPath, "-packxz", filePath]);
      child.stdout.on("data", (data) => {
        console.log("[PackXZExtract]", data.toString("utf8"));
      });
      child.stderr.on("data", (data) => {
        console.log("[PackXZExtract]", data.toString("utf8"));
      });
      child.on("close", (code, signal) => {
        console.log("[PackXZExtract]", "Exited with code", code);
        resolve();
      });
    });
  }

  /**
   * Install forge with ForgeCLI.
   *
   * @param {string} installerExec Forge Installer path.
   * @param {string} workDir directory which includes libraries and versions.
   * @param {string} forgeVersion Forge version.
   * @param {string} javaExecutable Java path.
   * @returns {Promise.<void>} An empty promise to indicate the extraction has completed.
   */
  static async _installForgeWithCLI(installerExec: string, workDir: string, javaExecutable: string): Promise<void> {
    console.log("[ForgeCLI] Starting");
    // Required for the installer to function.
    await writeFile(join(workDir, "launcher_profiles.json"), JSON.stringify({}));

    let libPath;
    if (isDev) {
      libPath = join(process.cwd(), "libraries", "java", "ForgeCLI.jar");
    } else {
      if (process.platform === "darwin") {
        // process.cwdでは正常にパスが取得できないので__dirnameで対応
        libPath = join(__dirname, "../../../..", "libraries", "java", "ForgeCLI.jar");
      } else {
        libPath = join(process.cwd(), "resources", "libraries", "java", "ForgeCLI.jar");
      }
    }

    const child = spawn(javaExecutable, ["-jar", libPath, "--installer", installerExec, "--target", workDir]);
    child.stdout.on("data", (data) => {
      console.log("[ForgeCLI]", data.toString("utf8"));
    });
    child.stderr.on("data", (data) => {
      console.log("[ForgeCLI]", data.toString("utf8"));
    });
    return new Promise((resolve, reject) => {
      child.on("close", (code, signal) => {
        console.log("[ForgeCLI]", "Exited with code", code);
        if (code === 0) resolve();
        else reject(`ForgeCUI exited with code ${code}`);
      });
    });
  }

  /**
   * Function which finalizes the forge installation process. This creates a 'version'
   * instance for forge and saves its version.json file into that instance. If that
   * instance already exists, the contents of the version.json file are read and returned
   * in a promise.
   *
   * @param {Asset} asset The Asset object representing Forge.
   * @param {string} commonPath The common path for shared game files.
   * @returns {Promise.<Object>} A promise which resolves to the contents of forge's version.json.
   */
  static _finalizeForgeAsset(asset: Asset, commonPath: string) {
    return new Promise((resolve, reject) => {
      readFile(asset.to, (err, data) => {
        const zip = new AdmZip(data);
        const zipEntries = zip.getEntries();

        for (let i = 0; i < zipEntries.length; i++) {
          if (zipEntries[i].entryName === "version.json") {
            const forgeVersion = JSON.parse(zip.readAsText(zipEntries[i]));
            const versionPath = join(commonPath, "versions", forgeVersion.id);
            const versionFile = join(versionPath, forgeVersion.id + ".json");
            if (!existsSync(versionFile)) {
              ensureDirSync(versionPath);
              writeFileSync(join(versionPath, forgeVersion.id + ".json"), zipEntries[i].getData());
              resolve(forgeVersion);
            } else {
              //Read the saved file to allow for user modifications.
              resolve(JSON.parse(readFileSync(versionFile, "utf-8")));
            }
            return;
          }
        }
        //We didn't find forge's version.json.
        reject("Unable to finalize Forge processing, version.json not found! Has forge changed their format?");
      });
    });
  }

  // #endregion

  // #endregion

  // Validation Functions
  // #region

  /**
   * Loads the version data for a given minecraft version.
   *
   * @param {string} version The game version for which to load the index data.
   * @param {boolean} force Optional. If true, the version index will be downloaded even if it exists locally. Defaults to false.
   * @returns {Promise.<Object>} Promise which resolves to the version data object.
   */
  async loadVersionData(version: string, force = false) {
    const versionPath = join(this.commonPath, "versions", version);
    const versionFile = join(versionPath, version + ".json");
    if (!existsSync(versionFile) || force) {
      const url = await this._getVersionDataUrl(version);
      //This download will never be tracked as it's essential and trivial.
      console.log("Preparing download of " + version + " assets.");
      ensureDirSync(versionPath);
      const stream = (await fetch(url)).body!.pipe(createWriteStream(versionFile));
      return new Promise((resolve) => {
        stream.on("finish", () => {
          resolve(JSON.parse(fs.readFileSync(versionFile).toString()));
        });
      });
    } else {
      return JSON.parse(fs.readFileSync(versionFile).toString());
    }
  }

  /**
   * Parses Mojang's version manifest and retrieves the url of the version
   * data index.
   *
   * @param {string} version The version to lookup.
   * @returns {Promise.<string>} Promise which resolves to the url of the version data index.
   * If the version could not be found, resolves to null.
   */
  async _getVersionDataUrl(version: any) {
    const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    const manifest = (await response.json()) as any;

    for (const v of manifest.versions) {
      if (v.id === version) {
        return v.url;
      }
    }

    return null;
  }

  // Asset (Category=''') Validation Functions
  // #region

  /**
   * Public asset validation function. This function will handle the validation of assets.
   * It will parse the asset index specified in the version data, analyzing each
   * asset entry. In this analysis it will check to see if the local file exists and is valid.
   * If not, it will be added to the download queue for the 'assets' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  async validateAssets(versionData: VersionData112 | VersionData113, force = false) {
    await this._assetChainIndexData(versionData, force);
  }

  //Chain the asset tasks to provide full async. The below functions are private.
  /**
   * Private function used to chain the asset validation process. This function retrieves
   * the index data.
   * @param {Object} versionData
   * @param {boolean} force
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  async _assetChainIndexData(versionData: { assetIndex: any; id: string }, force = false) {
    //Asset index constants.
    const assetIndex = versionData.assetIndex;
    const name = assetIndex.id + ".json";
    const indexPath = join(this.commonPath, "assets", "indexes");
    const assetIndexLoc = join(indexPath, name);

    let data = null;
    if (!existsSync(assetIndexLoc) || force) {
      console.log("Downloading " + versionData.id + " asset index.");
      ensureDirSync(indexPath);
      const stream = (await fetch(assetIndex.url)).body!.pipe(createWriteStream(assetIndexLoc));
      return new Promise<void>((resolve) => {
        stream.on("finish", async () => {
          data = JSON.parse(readFileSync(assetIndexLoc, "utf-8"));
          await this._assetChainValidateAssets(versionData, data);
          resolve();
        });
      });
    } else {
      data = JSON.parse(readFileSync(assetIndexLoc, "utf-8"));
      await this._assetChainValidateAssets(versionData, data);
      return;
    }
  }

  /**
   * Private function used to chain the asset validation process. This function processes
   * the assets and enqueues missing or invalid files.
   * @param {Object} versionData
   * @param {boolean} force
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  async _assetChainValidateAssets(versionData: any, indexData: any) {
    console.log("_assetChainValidateAssets");
    //Asset constants
    const resourceURL = "https://resources.download.minecraft.net/";
    const localPath = join(this.commonPath, "assets");
    const objectPath = join(localPath, "objects");

    const assetDlQueue: Asset[] = [];
    let dlSize = 0;
    let acc = 0;
    const total = Object.keys(indexData.objects).length;
    //const objKeys = Object.keys(data.objects)
    await forEachOfLimit(Object.values(indexData.objects), 10, async (value: any, key) => {
      acc++;
      this.emit("progress", "assets", acc, total);
      const hash = value.hash;
      const assetName = join(hash.substring(0, 2), hash);
      const urlName = hash.substring(0, 2) + "/" + hash;
      const ast = new Asset(key, hash, value.size, resourceURL + urlName, join(objectPath, assetName));
      if (!AssetGuard._validateLocal(ast.to, "sha1", ast.hash)) {
        dlSize += ast.size * 1;
        assetDlQueue.push(ast);
      }
    });
    this.assets = new DLTracker(assetDlQueue, dlSize);
  }

  // #endregion

  // Library (Category=''') Validation Functions
  // #region

  /**
   * Public library validation function. This function will handle the validation of libraries.
   * It will parse the version data, analyzing each library entry. In this analysis, it will
   * check to see if the local file exists and is valid. If not, it will be added to the download
   * queue for the 'libraries' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @returns {Promise.<DLTracker>} An DLTracker for download queue.
   */
  async validateLibraries(versionData: VersionData112 | VersionData113) {
    const libArr = versionData.libraries;
    const libPath = join(this.commonPath, "libraries");

    const libDlQueue: any[] = [];
    let dlSize = 0;

    //Check validity of each library. If the hashs don't match, download the library.
    await forEachOfLimit(libArr as any[], 5, async (lib) => {
      if (validateRules(lib.rules, lib.natives)) {
        const artifact =
          lib.natives == null
            ? lib.downloads.artifact
            : lib.downloads.classifiers[
                lib.natives[mojangFriendlyOS()].replace("${arch}", process.arch.replace("x", ""))
              ];
        const libItm = new Asset(lib.name, artifact.sha1, artifact.size, artifact.url, join(libPath, artifact.path));
        if (!AssetGuard._validateLocal(libItm.to, "sha1", libItm.hash)) {
          dlSize += libItm.size * 1;
          libDlQueue.push(libItm);
        }
      }
    });
    return new DLTracker(libDlQueue, dlSize);
  }

  // #endregion

  // Miscellaneous (Category=files) Validation Functions
  // #region

  /**
   * Public miscellaneous mojang file validation function. These files will be enqueued under
   * the 'files' identifier.
   *
   * @param {Object} versionData The version data for the assets.
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  async validateMiscellaneous(versionData: VersionData112 | VersionData113) {
    await this.validateClient(versionData);
    await this.validateLogConfig(versionData);
  }

  /**
   * Validate client file - artifact renamed from client.jar to '{version}'.jar.
   *
   * @param {Object} versionData The version data for the assets.
   * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  validateClient(versionData: { downloads: { client: any }; id: any }, force = false) {
    const clientData = versionData.downloads.client;
    const version = versionData.id;
    const targetPath = join(this.commonPath, "versions", version);
    const targetFile = version + ".jar";

    const client = new Asset(
      version + " client",
      clientData.sha1,
      clientData.size,
      clientData.url,
      join(targetPath, targetFile)
    );

    if (!AssetGuard._validateLocal(client.to, "sha1", client.hash) || force) {
      this.files.dlqueue.push(client);
      this.files.dlsize += client.size * 1;
      return;
    } else {
      return;
    }
  }

  /**
   * Validate log config.
   *
   * @param {Object} versionData The version data for the assets.
   * @param {boolean} force Optional. If true, the asset index will be downloaded even if it exists locally. Defaults to false.
   * @returns {Promise.<void>} An empty promise to indicate the async processing has completed.
   */
  validateLogConfig(versionData: { logging: { client: any } }) {
    const client = versionData.logging.client;
    const file = client.file;
    const targetPath = join(this.commonPath, "assets", "log_configs");

    const logConfig = new Asset(file.id, file.sha1, file.size, file.url, join(targetPath, file.id));

    if (!AssetGuard._validateLocal(logConfig.to, "sha1", logConfig.hash)) {
      this.files.dlqueue.push(logConfig);
      this.files.dlsize += logConfig.size * 1;
      return;
    } else {
      return;
    }
  }

  // #endregion

  // Distribution (Category=forge) Validation Functions
  // #region

  /**
   * Validate the distribution.
   *
   * @param {Server} server The Server to validate.
   * @returns {Promise.<Object>} A promise which resolves to the server distribution object.
   */
  validateDistribution(server: Server) {
    this.forge = this._parseDistroModules(server.modules, server.minecraftVersion, server.id);
    return server;
  }

  _parseDistroModules(modules: Module[], version: string, servid: string) {
    let alist: Asset[] = [];
    let asize = 0;
    for (const ob of modules) {
      const obArtifact = ob.artifact;
      const obPath = ob.artifactPath;
      const artifact = new Asset(ob.id, obArtifact.MD5, obArtifact.size, obArtifact.url, obPath);
      const validationPath = obPath.toLowerCase().endsWith(".pack.xz")
        ? obPath.substring(0, obPath.toLowerCase().lastIndexOf(".pack.xz"))
        : obPath;
      if (!AssetGuard._validateLocal(validationPath, "MD5", artifact.hash)) {
        asize += artifact.size * 1;
        alist.push(artifact);
        if (validationPath !== obPath) this.extractQueue.push(obPath);
      }
      //Recursively process the submodules then combine the results.
      if (ob.subModules != null) {
        const dltrack: DLTracker = this._parseDistroModules(ob.subModules, version, servid);
        asize += dltrack.dlsize * 1;
        alist = alist.concat(dltrack.dlqueue);
      }
    }

    return new DLTracker(alist, asize);
  }

  /**
   * 手動ダウンロードのファイルをリストアップし、ユーザーにダウンロードを促します
   *
   * @param {string} server The Server to load Forge data for.
   * @returns {Promise.<Object>} A promise which resolves to Forge's version.json data.
   */
  async loadManualData(server: Server) {
    function isModEnabled(modCfg: ModSettingValue, required: Required | null = null) {
      return modCfg != null
        ? (typeof modCfg === "boolean" && modCfg) ||
            (typeof modCfg === "object" && (typeof modCfg.value !== "undefined" ? modCfg.value : true))
        : required != null
        ? required.def
        : true;
    }

    // 有効化されているかチェックするために必要
    const modCfg = ConfigManager.getModsSetting(server.id)!.mods;
    const mdls = server.modules;

    // 手動ダウンロードMod候補
    const manualModsCandidate: any[] = [];
    // ON以外の手動Modは除外する
    const removeCandidate: any[] = [];
    mdls.forEach((mdl: Module, index: any, object: any) => {
      const artifact = mdl.artifact;
      const manual = artifact.manual;
      // 手動Modかどうか
      if (manual !== undefined) {
        // ONかどうか
        const o = !mdl.required.value;
        const e = isModEnabled(modCfg[mdl.versionLessID], mdl.required);
        if (!o || (o && e)) {
          manualModsCandidate.push(mdl);
        } else {
          removeCandidate.push(index);
        }
      }
    });
    // 除外された手動Modはリストから削除
    for (let i = removeCandidate.length - 1; i >= 0; i--) mdls.splice(removeCandidate[i], 1);

    // 手動候補のModは存在を確認し、手動Modリストに追加
    const manualMods = [];
    for (const mdl of manualModsCandidate) {
      const artifact = mdl.artifact;
      if (!(await pathExists(artifact.getPath()))) {
        manualMods.push(artifact);
      }
    }
    return manualMods;
  }

  /**
   * Loads Forge's version.json data into memory for the specified server id.
   *
   * @param {string} server The Server to load Forge data for.
   * @returns {Promise.<Object>} A promise which resolves to Forge's version.json data.
   */
  async loadForgeData(server: Server) {
    const modules = server.modules;
    for (const ob of modules) {
      const type = ob.type;
      if (type === Types.Forge) {
        if (isForgeGradle3(server.minecraftVersion, ob.artifactVersion)) {
          const forgeVer = ob.artifactVersion.split("-");
          const forgeVersion = `${forgeVer[0]}-forge-${forgeVer[1]}`;
          const forgeManifest = join(this.commonPath, "versions", forgeVersion, `${forgeVersion}.json`);
          if (existsSync(forgeManifest)) {
            const manifest = JSON.parse(readFileSync(forgeManifest, "utf-8"));
            const dlTracker = await this.validateLibraries(manifest);
            if (dlTracker.dlqueue.length === 0) {
              return manifest;
            }
          }

          this.emit("validate", "install", 1, 1);
          await AssetGuard._installForgeWithCLI(ob.artifactPath, this.commonPath, this.javaexec);
          this.emit("complete", "install");
          if (existsSync(forgeManifest)) {
            return JSON.parse(readFileSync(forgeManifest, "utf-8"));
          }

          throw "No forge version manifest found!";
        }
      } else if (type === Types.ForgeHosted) {
        if (isForgeGradle3(server.minecraftVersion, ob.artifactVersion)) {
          // Read Manifest
          for (const sub of ob.subModules!) {
            if (sub.type === Types.VersionManifest) {
              return JSON.parse(readFileSync(sub.artifactPath, "utf-8"));
            }
          }
          throw "No forge version manifest found!";
        } else {
          const obArtifact = ob.artifact;
          const obPath = ob.artifactPath;
          const asset = new Asset(ob.id, obArtifact.MD5, obArtifact.size, obArtifact.url, obPath);
          const forgeData = await AssetGuard._finalizeForgeAsset(asset, this.commonPath);
          return forgeData;
        }
      }
    }
    throw "No forge module found!";
  }

  _parseForgeLibraries() {
    /* TODO
     * Forge asset validations are already implemented. When there's nothing much
     * to work on, implement forge downloads using forge's version.json. This is to
     * have the code on standby if we ever need it (since it's half implemented already).
     */
  }

  // #endregion

  // Java (Category=''') Validation (download) Functions
  // #region

  // _enqueueOpenJDK(dataDir: string) {
  //   return new Promise((resolve, reject) => {
  //     JavaGuard._latestOpenJDK("8").then((verData: { name: string; size: number; uri: string } | null) => {
  //       if (verData != null) {
  //         dataDir = join(dataDir, "runtime", "x64");
  //         const fDir = join(dataDir, verData.name);
  //         const jre = new Asset(verData.name, null, verData.size, verData.uri, fDir);
  //         this.java = new DLTracker(
  //           [jre],
  //           jre.size,
  //           (a: { to: PathLike | undefined }, self: { emit: (arg0: string, arg1: string, arg2: any) => void }) => {
  //             if (verData.name.endsWith("zip")) {
  //               const zip = new AdmZip(a.to);
  //               const pos = join(dataDir, zip.getEntries()[0].entryName);
  //               zip.extractAllToAsync(dataDir, true, (err: any) => {
  //                 if (err) {
  //                   console.log(err);
  //                   self.emit("complete", "java", JavaGuard.javaExecFromRoot(pos));
  //                 } else {
  //                   unlink(a.to, (err) => {
  //                     if (err) {
  //                       console.log(err);
  //                     }
  //                     self.emit("complete", "java", JavaGuard.javaExecFromRoot(pos));
  //                   });
  //                 }
  //               });
  //             } else {
  //               // Tar.gz
  //               let h: string | null = null;
  //               createReadStream(a.to)
  //                 .on("error", (err) => console.log(err))
  //                 .pipe(createGunzip())
  //                 .on("error", (err) => console.log(err))
  //                 .pipe(
  //                   extract(dataDir, {
  //                     map: (header: { name: any }) => {
  //                       if (h == null) {
  //                         h = header.name;
  //                       }
  //                     },
  //                   })
  //                 )
  //                 .on("error", (err: any) => console.log(err))
  //                 .on("finish", () => {
  //                   unlink(a.to, (err) => {
  //                     if (err) {
  //                       console.log(err);
  //                     }
  //                     if (h.indexOf("/") > -1) {
  //                       h = h.substring(0, h.indexOf("/"));
  //                     }
  //                     const pos = join(dataDir, h);
  //                     self.emit("complete", "java", JavaGuard.javaExecFromRoot(pos));
  //                   });
  //                 });
  //             }
  //           }
  //         );
  //         resolve(true);
  //       } else {
  //         resolve(false);
  //       }
  //     });
  //   });
  // }

  /**
   * Initiate an async download process for an AssetGuard DLTracker.
   *
   * @param {string} identifier The identifier of the AssetGuard DLTracker.
   * @param {number} limit Optional. The number of async processes to run in parallel.
   * @returns {boolean} True if the process began, otherwise false.
   */
  startAsyncProcess(identifier: string, limit = 5) {
    // @ts-expect-error aaa
    const dlTracker = this[identifier];
    const dlQueue = dlTracker.dlqueue;

    if (dlQueue.length > 0) {
      console.log("DLQueue");

      forEachOfLimit(dlQueue, limit, async (asset: Asset) => {
        ensureDirSync(join(asset.to, ".."));

        const req = (await fetch(asset.from)).body!;
        req.pause();

        req.on("response", (resp: { statusCode: number; headers: { [x: string]: string } }) => {
          if (resp.statusCode === 200) {
            let doHashCheck = false;
            const contentLength = parseInt(resp.headers["content-length"]);

            if (contentLength !== asset.size) {
              console.log(`WARN: Got ${contentLength} bytes for ${asset.id}: Expected ${asset.size}`);
              doHashCheck = true;

              // Adjust download
              this.totaldlsize -= asset.size;
              this.totaldlsize += contentLength;
            }

            const writeStream = createWriteStream(asset.to);
            writeStream.on("close", () => {
              if (dlTracker.callback != null) {
                dlTracker.callback.apply(dlTracker, [asset, self]);
              }

              if (doHashCheck) {
                // @ts-expect-error aaa
                const v = AssetGuard._validateLocal(asset.to, asset.type != null ? "md5" : "sha1", asset.hash);
                if (v) {
                  console.log(`Hashes match for ${asset.id}, byte mismatch is an issue in the distro index.`);
                } else {
                  console.error(`Hashes do not match, ${asset.id} may be corrupted.`);
                }
              }

              return;
            });
            req.pipe(writeStream);
            req.resume();
          } else {
            console.log(
              `Failed to download ${asset.id}(${
                // @ts-expect-error aaa
                typeof asset.from === "object" ? asset.from.url : asset.from
              }). Response code ${resp.statusCode}`
            );
            this.progress += asset.size * 1;
            this.emit("progress", "download", this.progress, this.totaldlsize);
            return;
          }
        });

        req.on("error", (err: any) => {
          this.emit("error", "download", err);
        });

        req.on("data", (chunk: string | any[]) => {
          this.progress += chunk.length;
          this.emit("progress", "download", this.progress, this.totaldlsize);
        });
      }).then(() => {
        // if (err) {
        //   console.log("An item in " + identifier + " failed to process");
        // } else {
        //   console.log("All " + identifier + " have been processed successfully");
        // }

        //self.totaldlsize -= dlTracker.dlsize
        //self.progress -= dlTracker.dlsize
        // @ts-expect-error aaa
        this[identifier] = new DLTracker([], 0);

        if (this.progress >= this.totaldlsize) {
          if (this.extractQueue.length > 0) {
            this.emit("progress", "extract", 1, 1);
            //this.emit('extracting')
            AssetGuard._extractPackXZ(this.extractQueue, this.javaexec).then(() => {
              this.extractQueue = [];
              this.emit("complete", "download");
            });
          } else {
            this.emit("complete", "download");
          }
        }
      });

      return true;
    } else {
      return false;
    }
  }

  /**
   * This function will initiate the download processed for the specified identifiers. If no argument is
   * given, all identifiers will be initiated. Note that in order for files to be processed you need to run
   * the processing function corresponding to that identifier. If you run this function without processing
   * the files, it is likely nothing will be enqueued in the object and processing will complete
   * immediately. Once all downloads are complete, this function will fire the 'complete' event on the
   * global object instance.
   *
   * @param {Array.<{id: string, limit: number}>} identifiers Optional. The identifiers to process and corresponding parallel async task limit.
   */
  processDlQueues(
    identifiers = [
      { id: "assets", limit: 20 },
      { id: "libraries", limit: 5 },
      { id: "files", limit: 5 },
      { id: "forge", limit: 5 },
    ]
  ) {
    return new Promise<void>((resolve) => {
      let shouldFire = true;

      // Assign dltracking variables.
      this.totaldlsize = 0;
      this.progress = 0;

      for (const iden of identifiers) {
        // @ts-expect-error aaa
        this.totaldlsize += this[iden.id].dlsize;
      }

      this.once("complete", (data) => {
        resolve();
      });

      for (const iden of identifiers) {
        const r = this.startAsyncProcess(iden.id, iden.limit);
        if (r) shouldFire = false;
      }

      if (shouldFire) {
        this.emit("complete", "download");
      }
    });
  }

  async validateEverything(serverid: any, dev = false) {
    try {
      const dI = DistroManager.getDistribution()!;

      const server = dI.getServer(serverid)!;

      // Validate Everything
      this.emit("validate", "manual");
      const manualData = await this.loadManualData(server);
      if (manualData.length > 0) {
        return {
          versionData: null,
          forgeData: null,
          manualData,
          error: "Manual Installation Required",
        };
      }

      await this.validateDistribution(server);
      console.log("validate", "distribution");
      this.emit("validate", "distribution");
      const versionData = await this.loadVersionData(server.minecraftVersion);
      console.log("validate", "version");
      this.emit("validate", "version");
      await this.validateAssets(versionData);
      console.log("validate", "assets");
      this.emit("validate", "assets");
      this.libraries = await this.validateLibraries(versionData);
      console.log("validate", "libraries");
      this.emit("validate", "libraries");
      await this.validateMiscellaneous(versionData);
      console.log("validate", "files");
      this.emit("validate", "files");
      await this.processDlQueues();
      //this.emit('complete', 'download')
      const forgeData = await this.loadForgeData(server);

      return {
        versionData,
        forgeData,
      };
    } catch (err) {
      return {
        versionData: null,
        forgeData: null,
        error: err,
      };
    }
  }

  // #endregion
}
