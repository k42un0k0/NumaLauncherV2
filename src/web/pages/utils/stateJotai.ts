import { atom, useAtomValue, useSetAtom } from "jotai";
import { Action } from "@/common/actions";
import { ViewState } from "@/common/types";
import { mainPreload } from "@/web/utils/preload";

export const stateJotai = atom<ViewState>({
  firstLaunch: false,
  account: undefined,
  overlay: { servers: [], selectedServer: "" },
  landing: {},
  setting: {
    account: { accounts: {}, selectedUUID: "" },
    minecraft: {
      resWidth: 0,
      resHeight: 0,
      fullscreen: false,
      autoConnect: false,
      optionStandize: false,
    },
    java: {
      minRAM: 0,
      maxRAM: 0,
      executable: "",
      jvmOptionValue: "",
    },
    launcher: {
      allowPrerelease: false,
      dataDirectory: "",
    },
    mod: { required: [], option: [], selectedServer: "" },
  },
});

export function useSelector<T>(...args: [(state: ViewState) => T]): T;
export function useSelector<T, S>(...args: [(state: ViewState) => T, (state: T) => S]): S;
export function useSelector<T, S, U>(...args: [(state: ViewState) => T, (state: T) => S, (state: S) => U]): U;
export function useSelector<T>(...selectors: ((state: any) => any)[]): T {
  const state = useAtomValue(stateJotai);
  return selectors.reduce<any>((state, selector) => selector(state), state);
}
export function useDispatch() {
  const setState = useSetAtom(stateJotai);
  return async (action: Action<unknown>) => {
    await mainPreload.view.dispatch(action);
    setState(await mainPreload.view.getState());
  };
}
