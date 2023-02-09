import { atom, useAtomValue, useSetAtom } from "jotai";
import { Action } from "@/common/actions";
import { ViewState } from "@/common/types";
import { mainPreload } from "@/web/utils/preload";

export const stateJotai = atom<ViewState>({
  overlay: { servers: [], selectedServer: "" },
  landing: { account: undefined },
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
  },
});

export function useSelector<T extends (state: ViewState) => any>(selector: T): ReturnType<T> {
  const state = useAtomValue(stateJotai);
  return selector(state);
}
export function useDispatch() {
  const setState = useSetAtom(stateJotai);
  return async (action: Action<unknown>) => {
    await mainPreload.view.dispatch(action);
    setState(await mainPreload.view.getState());
  };
}
