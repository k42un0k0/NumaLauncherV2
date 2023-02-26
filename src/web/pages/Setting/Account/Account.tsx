import { useSetAtom } from "jotai";
import { pageJotai } from "../../utils/pageJotai";
import { useSelector } from "../../utils/stateJotai";
import Head from "../components/Head";
import { accountSelectors } from "../utils/selectors";
import AccountList from "./AccountList";

export default function Account() {
  const accounts = useSelector(accountSelectors.accounts);
  const selectedUUID = useSelector(accountSelectors.selectedUUID);
  const setPage = useSetAtom(pageJotai);
  return (
    <div style={{ height: 1000, flex: 1 }}>
      <Head head="アカウント設定" description="新しいアカウントを追加、または使用するアカウントを管理します" />
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
