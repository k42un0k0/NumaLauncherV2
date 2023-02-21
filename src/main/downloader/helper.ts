import fs from "fs-extra";
import crypto from "crypto";

export function validateLocal(filePath: string, algo: string, hash: string | null): boolean {
  if (!fs.existsSync(filePath)) return false;
  //No hash provided, have to assume it's good.
  if (hash == null) return true;

  const buf = fs.readFileSync(filePath);
  const calcdhash = crypto.createHash(algo).update(buf).digest("hex");
  return calcdhash === hash.toLowerCase();
}
