declare interface Window {
  main: unknown;
}

declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_ID: string;
    NODE_ENV: "development" | "production";
  }
}

type ObjectKey = string | number | symbol;

declare module "*.ico" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}
declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}
