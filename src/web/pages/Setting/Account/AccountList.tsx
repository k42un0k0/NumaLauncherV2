import { AuthAccount } from "../../../../main/msAccountManager";
import AccountItem from "./AccountItem";

type Props = {
  selectedUUID: string;
  acounts: Record<string, AuthAccount>;
};
export default function AccountList({ selectedUUID, acounts }: Props) {
  return (
    <div>
      {Object.keys(acounts).map((uuid) => {
        return (
          <AccountItem
            key={uuid}
            selected={selectedUUID == uuid}
            displayName={acounts[uuid].displayName}
            uuid={uuid}
            onClickLogout={() => void 0}
            onClickSelect={() => void 0}
          />
        );
      })}
    </div>
  );
}
