import { describe, expect, it, jest } from "@jest/globals";
import { isWindows } from "./util";
import { genPaths } from "./paths";
jest.mock("electron");
describe("genPaths", () => {
  it("should return object with string value", () => {
    const paths = genPaths(
      { sample: "sample.json", bin: {}, src: { configFile: "config.json" } },
      { bin: "/usr/bin", src: "/home" }
    );
    if (isWindows) {
      expect(paths.sample).toBe("sample.json");
      expect(paths.bin.$path).toBe("\\usr\\bin");
      expect(paths.src.$path).toBe("\\home");
      expect(paths.src.configFile).toBe("\\home\\config.json");
    } else {
      expect(paths.sample).toBe("sample.json");
      expect(paths.bin.$path).toBe("/usr/bin");
      expect(paths.src.$path).toBe("/home");
      expect(paths.src.configFile).toBe("/home/config.json");
    }
  });
  it("should return if passed function", () => {
    const paths = genPaths(
      {
        first: () => {
          return {
            foo: {},
            bar: () => {
              return {
                fizz: {},
                buzz: "buzz.json",
              };
            },
          };
        },
        second: {
          aaa: () => {
            return {
              ccc: {},
            };
          },
        },
      },
      {
        first: "/home",
        second: "/usr",
      }
    );
    if (isWindows) {
      expect(paths.first("www").$path).toBe("\\home\\www");
      expect(paths.first("www").foo.$path).toBe("\\home\\www\\foo");
      expect(paths.first("www").bar("xyz").$path).toBe("\\home\\www\\bar\\xyz");
      expect(paths.first("www").bar("xyz").fizz.$path).toBe("\\home\\www\\bar\\xyz\\fizz");
      expect(paths.first("www").bar("xyz").buzz).toBe("\\home\\www\\bar\\xyz\\buzz.json");
      expect(paths.second.$path).toBe("\\usr");
      expect(paths.second.aaa("bbb").$path).toBe("\\usr\\aaa\\bbb");
      expect(paths.second.aaa("bbb").ccc.$path).toBe("\\usr\\aaa\\bbb\\ccc");
    } else {
      expect(paths.first("www").$path).toBe("/home/www");
      expect(paths.first("www").foo.$path).toBe("/home/www/foo");
      expect(paths.first("www").bar("xyz").$path).toBe("/home/www/bar/xyz");
      expect(paths.first("www").bar("xyz").fizz.$path).toBe("/home/www/bar/xyz/fizz");
      expect(paths.first("www").bar("xyz").buzz).toBe("/home/www/bar/xyz/buzz.json");
      expect(paths.second.$path).toBe("/usr");
      expect(paths.second.aaa("bbb").$path).toBe("/usr/aaa/bbb");
      expect(paths.second.aaa("bbb").ccc.$path).toBe("/usr/aaa/bbb/ccc");
    }
  });
});
