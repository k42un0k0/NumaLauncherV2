import { Types } from "../distribution/constatnts";
import { Module } from "../distribution/module";

export type ModSettingValue = { value: boolean; mods: Record<string, ModSettingValue> } | boolean;
export class ModSetting {
  mergeDistroModules(modules: Module[]) {
    const mods = this.mods;
    modules.forEach((module) => {
      const type = module.type;
      if (type === Types.ForgeMod || type === Types.LiteMod || type === Types.LiteLoader) {
        if (!module.required.value) {
          if (mods[module.versionLessID] == null) {
            mods[module.versionLessID] = ModSetting._scanOptionalSubModules(module.subModules, module);
          } else {
            mods[module.versionLessID] = ModSetting._mergeModConfiguration(
              mods[module.versionLessID],
              ModSetting._scanOptionalSubModules(module.subModules, module),
              false
            );
          }
        } else {
          if (module.subModules) {
            const v = ModSetting._scanOptionalSubModules(module.subModules, module);
            if (typeof v === "object") {
              if (mods[module.versionLessID] == null) {
                mods[module.versionLessID] = v;
              } else {
                mods[module.versionLessID] = ModSetting._mergeModConfiguration(mods[module.versionLessID], v, true);
              }
            }
          }
        }
      }
    });
    this.mods = mods;
  }
  static _mergeModConfiguration(
    o: boolean | { value: boolean; mods: Record<string, ModSettingValue> },
    n: boolean | { value: boolean; mods: Record<string, ModSettingValue> },
    nReq: boolean
  ): ModSettingValue {
    if (typeof o === "boolean") {
      if (typeof n === "boolean") return o;
      else if (typeof n === "object") {
        if (!nReq) {
          n.value = o;
        }
        return n;
      }
    } else if (typeof o === "object") {
      if (typeof n === "boolean") return typeof o.value !== "undefined" ? o.value : true;
      else if (typeof n === "object") {
        if (!nReq) {
          n.value = typeof o.value !== "undefined" ? o.value : true;
        }

        const newMods = Object.keys(n.mods);
        for (let i = 0; i < newMods.length; i++) {
          const mod = newMods[i];
          if (o.mods[mod] != null) {
            n.mods[mod] = ModSetting._mergeModConfiguration(o.mods[mod], n.mods[mod], false);
          }
        }

        return n;
      }
    }
    // If for some reason we haven't been able to merge,
    // wipe the old value and use the new one. Just to be safe
    return n;
  }
  static _scanOptionalSubModules(mdls: Module[] | undefined, origin: Module) {
    if (mdls != null) {
      const mods: ModSetting["mods"] = {};
      for (const mdl of mdls) {
        const type = mdl.type;
        // Optional types.
        if (type === Types.ForgeMod || type === Types.LiteMod || type === Types.LiteLoader) {
          // It is optional.
          if (!mdl.required.value) {
            mods[mdl.versionLessID] = ModSetting._scanOptionalSubModules(mdl.subModules, mdl);
          } else {
            if (mdl.subModules) {
              const v = ModSetting._scanOptionalSubModules(mdl.subModules, mdl);
              if (typeof v === "object") {
                mods[mdl.versionLessID] = v;
              }
            }
          }
        }
      }

      if (Object.keys(mods).length > 0) {
        const ret: ModSettingValue = {
          value: false,
          mods,
        };
        if (!origin.required.value) {
          ret.value = origin.required.def;
        }
        return ret;
      }
    }
    return origin.required.def;
  }
  constructor(public id: string, public mods: Record<string, ModSettingValue>) {}
  isModEnabled(versionLessID: string, defaultValue: boolean): boolean {
    const mod = this.findMod(versionLessID);
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
  findMod(versionLessID: string) {
    function scanMod(mods: Record<string, ModSettingValue>) {
      return Object.keys(mods).reduce((acc, key): ModSettingValue | undefined => {
        const mod = mods[key];
        if (key === versionLessID) return mod;
        if (typeof mod !== "boolean") return scanMod(mod.mods);
        return acc;
      }, undefined as ModSettingValue | undefined);
    }
    return scanMod(this.mods);
  }
}

const mods: any = {
  key: "",
  cls: ModSetting,
};
mods.args = [mods];

export const modSettingArgs = ["id", "mods"];
