import { atom } from "jotai";
export type SettingJotai =
  | "account"
  | "minecraft"
  | "mod"
  | "java"
  | "launcher"
  | "about"
  | "update";

export const settingJotai = atom<SettingJotai>("account");
