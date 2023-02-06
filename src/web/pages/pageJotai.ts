import { atom, useSetAtom } from "jotai";
import { AuthAccount } from "../../main/msAccountManager";
export type PageJotai = "home" | "login" | "setting";

export const pageJotai = atom<PageJotai>("home");
export function usePageMove() {
  const setPage = useSetAtom(pageJotai);
  return {
    home: () => setPage("home"),
    login: () => setPage("login"),
    setting: () => setPage("setting"),
  };
}

export const accountsJotai = atom<Record<string, AuthAccount> | Promise<Record<string, AuthAccount>>>({});

export const selectedUUIDJotai = atom<string | null | Promise<string>>(null);
