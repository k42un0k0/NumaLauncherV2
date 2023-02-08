import { createSelector } from "reselect";
import { ViewState } from "../../../common/types";

const stateSelector = (state: ViewState) => state;
export const selectors = {
  landing: createSelector(stateSelector, (state: ViewState) => state.landing),
  setting: createSelector(stateSelector, (state) => state.setting),
  overlay: createSelector(stateSelector, (state) => state.overlay),
};

export const settingSelectors = {
  account: createSelector(selectors.setting, (state) => state.account),
  minecraft: createSelector(selectors.setting, (state) => state.minecraft),
  java: createSelector(selectors.setting, (state) => state.java),
  launcher: createSelector(selectors.setting, (state) => state.launcher),
};

export const overlaySelector = {
  servers: createSelector(selectors.overlay, (state) => state.servers),
  selectedServer: createSelector(selectors.overlay, (state) => state.selectedServer),
};
