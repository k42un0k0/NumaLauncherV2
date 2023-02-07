import { atom, useAtom, useSetAtom } from "jotai";
import { AuthAccount } from "../../main/msAccountManager";
import { mainPreload } from "../utils/preload";
export type PageJotai = "splash" | "home" | "login" | "setting";

export const pageJotai = atom<PageJotai>("splash");
export function usePageMove() {
  const setPage = useSetAtom(pageJotai);
  return {
    splash: () => setPage("splash"),
    home: () => setPage("home"),
    login: () => setPage("login"),
    setting: () => setPage("setting"),
  };
}

export const accountsJotai = atom<Record<string, AuthAccount> | Promise<Record<string, AuthAccount>>>({});
export function useAccounts(): [Record<string, AuthAccount>, () => Promise<void>] {
  const [accounts, setAccounts] = useAtom(accountsJotai);
  return [
    accounts,
    async () => {
      setAccounts(await mainPreload.config.getAccounts());
    },
  ];
}
export const selectedUUIDJotai = atom<string | null | Promise<string>>(null);
export function useSelectedUUID(): [string | null, () => Promise<void>] {
  const [selectedUUID, setSelectedUUID] = useAtom(selectedUUIDJotai);
  return [
    selectedUUID,
    async () => {
      setSelectedUUID(await mainPreload.config.getSelectedUUID());
    },
  ];
}
