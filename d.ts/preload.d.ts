declare interface Window {
  main: unknown;
}

declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_ID: string;
  }
}
