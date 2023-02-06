import { fs } from "memfs";
import { isWindows } from "../../main/utils/util";
import { IconSet } from "./types";

export function getPlatformIcon(imageSet: IconSet) {
  if (isWindows) {
    console.log(imageSet.win32);
    console.log(__dirname);
    return imageSet.win32;
  }
  return imageSet.linux;
}
