import path from "path";
import fs from "fs-extra";
import { mojangFriendlyOS } from "../utils/util";
import electron from "electron";
import { ProcessBuilder } from "../drivers/processbuilder";
import { AssetList } from "../entities/downloader/assetList";
import { getAssetIndex, loadVersionData, validateRules } from "../entities/versionManifest/helper";
import { Server } from "../entities/distribution/server";
import { ModSettingValue } from "../entities/config/modSetting";
import { Required } from "../entities/distribution/required";
import { Module } from "../entities/distribution/module";
import { Artifact } from "../entities/distribution/artifact";
import { optionscopy } from "../drivers/optionscopy";
import { VersionData112 } from "../entities/versionManifest/versionData112";
import { VersionData113 } from "../entities/versionManifest/versionData113";
import { Asset } from "../entities/downloader/asset";
import { AssetListRepository } from "../entities/downloader/assetListRepository";
import { ConfigRepository } from "../entities/config/configRepository";
import { DistributionRepository } from "../entities/distribution/distributionRepository";
import { ForgeRepository } from "../entities/versionManifest/forgeRepository";

export interface RunMinecraftOB {
  validate(type: "distribution" | "version" | "assets" | "libraries" | "files" | "forge"): void;
  complate(type: "install"): void;
  assetsProgress(total: number, progress: number): void;
  downloadProgress(total: number, progress: number): void;
  close(manualData?: Artifact[]): void;
  error(e: unknown): void;
  createManualWindows(artifacts: Artifact[]): void;
  processDLQueues(
    assetListData: { assetList: AssetList; limit: number }[],
    onData: (total: number, progress: number) => void
  ): Promise<void>;
}

export class RunMinecraftInteractor {
  constructor(
    private configRepository: ConfigRepository,
    private distributionRepository: DistributionRepository,
    private assetListRepository: AssetListRepository,
    private forgeRepository: ForgeRepository
  ) {}
  async handle(output: RunMinecraftOB) {
    try {
      const distribution = this.distributionRepository.getDistribution()!;
      const selectedServer = this.configRepository.get().selectedServer;
      const server = distribution.servers.find((server) => server.id == selectedServer) || distribution.servers[0];
      if (!server) {
        throw new Error("??????????????????????????????????????????");
      }
      const manualData = await this.loadManualData(server);
      if (manualData.length > 0) {
        output.close(manualData);
        output.createManualWindows(manualData);
        return;
      }
      // ?????????????????????this.forge????????????;
      const [forge, extractQueue] = this.validateDistribution(server);
      output.validate("distribution");
      const versionData = await loadVersionData(server.minecraftVersion);
      output.validate("version");
      const assets = await this.validateAssets(versionData, output);
      output.validate("assets");
      const libraries = await this.validateLibraries(versionData);
      output.validate("libraries");
      const files = await this.validateMiscellaneous(versionData);
      output.validate("files");
      await output.processDLQueues(
        [
          { assetList: forge, limit: 20 },
          { assetList: assets, limit: 20 },
          { assetList: libraries, limit: 5 },
          { assetList: files, limit: 5 },
        ],
        (total, progress) => output.downloadProgress(total, progress)
      );
      output.validate("forge");
      const forgeData = await this.forgeRepository.loadForgeData(server);
      output.complate("install");
      const authUser = this.configRepository.getSelectedAccount();
      const pb = new ProcessBuilder(server, versionData, forgeData, authUser, electron.app.getVersion());

      const process = pb.build();
      const instanceDir = this.configRepository.getLauncherSetting().getDataDirectory().instances;
      if (
        this.configRepository.getLauncherSetting().optionStandardize &&
        !fs.existsSync(instanceDir.game(server.id).optionFile)
      ) {
        const instances = fs.readdirSync(instanceDir.$path);
        //?????????options.txt???????????????
        let maxMtime = 0;
        let optionfilepath = "";
        instances.forEach((instance) => {
          const optionPath = instanceDir.game(instance).optionFile;

          if (fs.existsSync(optionPath)) {
            const stats = fs.statSync(optionPath);
            if (stats.mtime.getTime() > maxMtime) {
              maxMtime = stats.mtime.getTime();
              optionfilepath = optionPath;
            }
          }
        });

        //?????????????????????????????????????????????????????????????????????
        if (maxMtime != 0) {
          console.log("options.txt??????????????? ????????????:" + optionfilepath);
          optionscopy(optionfilepath, instanceDir.game(server.id).optionFile);
        }
      }

      output.close();
    } catch (e) {
      console.log(e);
      output.error(e);
    }
  }

  /**
   * ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
   *
   * @param {string} server The Server to load Forge data for.
   * @returns {Promise.<Object>} A promise which resolves to Forge's version.json data.
   */
  async loadManualData(server: Server) {
    function isModEnabled(modCfg: ModSettingValue, required: Required) {
      return modCfg != null
        ? (typeof modCfg === "boolean" && modCfg) ||
            (typeof modCfg === "object" && (typeof modCfg.value !== "undefined" ? modCfg.value : true))
        : required != null
        ? required.def
        : true;
    }

    // ????????????????????????????????????????????????????????????
    const modCfg = this.configRepository.getModsSetting(server.id)!.mods;
    const mdls = server.modules;

    // ????????????????????????Mod??????
    const manualModsCandidate: Module[] = [];
    // ON???????????????Mod???????????????
    const removeCandidate: number[] = [];
    mdls.forEach((mdl, index, object) => {
      const artifact = mdl.artifact;
      const manual = artifact.manual;
      // ??????Mod????????????
      if (manual !== undefined) {
        // ON????????????
        const o = !mdl.required.value;
        const e = isModEnabled(modCfg[mdl.versionLessID], mdl.required);
        if (!o || (o && e)) {
          manualModsCandidate.push(mdl);
        } else {
          removeCandidate.push(index);
        }
      }
    });
    // ?????????????????????Mod????????????????????????
    for (let i = removeCandidate.length - 1; i >= 0; i--) mdls.splice(removeCandidate[i], 1);

    // ???????????????Mod??????????????????????????????Mod??????????????????
    const manualMods: Artifact[] = [];
    for (const mdl of manualModsCandidate) {
      const artifact = mdl.artifact;
      if (!(await fs.pathExists(mdl.artifact.path))) {
        manualMods.push(artifact);
      }
    }
    return manualMods;
  }

  async validateAssets(versionData: VersionData112 | VersionData113, output: RunMinecraftOB) {
    const data = await getAssetIndex(versionData);
    //Asset constants
    const toAsset = (key: string) => {
      const resourceURL = "https://resources.download.minecraft.net/";
      const localPath = this.configRepository.getLauncherSetting().getDataDirectory().common.assets;
      const hash = data.objects[key].hash;
      const assetName = path.join(hash.substring(0, 2), hash);
      const urlName = hash.substring(0, 2) + "/" + hash;
      return new Asset(key, hash, data.objects[key].size, resourceURL + urlName, localPath.objects.$join(assetName));
    };
    const assets = Object.keys(data.objects).map(toAsset);
    return this.assetListRepository.fromAssetList("assets", "sha1", assets, (index) => {
      output.assetsProgress(assets.length, index);
    });
  }

  validateMiscellaneous(versionData: VersionData112 | VersionData113) {
    const clientData = versionData.downloads.client;
    const version = versionData.id;

    const clientAsset = new Asset(
      version + " client",
      clientData.sha1,
      clientData.size,
      clientData.url,
      this.configRepository
        .getLauncherSetting()
        .getDataDirectory()
        .common.versions.$join(version, version + ".jar")
    );

    const file = versionData.logging.client.file;
    const logConfigAsset = new Asset(
      file.id,
      file.sha1,
      file.size,
      file.url,
      this.configRepository.getLauncherSetting().getDataDirectory().common.assets.log_configs.$join(file.id)
    );

    return this.assetListRepository.fromAssetList("files", "sha1", [clientAsset, logConfigAsset]);
  }
  validateDistribution(server: Server) {
    return this.assetListRepository.fromModules("forge", "MD5", server.modules);
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
}
