import { MsaLoginState } from "@/main/usecases/msaLogin";

export class MsaLoginStateImple implements MsaLoginState {
  hasWindow(): boolean {
    return this._windowState;
  }
  private _windowState = false;
  private _loginSuccess = false;
  openedWindow(): void {
    this._windowState = true;
  }
  clear(): void {
    this._windowState = false;
    this._loginSuccess = false;
  }
  success(): void {
    this._loginSuccess = true;
  }
  getState(): "success" | "failure" {
    return this._loginSuccess ? "success" : "failure";
  }
}
