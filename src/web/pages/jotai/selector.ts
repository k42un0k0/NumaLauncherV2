import { createSelector } from "reselect";
import { ViewState } from "../../../common/types";

const stateSelector = (state: ViewState) => state;
export const selectors = {
  landing: createSelector(stateSelector, (state: ViewState) => state.landing),
  setting: createSelector(stateSelector, (state) => state.setting),
  overlay: createSelector(stateSelector, (state) => state.overlay),
};
