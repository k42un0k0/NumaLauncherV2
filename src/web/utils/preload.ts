import { MainPreload } from "@/common/preload";
import { createContext, useContext } from "react";

export const mainPreload = window.main as MainPreload;

const Context = createContext<MainPreload | null>(null);

export const MainPreloadProvider = Context.Provider;
export function useMainPreload() {
  return useContext(Context) as MainPreload;
}
