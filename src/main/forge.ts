import AdmZip from "adm-zip";
import { app } from "electron";
import path from "path";
import { ConfigManager } from "./config/configManager";
import { Types } from "./distribution/constatnts";
import { Server } from "./distribution/server";
import { validateLibraries } from "./downloader/validator";
import { getJDKPath, isDev, isForgeGradle3, isMac } from "./utils/util";
import { ForgeData112 } from "./versionManifest/forgeData112";
import { ForgeData113 } from "./versionManifest/forgeData113";
import fs from "fs-extra";
import { Asset } from "./downloader/asset";
import childProcess from "child_process";

export async function loadForgeData(server: Server): Promise<ForgeData112 | ForgeData113> {
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
          ob.artifact.path,
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
            return JSON.parse(fs.readFileSync(sub.artifact.path, "utf-8"));
          }
        }
        throw "No forge version manifest found!";
      } else {
        const obArtifact = ob.artifact;
        const obPath = ob.artifact.path;
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
      libPath = path.join(app.getAppPath(), "libraries", "java", "ForgeCLI.jar");
    } else {
      if (isMac) {
        // process.cwdでは正常にパスが取得できないので__dirnameで対応
        libPath = path.join(app.getAppPath(), "libraries", "java", "ForgeCLI.jar");
      } else {
        libPath = path.join(app.getAppPath(), "libraries", "java", "ForgeCLI.jar");
      }
    }
    console.log(libPath, installerExec, workDir);
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
