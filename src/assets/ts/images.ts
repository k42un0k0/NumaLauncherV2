import { paths } from "../../main/utils/paths";
import SealCircleWin32 from "../images/SealCircle.ico";
import SealCircleLinux from "../images/SealCircle.svg";
import { IconSet } from "./types";

export const SealCircleSet: IconSet = {
  win32: paths.root.$join(SealCircleWin32),
  linux: paths.root.$join(SealCircleLinux),
};
