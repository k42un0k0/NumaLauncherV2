class LoggerUtil {
  constructor(private prefix: string, private style: string) {}

  log(...args: any[]) {
    console.log.apply(null, [this.prefix, this.style, ...args]);
  }

  info(...args: any[]) {
    console.info.apply(null, [this.prefix, this.style, ...args]);
  }

  warn(...args: any[]) {
    console.warn.apply(null, [this.prefix, this.style, ...args]);
  }

  debug(...args: any[]) {
    console.debug.apply(null, [this.prefix, this.style, ...args]);
  }

  error(...args: any[]) {
    console.error.apply(null, [this.prefix, this.style, ...args]);
  }
}

export default function (prefix: string, style: string) {
  return new LoggerUtil(prefix, style);
}
