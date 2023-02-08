import { createSelector } from "reselect";
import { settingSelectors } from "../../utils/selector";

export const accountSelectors = {
  accounts: createSelector(settingSelectors.account, (state) => state.accounts),
  selectedUUID: createSelector(settingSelectors.account, (state) => state.selectedUUID),
};
