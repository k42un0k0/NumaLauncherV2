import { isWindows } from "@/main/utils/util";
import { fs } from "memfs";
import { IconSet } from "./types";

export function getPlatformIcon(imageSet: IconSet) {
  if (isWindows) {
    console.log(__dirname);
    return imageSet.win32;
  }
  return imageSet.linux;
}
