import { atom } from "jotai";
import { AuthAccount } from "../../main/msAccountManager";
export type PageJotai = "home" | "login" | "setting";

export const pageJotai = atom<PageJotai>("home");

export const accountsJotai = atom<Record<string, AuthAccount> | Promise<Record<string, AuthAccount>>>({});
export const selectedUUIDJotai = atom<string | null | Promise<string>>(null);
