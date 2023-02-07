import { atom, useAtomValue, useSetAtom } from "jotai";
import { Action } from "../../../common/actions";
import { ViewState } from "../../../common/types";
import { mainPreload } from "../../utils/preload";

export const stateJotai = atom<ViewState>({
  overlay: { servers: [], selectedServer: "" },
  landing: { account: undefined },
  setting: { account: { accounts: {}, selectedUUID: "" } },
});

export function useSelector<T extends (state: ViewState) => any>(selector: T): ReturnType<T> {
  const state = useAtomValue(stateJotai);
  return selector(state);
}
export function useDispatch() {
  const setState = useSetAtom(stateJotai);
  return async (action: Action<unknown>) => {
    await mainPreload.state.dispatch(action);
    setState(await mainPreload.state.getState());
  };
}
