import { atom, useSetAtom } from "jotai";
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
