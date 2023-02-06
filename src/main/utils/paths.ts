import electron from "electron";
import path from "path";

interface GenPathsValue {
  [key: string]: string | (() => GenPathsValue) | GenPathsValue;
}

type RootPaths<T> = {
  [key in keyof T]?: string;
};
type Path = {
  $path: string;
  $join(...args: string[]): string;
};
type Paths<T> = {
  [key in keyof T]: T[key] extends string
    ? string
    : T[key] extends () => GenPathsValue
    ? (...args: string[]) => Paths<ReturnType<T[key]>> & Path
    : Paths<T[key]> & Path;
};

/**
 * join paths and assign `join` method to string
 * @param args passed throw `path.join`
 * @returns a string assigned `join` method
 */

function genPathFunc(child: GenPathsValue, parentPath: string) {
  return (...args: string[]) => {
    const currntPath = path.join(parentPath, ...args);
    const childResult: any = {};
    const childKeys = Object.keys(child);
    childKeys.forEach((childKey) => {
      const childValue = child[childKey];
      if (typeof childValue === "string") {
        childResult[childKey] = path.join(currntPath, childValue);
        return;
      }
      childResult[childKey] = path.join(currntPath, childKey);
    });
    return Object.assign(genPath({}, currntPath), genPaths(child, childResult));
  };
}
function genPath<T extends GenPathsValue>(value: T, currentPath: string): Path {
  const result = {} as Record<keyof T, unknown>;
  const keys = Object.keys(value);
  keys.forEach((key: keyof typeof value) => {
    const v = value[key];
    if (typeof v == "string") {
      result[key] = path.join(currentPath, v);
      return;
    }
    if (typeof v == "function") {
      result[key] = genPathFunc(v(), path.join(currentPath, key as string));
      return;
    }
    result[key] = genPath(v, path.join(currentPath, key as string));
  });
  return Object.assign({ $path: currentPath, $join: (...args: string[]) => path.join(currentPath, ...args) }, result);
}
export function genPaths<T extends GenPathsValue>(value: T, rootPaths: RootPaths<T>): Paths<T> {
  const result = {} as Record<keyof T, unknown>;
  const keys = Object.keys(value);
  keys.forEach((key: keyof typeof value) => {
    const v = value[key];
    let rootPath = rootPaths[key] || "";
    rootPath = rootPath ? path.join(rootPath) : "";
    if (typeof v == "string") {
      result[key] = rootPath || path.join(v);
      return;
    }
    if (typeof v == "function") {
      result[key] = genPathFunc(v(), path.join(rootPath));
      return;
    }
    result[key] = genPath(v, rootPath);
  });
  return result as Paths<T>;
}

export const sysRoot =
  process.env.APPDATA ||
  (process.platform == "darwin" ? process.env.HOME + "/Library/Application Support" : (process.env.HOME as string));

export const paths = genPaths(
  {
    root: {},
    sysRoot: {},
    launcher: {
      configFile: "config.json",
      distroFile: "distribution.json",
    },
    preloadFile: path.resolve(__dirname, "preload.js"),
  },
  {
    root: __dirname,
    sysRoot: sysRoot,
    launcher: process.env.CONFIG_DIRECT_PATH || electron.app.getPath("userData"),
  }
);
