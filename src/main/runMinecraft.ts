import path from "path";
import { ConfigManager } from "./config/configManager";
import axios from "axios";
import fs from "fs-extra";
import { DistroManager } from "./distribution/distroManager";
import { getVersionUrl } from "./api/mojang";
import fetch from "node-fetch";
import crypto from "crypto";
import { IpcMainEvent, WebContents } from "electron";
import { VersionData112 } from "./versionManifest/versionData112";
import { VersionData113 } from "./versionManifest/versionData113";
import { forEachOfLimit, getJDKPath, isDev, isForgeGradle3, isMac, mojangFriendlyOS } from "./utils/util";
import { validateRules } from "./jvmArgBuilder/helper";
import { ForgeData112 } from "./versionManifest/forgeData112";
import { ForgeData113 } from "./versionManifest/forgeData113";
import AdmZip from "adm-zip";
import childProcess from "child_process";
import { Module, Server } from "./distribution/classes";
import { Types } from "./distribution/constatnts";
import { ProcessBuilder } from "./processbuilder";
import electron from "electron";

async function loadVersionData(version: string) {
  const versionPath = ConfigManager.getLauncherSetting().getDataDirectory().common.versions.$join(version);
  const versionFile = path.join(versionPath + ".json");
  if (!fs.existsSync(versionFile)) {
    const url = await getVersionUrl(version);
    //This download will never be tracked as it's essential and trivial.
    console.log("Preparing download of " + version + " assets.");
    fs.ensureDirSync(versionPath);
    const response = await axios.get(url);
    const data = response.data;
    fs.writeFileSync(versionFile, JSON.stringify(data));
    return data;
  } else {
    return JSON.parse(fs.readFileSync(versionFile).toString());
  }
}
async function validateAssets(versionData: VersionData112 | VersionData113) {
  const assetIndex = versionData.assetIndex;
  const name = assetIndex.id + ".json";
  const indexPath = ConfigManager.getLauncherSetting().getDataDirectory().common.assets.indexes;
  const assetIndexLoc = indexPath.$join(name);

  let data;
  if (!fs.existsSync(assetIndexLoc)) {
    console.log("Downloading " + versionData.id + " asset index.");
    fs.ensureDirSync(indexPath.$path);
    const response = await axios.get(assetIndex.url);
    data = response.data;
    fs.writeFileSync(assetIndexLoc, JSON.stringify(data));
  } else {
    data = JSON.parse(fs.readFileSync(assetIndexLoc, "utf-8"));
  }
  return await _assetChainValidateAssets(versionData, data);
}

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
async function _assetChainValidateAssets(
  versionData: VersionData112 | VersionData113,
  indexData: { objects: Record<string, any> }
) {
  //Asset constants
  const resourceURL = "https://resources.download.minecraft.net/";
  const localPath = ConfigManager.getLauncherSetting().getDataDirectory().common.assets;

  const assetDlQueue: Asset[] = [];
  let dlSize = 0;
  let acc = 0;
  await forEachOfLimit(Object.keys(indexData.objects), 10, async (value) => {
    acc++;
    const hash = indexData.objects[value].hash;
    const assetName = path.join(hash.substring(0, 2), hash);
    const urlName = hash.substring(0, 2) + "/" + hash;
    const ast = new Asset(
      value,
      hash,
      indexData.objects[value].size,
      resourceURL + urlName,
      localPath.objects.$join(assetName)
    );
    if (!_validateLocal(ast.to, "sha1", ast.hash)) {
      dlSize += ast.size * 1;
      assetDlQueue.push(ast);
    }
  });
  return new DLTracker(assetDlQueue, dlSize);
}

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
function _validateLocal(filePath: string, algo: string, hash: string): boolean {
  if (filePath == null) return false;
  if (!fs.existsSync(filePath)) return false;
  //No hash provided, have to assume it's good.
  if (hash == null) return true;

  const buf = fs.readFileSync(filePath);
  const calcdhash = _calculateHash(buf, algo);
  return calcdhash === hash.toLowerCase();
}
function _calculateHash(buf: Buffer, algo: string) {
  return crypto.createHash(algo).update(buf).digest("hex");
}
export async function runMinecraft(event: IpcMainEvent) {
  const distribution = await DistroManager.INSTANCE.load();
  const selectedServer = ConfigManager.INSTANCE.config.selectedServer;
  const server = distribution.servers.find((server) => server.id == selectedServer) || distribution.servers[0];
  if (!server) {
    // サーバーが選択されてない時の処理
    throw new Error("サーバーが選択されていません");
  }
  const manualArtifact = server?.modules.map((module) => module.artifact).filter((artifact) => !!artifact.manual);
  if (manualArtifact.length > 0) {
    // マニュアルmodをインストールさせる
    throw new Error();
  }
  // サイズを図ってthis.forgeに入れる;
  const [forge, extractQueue] = validateDistribution(server);
  // .numalauncherに指定バージョンのマイクラのjsonがあるか調べる
  const versionData = await loadVersionData(server.minecraftVersion);
  // サイズを図ってthis.assetsに入れる
  const assets = await validateAssets(versionData);
  //   // サイズを図ってthis.librariesに入れる
  const libraries = await validateLibraries(versionData);
  //   // サイズを図ってthis.filesに入れる
  const files = await validateMiscellaneous(versionData);
  processDLQueues(event.sender, [
    { dltracker: forge, limit: 20 },
    { dltracker: assets, limit: 20 },
    { dltracker: libraries, limit: 5 },
    { dltracker: files, limit: 5 },
  ] as { dltracker: DLTracker; limit: number }[]);
  const forgeData = await loadForgeData(server);
  const authUser = ConfigManager.INSTANCE.getSelectedAccount();
  const pb = new ProcessBuilder(server, versionData, forgeData, authUser, electron.app.getVersion());
  pb.build();
}

async function validateLibraries(versionData: VersionData112 | VersionData113) {
  const libArr = versionData.libraries;

  const libDlQueue: Asset[] = [];
  let dlSize = 0;

  await forEachOfLimit(
    libArr as (VersionData112["libraries"][0] | VersionData113["libraries"][0])[],
    5,
    async (lib) => {
      if (!("natives" in lib) || validateRules(lib.rules, lib.natives)) {
        const artifact =
          !("natives" in lib) || lib.natives == null
            ? lib.downloads.artifact
            : lib.downloads.classifiers[
                lib.natives[mojangFriendlyOS()]?.replace("${arch}", process.arch.replace("x", "")) || ""
              ];
        const libItm = new Asset(
          lib.name,
          artifact.sha1,
          artifact.size,
          artifact.url,
          ConfigManager.getLauncherSetting().getDataDirectory().common.versions.libraries.$join(artifact.path)
        );
        if (!_validateLocal(libItm.to, "sha1", libItm.hash)) {
          dlSize += libItm.size * 1;
          libDlQueue.push(libItm);
        }
      }
    }
  );
  return new DLTracker(libDlQueue, dlSize);
}
function validateMiscellaneous(versionData: VersionData112 | VersionData113) {
  const baseDltracker = new DLTracker([], 0);
  const dltrackers = [validateClient(versionData), validateLogConfig(versionData)];
  dltrackers.forEach((dltracker) => {
    if (!dltracker) return;
    baseDltracker.dlqueue = baseDltracker.dlqueue.concat(dltracker.dlqueue);
    baseDltracker.dlsize += dltracker.dlsize;
  });

  return baseDltracker;
}
function validateLogConfig(versionData: VersionData112 | VersionData113) {
  const client = versionData.logging.client;
  const file = client.file;

  const logConfig = new Asset(
    file.id,
    file.sha1,
    file.size,
    file.url,
    ConfigManager.getLauncherSetting().getDataDirectory().common.assets.log_configs.$join(file.id)
  );

  if (!_validateLocal(logConfig.to, "sha1", logConfig.hash)) {
    return new DLTracker([logConfig], logConfig.size * 1);
  }
}
function validateClient(versionData: VersionData112 | VersionData113) {
  const clientData = versionData.downloads.client;
  const version = versionData.id;

  const client = new Asset(
    version + " client",
    clientData.sha1,
    clientData.size,
    clientData.url,
    ConfigManager.getLauncherSetting()
      .getDataDirectory()
      .common.versions.$join(version, version + ".jar")
  );

  if (!_validateLocal(client.to, "sha1", client.hash)) {
    return new DLTracker([client], client.size * 1);
  }
}
function validateDistribution(server: Server) {
  const extractQueue: string[] = [];
  function parse(modules: Module[]) {
    let alist: Asset[] = [];
    let asize = 0;
    for (const ob of modules) {
      const obArtifact = ob.artifact;
      const obPath = ob.artifactPath;
      const asset = new Asset(ob.id, obArtifact.MD5, obArtifact.size, obArtifact.url, obPath);
      const validationPath = obPath?.toLowerCase().endsWith(".pack.xz")
        ? obPath.substring(0, obPath.toLowerCase().lastIndexOf(".pack.xz"))
        : obPath;
      if (!_validateLocal(validationPath, "MD5", asset.hash)) {
        asize += asset.size * 1;
        alist.push(asset);
        if (validationPath !== obPath) extractQueue.push(obPath);
      }
      //Recursively process the submodules then combine the results.
      if (ob.subModules != null) {
        const dltrack = parse(ob.subModules);
        asize += dltrack.dlsize * 1;
        alist = alist.concat(dltrack.dlqueue);
      }
    }
    return new DLTracker(alist, asize);
  }
  return [parse(server.modules), extractQueue];
}
function processDLQueues(sender: WebContents, dltrackerData: { dltracker: DLTracker; limit: number }[]) {
  let progress = 0;
  let totalSize = 0;
  dltrackerData.forEach((item) => {
    totalSize += item.dltracker.dlsize;
    forEachOfLimit(item.dltracker.dlqueue, item.limit, async (asset) => {
      fs.ensureDirSync(path.join(asset.to, ".."));
      const response = await fetch(asset.from);
      const size = Number(response.headers.get("content-length"));
      if (asset.size != size) {
        totalSize = -asset.size + size;
      }
      const writeStream = fs.createWriteStream(asset.to);
      response.body?.pipe(writeStream);
      response.body?.on("data", (chunk) => {
        progress += chunk.length;
        // sender.send(RendererChannel.RUN_MINECRAFT_EMITTER, "progress", {
        //   progress,
        //   totalSize,
        // });
      });
    });
  });
}

async function loadForgeData(server: Server): Promise<ForgeData112 | ForgeData113> {
  const modules = server.modules;
  for (const ob of modules) {
    const type = ob.type;
    if (type === Types.Forge) {
      if (isForgeGradle3(server.minecraftVersion, ob.artifactVersion)) {
        const forgeVer = ob.artifactVersion.split("-");
        const forgeVersion = `${forgeVer[0]}-forge-${forgeVer[1]}`;
        const forgeManifest = ConfigManager.getLauncherSetting()
          .getDataDirectory()
          .common.versions.$join(forgeVersion, `${forgeVersion}.json`);
        if (fs.existsSync(forgeManifest)) {
          const manifest = JSON.parse(fs.readFileSync(forgeManifest, "utf-8"));
          const dlTracker = await validateLibraries(manifest);
          if (dlTracker.dlqueue.length === 0) {
            return manifest;
          }
        }

        await _installForgeWithCLI(
          ob.artifactPath,
          ConfigManager.getLauncherSetting().getDataDirectory().common.$path,
          getJDKPath()
        );
        if (fs.existsSync(forgeManifest)) {
          return JSON.parse(fs.readFileSync(forgeManifest, "utf-8"));
        }

        throw "No forge version manifest found!";
      }
    } else if (type === Types.ForgeHosted) {
      if (isForgeGradle3(server.minecraftVersion, ob.artifactVersion)) {
        // Read Manifest
        for (const sub of ob.subModules || []) {
          if (sub.type === Types.VersionManifest) {
            return JSON.parse(fs.readFileSync(sub.artifactPath, "utf-8"));
          }
        }
        throw "No forge version manifest found!";
      } else {
        const obArtifact = ob.artifact;
        const obPath = ob.artifactPath;
        const asset = new Asset(ob.id, obArtifact.MD5, obArtifact.size, obArtifact.url, obPath);
        const forgeData = await unzipForgeVersionData(asset);
        return forgeData;
      }
    }
  }
  throw "No forge module found!";
}

async function unzipForgeVersionData(asset: Asset) {
  const data = fs.readFileSync(asset.to);
  const zip = new AdmZip(data);
  const zipEntries = zip.getEntries();

  for (let i = 0; i < zipEntries.length; i++) {
    if (zipEntries[i].entryName === "version.json") {
      const forgeVersion = JSON.parse(zip.readAsText(zipEntries[i]));
      const versionPath = ConfigManager.getLauncherSetting().getDataDirectory().common.versions.$join(forgeVersion.id);
      const versionFile = path.join(versionPath, forgeVersion.id + ".json");
      if (!fs.existsSync(versionFile)) {
        fs.ensureDirSync(versionPath);
        fs.writeFileSync(path.join(versionPath, forgeVersion.id + ".json"), zipEntries[i].getData());
        return forgeVersion;
      } else {
        //Read the saved file to allow for user modifications.
        return JSON.parse(fs.readFileSync(versionFile, "utf-8"));
      }
    }
  }
  //We didn't find forge's version.json.
  throw "Unable to finalize Forge processing, version.json not found! Has forge changed their format?";
}

async function _installForgeWithCLI(installerExec: string, workDir: string, javaExecutable: string): Promise<void> {
  console.log("[ForgeCLI] Starting");
  return new Promise((resolve, reject) => {
    // Required for the installer to function.
    fs.writeFileSync(path.join(workDir, "launcher_profiles.json"), JSON.stringify({}));

    let libPath;
    if (isDev) {
      libPath = path.join(process.cwd(), "libraries", "java", "ForgeCLI.jar");
    } else {
      if (isMac) {
        // process.cwdでは正常にパスが取得できないので__dirnameで対応
        libPath = path.join(__dirname, "../../../..", "libraries", "java", "ForgeCLI.jar");
      } else {
        libPath = path.join(process.cwd(), "resources", "libraries", "java", "ForgeCLI.jar");
      }
    }

    const child = childProcess.spawn(javaExecutable, [
      "-jar",
      libPath,
      "--installer",
      installerExec,
      "--target",
      workDir,
    ]);
    child.stdout.on("data", (data) => {
      console.log("[ForgeCLI]", data.toString("utf8"));
    });
    child.stderr.on("data", (data) => {
      console.log("[ForgeCLI]", data.toString("utf8"));
    });
    child.on("close", (code, signal) => {
      console.log("[ForgeCLI]", "Exited with code", code);
      if (code === 0) resolve();
      else reject(`ForgeCUI exited with code ${code}`);
    });
  });
}
