import { ipcMain } from "electron";
import { handleActions, MainChannel } from "../utils/channels";
import { ConfigManager } from "../config/configManager";
import { DistroManager } from "../distribution/distroManager";
import { Module as ViewModule, Server as VieweServer, ViewState } from "../../common/types";
import { actions, PayloadFromActionCreator } from "../../common/actions";
import { Types } from "../distribution/constatnts";
import { Module } from "../distribution/module";
import { Server } from "../distribution/server";
import { ModSetting } from "../config/modSetting";

export function viewListener() {
  ipcMain.handle(MainChannel.state.GET_STATE, function (): ViewState {
    const modSetting = ConfigManager.getModsSetting(ConfigManager.INSTANCE.config.selectedServer)!;
    const modules = DistroManager.getDistribution()?.getServer(ConfigManager.INSTANCE.config.selectedServer)?.modules;

    const modsInitial = {
      required: [],
      option: [],
      selectedServer: ConfigManager.INSTANCE.config.selectedServer,
    };
    const mods = (modules?.reduce(createScanModule(modSetting), modsInitial) ||
      modsInitial) as ViewState["setting"]["mod"];

    const selectedServer = DistroManager.getDistribution()?.getServer(ConfigManager.INSTANCE.config.selectedServer);
    return {
      firstLaunch: ConfigManager.INSTANCE.firstLoad,
      account: ConfigManager.INSTANCE.config.accounts[ConfigManager.INSTANCE.config.selectedUUID],
      overlay: {
        selectedServer: ConfigManager.INSTANCE.config.selectedServer,
        servers: DistroManager.getDistribution()?.servers.map(serverToViewServer) || [],
      },
      landing: {
        server: selectedServer && serverToViewServer(selectedServer),
      },
      setting: {
        account: {
          accounts: ConfigManager.INSTANCE.config.accounts,
          selectedUUID: ConfigManager.INSTANCE.config.selectedUUID,
        },
        minecraft: {
          resWidth: ConfigManager.getGameSetting().resWidth,
          resHeight: ConfigManager.getGameSetting().resHeight,
          fullscreen: ConfigManager.getGameSetting().fullscreen,
          autoConnect: ConfigManager.getGameSetting().autoConnect,
          optionStandize: ConfigManager.getLauncherSetting().optionStandardize,
        },
        java: {
          minRAM: Number(ConfigManager.getJavaSetting().minRAM.replace("G", "")),
          maxRAM: Number(ConfigManager.getJavaSetting().maxRAM.replace("G", "")),
          executable: ConfigManager.getJavaSetting().executable,
          jvmOptionValue: ConfigManager.getJavaSetting().jvmOptions.join(" "),
        },
        launcher: {
          dataDirectory: ConfigManager.getLauncherSetting().dataDirectory,
          allowPrerelease: ConfigManager.getLauncherSetting().allowPrerelease,
        },
        mod: mods,
      },
    };
  });

  handleActions({
    [actions.overlay.selectServer.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.overlay.selectServer>
    ) => {
      ConfigManager.INSTANCE.config.selectedServer = payload;
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setExecutable.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setExecutable>
    ) => {
      ConfigManager.getJavaSetting().executable = payload;
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setMinRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMinRAM>
    ) => {
      ConfigManager.getJavaSetting().minRAM = payload + "G";
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setMaxRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMaxRAM>
    ) => {
      ConfigManager.getJavaSetting().maxRAM = payload + "G";
      ConfigManager.INSTANCE.save();
    },
    [actions.setting.java.setJvmOptions.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setJvmOptions>
    ) => {
      ConfigManager.getJavaSetting().jvmOptions = payload.split(" ");
      ConfigManager.INSTANCE.save();
    },
  });
}

function createScanModule(modSetting: ModSetting) {
  function scanModule(acc: { required: ViewModule[]; option: ViewModule[] }, module: Module) {
    const type = module.type;
    if (type !== Types.ForgeMod && type !== Types.LiteMod && type !== Types.LiteLoader) {
      return acc;
    }
    function moduleToViewModule(m: Module) {
      return {
        name: m.name,
        version: m.artifactVersion,
        versionlessID: m.versionLessID,
        submodules:
          m.subModules &&
          m.subModules.reduce(scanModule, { required: [], option: [] } as {
            required: ViewModule[];
            option: ViewModule[];
          }),
        value: modSetting.isModEnabled(m.versionLessID, m.required.def),
      };
    }
    if (module.required.value) {
      acc.required.push(moduleToViewModule(module));
    } else {
      acc.option.push(moduleToViewModule(module));
    }
    return acc;
  }
  return scanModule;
}

function serverToViewServer(server: Server): VieweServer {
  return {
    name: server.name,
    icon: server.icon,
    id: server.id,
    description: server.description,
    version: server.version,
    minecraftVersion: server.minecraftVersion,
    mainServer: server.mainServer,
  };
}
