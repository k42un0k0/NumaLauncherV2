import { AuthAccount } from "./msAccountManager";

interface Config {
  selectedAccount: string;
  accountDatabase: { [uuid: string]: AuthAccount };
}
