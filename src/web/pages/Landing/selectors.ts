import { createSelector } from "reselect";
import { selectors } from "../utils/selector";

export const landingSelectors = {
  account: createSelector(selectors.landing, (state) => state.account),
};
