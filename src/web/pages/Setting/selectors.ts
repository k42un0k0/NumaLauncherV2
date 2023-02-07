import { createSelector } from "reselect";
import { selectors } from "../jotai/selector";

export const settingSelectors = {
  account: createSelector(selectors.setting, (state) => state.account),
};

export const accountSelectors = {
  accounts: createSelector(settingSelectors.account, (state) => state.accounts),
  selectedUUID: createSelector(settingSelectors.account, (state) => state.selectedUUID),
};
