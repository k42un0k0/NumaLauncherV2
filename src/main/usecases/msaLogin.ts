import { ConfigRepository } from "../entities/config/configRepository";
import { fetchMSAccount } from "../entities/config/msAccount";
const redirectUriPrefix = "https://login.microsoftonline.com/common/oauth2/nativeclient?";

export interface MsaLoginState {
  hasWindow(): boolean;
  openedWindow(): void;
  clear(): void;
  success(): void;
  getState(): "success" | "failure";
}

export interface MsaLoginOB {
  createWindow(
    onClosed: () => "success" | "failure",
    onDidNavigate: (uri: string) => Promise<"success" | "failure">
  ): void;
  close(): void;
}

export class MsaLoginInteractor {
  constructor(private msaWindowState: MsaLoginState, private configRepository: ConfigRepository) {}
  handle(output: MsaLoginOB): string {
    if (this.msaWindowState.hasWindow()) {
      return "already";
    }
    output.createWindow(
      () => {
        const state = this.msaWindowState.getState();
        this.msaWindowState.clear();
        return state;
      },
      async (uri) => {
        if (uri.startsWith(redirectUriPrefix)) {
          const queryMap = redirectUriToQuery(uri);
          const authCode = queryMap.get("code");
          if (authCode == null) {
            output.close();
            return "failure";
          }
          this.msaWindowState.success();
          output.close();
          try {
            const authAcount = await fetchMSAccount(authCode);
            this.configRepository.createAccount(authAcount);
            return "success";
          } catch (_) {
            return "failure";
          }
        }
        return "failure";
      }
    );
    this.msaWindowState.openedWindow();
    return "success";
  }
}

function redirectUriToQuery(uri: string): Map<string, string> {
  const querys = uri.substring(redirectUriPrefix.length).split("#", 1).toString().split("&");
  const queryMap = new Map();

  querys.forEach((query) => {
    const arr = query.split("=");
    queryMap.set(arr[0], decodeURI(arr[1]));
  });
  return queryMap;
}
