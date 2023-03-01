import { atom, useSetAtom } from "jotai";
export type PageJotai = "firstLaunch" | "splash" | "home" | "login" | "setting";

export const pageJotai = atom<PageJotai>("splash");
export function usePageMove() {
  const setPage = useSetAtom(pageJotai);
  return {
    splash: () => setPage("splash"),
    firstLaunch: () => setPage("firstLaunch"),
    home: () => setPage("home"),
    login: () => setPage("login"),
    setting: () => setPage("setting"),
  };
}
