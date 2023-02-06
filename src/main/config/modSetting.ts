export type ModSettingValue = { value: boolean } | boolean;
export class ModSetting {
  constructor(
    public id: string,
    public mods: Record<string, ModSettingValue>,
    public subModules: Record<string, ModSetting>
  ) {}
  isModEnabled(versionLessID: string, defaultValue: boolean): boolean {
    const mod = this.mods[versionLessID];
    if (mod == null) {
      return defaultValue;
    }
    if (typeof mod === "boolean") {
      return mod;
    }
    if ("value" in mod && mod.value != null) {
      return mod.value;
    }
    return true;
  }
}

const mods: any = {
  key: "",
  cls: ModSetting,
};
mods.args = [mods];

export const modSettingArgs = ["mods", { key: "subModules", cls: ModSetting, args: [mods] }];
