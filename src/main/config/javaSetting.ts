import os from "os";
export const javaSettingArgs = ["minRAM", "maxRAM", "executable", "jvmOptions"];
export class JavaSetting {
  static default() {
    return new JavaSetting(resolveMinRAM(), resolveMaxRAM(), null, ["-Xmn1G", "-Dfile.encoding=utf-8"]);
  }
  constructor(
    public minRAM: string,
    public maxRAM: string,
    public executable: string | null,
    public jvmOptions: string[]
  ) {}
  getExecutable() {
    return this.executable;
  }
  setExecutable(executable: string | null) {
    this.executable = executable;
  }
}

function resolveMaxRAM() {
  const mem = os.totalmem();
  return mem >= 8000000000 ? "4G" : mem >= 6000000000 ? "3G" : "2G";
}

function resolveMinRAM() {
  return resolveMaxRAM();
}
