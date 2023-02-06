import { useAtom, useSetAtom } from "jotai";
import { useEffect } from "react";
import { mainPreload } from "../../utils/preload";
import { accountsJotai, pageJotai, selectedUUIDJotai } from "../pageJotai";
import AccountList from "./Account/AccountList";

export default function Account() {
  const [accounts, setAccounts] = useAtom(accountsJotai);
  const [selectedUUID, setSelectedUUID] = useAtom(selectedUUIDJotai);
  const setPage = useSetAtom(pageJotai);
  useEffect(() => {
    setAccounts(mainPreload.config.getAccounts());
    setSelectedUUID(mainPreload.config.getSelectedUUID());
  }, []);
  return (
    <div style={{ height: 1000, flex: 1 }}>
      <div>アカウント設定</div>
      <div>新しいアカウントを追加、または使用するアカウントを管理します</div>
      <div>
        <button onClick={() => setPage("login")}>アカウントを追加</button>
      </div>
      <div>
        <div>現在のアカウント</div>
        {!selectedUUID || <AccountList acounts={accounts} selectedUUID={selectedUUID} />}
      </div>
    </div>
  );
}
