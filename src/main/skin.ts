import fs from "fs-extra";
import { paths } from "./utils/paths";

export interface SkinJSON {
  [id: string]: {
    created: string;
    id: string;
    modelImage: string;
    name: string;
    skinImage: string;
    slim: boolean;
    textureId: string;
    updated: string;
  };
}
export interface SkinSettingJSON {
  settings: { import: boolean; sync: boolean };
}
export function importOfficialSkinInfo() {
  fs.copyFileSync(paths.minecraftLauncherData.originSkinFile, paths.minecraftLauncherData.numaSkinFile);
  const settingJSON = loadSettingSkin();
  settingJSON.settings.import = true;
  saveSettingSkin(settingJSON);
}

export function saveSyncSetting(sync: boolean) {
  const settingJSON = loadSettingSkin();
  settingJSON.settings.sync = sync;
  saveSettingSkin(settingJSON);
}

function saveSettingSkin(settingJSONObject: SkinSettingJSON) {
  let json = JSON.stringify(settingJSONObject, null, 2);
  json = json.replace(/[\u007F-\uFFFF]/g, function (chr) {
    return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4);
  });
  fs.writeFileSync(paths.minecraftLauncherData.skinSettingFile, json);
}

function loadSettingSkin() {
  try {
    const settingJSONObject = JSON.parse(
      fs.readFileSync(paths.minecraftLauncherData.skinSettingFile, "utf8")
    ) as SkinSettingJSON;
    return settingJSONObject;
  } catch (error) {
    return {
      settings: {
        import: false,
        sync: false,
      },
    };
  }
}
