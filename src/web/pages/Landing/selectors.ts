import { createSelector } from "reselect";
import { selectors } from "../jotai/selector";

export const landingSelectors = {
  account: createSelector(selectors.landing, (state) => state.account),
};
