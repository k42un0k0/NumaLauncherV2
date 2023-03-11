import { ipcMain } from "electron";
import { handleActions, MainChannel } from "../../utils/channels";
import { Module as ViewModule, Server as VieweServer, ViewState } from "../../../common/types";
import { actions, PayloadFromActionCreator } from "../../../common/actions";
import { Types } from "../../entities/distribution/constatnts";
import { Module } from "../../entities/distribution/module";
import { Server } from "../../entities/distribution/server";
import { ModSetting } from "../../entities/config/modSetting";
import { Dependencies } from "../../dependencies";

export function viewListener(deps: Dependencies) {
  ipcMain.handle(MainChannel.state.GET_STATE, function (): ViewState {
    const modSetting = deps.configRepository.getModsSetting(deps.configRepository.get().selectedServer)!;
    const modules = deps.distributionRepository
      .getDistribution()
      ?.getServer(deps.configRepository.get().selectedServer)?.modules;

    const modsInitial = {
      required: [],
      option: [],
      selectedServer: deps.configRepository.get().selectedServer,
    };
    const mods = (modules?.reduce(createScanModule(modSetting), modsInitial) ||
      modsInitial) as ViewState["setting"]["mod"];

    const selectedServer = deps.distributionRepository
      .getDistribution()
      ?.getServer(deps.configRepository.get().selectedServer);
    return {
      firstLaunch: deps.configRepository.firstLoad,
      account: deps.configRepository.get().accounts[deps.configRepository.get().selectedUUID],
      overlay: {
        selectedServer: deps.configRepository.get().selectedServer,
        servers: deps.distributionRepository.getDistribution()?.servers.map(serverToViewServer) || [],
      },
      landing: {
        server: selectedServer && serverToViewServer(selectedServer),
      },
      setting: {
        account: {
          accounts: deps.configRepository.get().accounts,
          selectedUUID: deps.configRepository.get().selectedUUID,
        },
        minecraft: {
          resWidth: deps.configRepository.getGameSetting().resWidth,
          resHeight: deps.configRepository.getGameSetting().resHeight,
          fullscreen: deps.configRepository.getGameSetting().fullscreen,
          autoConnect: deps.configRepository.getGameSetting().autoConnect,
          optionStandize: deps.configRepository.getLauncherSetting().optionStandardize,
        },
        java: {
          minRAM: Number(deps.configRepository.getJavaSetting().minRAM.replace("G", "")),
          maxRAM: Number(deps.configRepository.getJavaSetting().maxRAM.replace("G", "")),
          executable: deps.configRepository.getJavaSetting().executable,
          jvmOptionValue: deps.configRepository.getJavaSetting().jvmOptions.join(" "),
        },
        launcher: {
          dataDirectory: deps.configRepository.getLauncherSetting().dataDirectory,
          allowPrerelease: deps.configRepository.getLauncherSetting().allowPrerelease,
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
      deps.configRepository.get().selectedServer = payload;
      deps.configRepository.save();
    },
    [actions.setting.java.setExecutable.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setExecutable>
    ) => {
      deps.configRepository.getJavaSetting().executable = payload;
      deps.configRepository.save();
    },
    [actions.setting.java.setMinRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMinRAM>
    ) => {
      deps.configRepository.getJavaSetting().minRAM = payload + "G";
      deps.configRepository.save();
    },
    [actions.setting.java.setMaxRAM.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setMaxRAM>
    ) => {
      deps.configRepository.getJavaSetting().maxRAM = payload + "G";
      deps.configRepository.save();
    },
    [actions.setting.java.setJvmOptions.toString()]: (
      _,
      payload: PayloadFromActionCreator<typeof actions.setting.java.setJvmOptions>
    ) => {
      deps.configRepository.getJavaSetting().jvmOptions = payload.split(" ");
      deps.configRepository.save();
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
