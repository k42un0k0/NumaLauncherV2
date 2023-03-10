import { Types } from "@/main/entities/distribution/constatnts";
import { Server } from "@/main/entities/distribution/server";
import { ForgeData112 } from "@/main/entities/versionManifest/forgeData112";
import { ForgeData113 } from "@/main/entities/versionManifest/forgeData113";
import { ForgeRepository } from "@/main/entities/versionManifest/forgeRepository";
import { isForgeGradle3, getJDKPath, isDev, isMac, mojangFriendlyOS } from "@/main/utils/util";
import AdmZip from "adm-zip";
import { app } from "electron";
import fs from "fs-extra";
import path from "path";
import { ConfigManager } from "../configManager";
import childProcess from "child_process";
import { Asset } from "@/main/entities/downloader/asset";
import { validateRules } from "@/main/entities/versionManifest/helper";
import { VersionData112 } from "@/main/entities/versionManifest/versionData112";
import { VersionData113 } from "@/main/entities/versionManifest/versionData113";
import { ConfigRepository } from "@/main/entities/config/configRepository";
import { AssetListRepository } from "@/main/entities/downloader/assetListRepository";

export class ForgeRepositoryImple implements ForgeRepository {
  constructor(private configRepository: ConfigRepository, private assetListRepository: AssetListRepository) {}
  async loadForgeData(server: Server): Promise<ForgeData112 | ForgeData113> {
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
            const assetList = await this.validateLibraries(manifest);
            if (assetList.dlqueue.length === 0) {
              return manifest;
            }
          }

          await this._installForgeWithCLI(
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
          const forgeData = await this.unzipForgeVersionData(asset);
          return forgeData;
        }
      }
    }
    throw "No forge module found!";
  }
  async validateLibraries(versionData: VersionData112 | VersionData113) {
    const assets: Asset[] = [];
    versionData.libraries.forEach((lib) => {
      if (validateRules(lib)) {
        const artifact =
          !("natives" in lib) || lib.natives == null
            ? lib.downloads.artifact
            : lib.downloads.classifiers[
                lib.natives[mojangFriendlyOS()]?.replace("${arch}", process.arch.replace("x", "")) || ""
              ];
        assets.push(
          new Asset(
            lib.name,
            artifact.sha1,
            artifact.size,
            artifact.url,
            this.configRepository.getLauncherSetting().getDataDirectory().common.libraries.$join(artifact.path)
          )
        );
      }
    });
    return this.assetListRepository.fromAssetList("libraries", "sha1", assets);
  }
  private async unzipForgeVersionData(asset: Asset) {
    const data = fs.readFileSync(asset.to);
    const zip = new AdmZip(data);
    const zipEntries = zip.getEntries();

    for (let i = 0; i < zipEntries.length; i++) {
      if (zipEntries[i].entryName === "version.json") {
        const forgeVersion = JSON.parse(zip.readAsText(zipEntries[i]));
        const versionPath = ConfigManager.getLauncherSetting()
          .getDataDirectory()
          .common.versions.$join(forgeVersion.id);
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

  private async _installForgeWithCLI(installerExec: string, workDir: string, javaExecutable: string): Promise<void> {
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
}
