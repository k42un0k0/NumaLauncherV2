export const gameSettingArgs = ["resWidth", "resHeight", "fullscreen", "autoConnect", "launchDetached"];
export class GameSetting {
  static default() {
    return new GameSetting(1280, 720, false, true, true);
  }
  constructor(
    public resWidth: number,
    public resHeight: number,
    public fullscreen: boolean,
    public autoConnect: boolean,
    public launchDetached: boolean
  ) {}
}
