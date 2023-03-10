import { Types } from "./constatnts";

export function resolveDefaultExtension(type: string) {
  switch (type) {
    case Types.Library:
    case Types.ForgeHosted:
    case Types.LiteLoader:
    case Types.ForgeMod:
      return "jar";
    case Types.LiteMod:
      return "litemod";
    case Types.File:
    default:
      return "jar"; // There is no default extension really.
  }
}
