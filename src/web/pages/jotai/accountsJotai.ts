import { atom, useAtom } from "jotai";
import { AuthAccount } from "../../../main/msAccountManager";
import { mainPreload } from "../../utils/preload";

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
