import { expect, describe, it, jest } from "@jest/globals";
import { ConfigManager } from "./configManager";
import { AuthAccount } from "./msAccount";
import { vol } from "memfs";
import fs from "fs-extra";
jest.mock("fs");

describe("ConfigManager", () => {
  it("create account", () => {
    const json = {
      "/userData": null,
    };
    vol.fromJSON(json);
    const configManager = new ConfigManager();
    const authAccount: AuthAccount = {
      accessToken: "aaaa",
      username: "testuser",
      uuid: "asdfasdfasdfa",
      displayName: "testuser",
      expiresAt: "2020-12-11T02:12:12.000Z",
      type: "microsoft",
      microsoft: {
        accessToken: "aaaaaaa",
        refreshToken: "aaaaaaaa",
        expiresAt: "2020-12-11T02:12:12.000Z",
      },
    };
    configManager.createAccount(authAccount);
    expect(Object.keys(configManager.config.accounts).length).toBe(1);
    expect(configManager.config.selectedUUID).toBe(authAccount.uuid);
    expect(vol.toJSON()).toStrictEqual({
      "/userData/config.json":
        "{\n" +
        '    "selectedUUID": "asdfasdfasdfa",\n' +
        '    "selectedServer": "",\n' +
        '    "accounts": {\n' +
        '        "asdfasdfasdfa": {\n' +
        '            "accessToken": "aaaa",\n' +
        '            "username": "testuser",\n' +
        '            "uuid": "asdfasdfasdfa",\n' +
        '            "displayName": "testuser",\n' +
        '            "expiresAt": "2020-12-11T02:12:12.000Z",\n' +
        '            "type": "microsoft",\n' +
        '            "microsoft": {\n' +
        '                "accessToken": "aaaaaaa",\n' +
        '                "refreshToken": "aaaaaaaa",\n' +
        '                "expiresAt": "2020-12-11T02:12:12.000Z"\n' +
        "            }\n" +
        "        }\n" +
        "    },\n" +
        '    "setting": {\n' +
        '        "java": {\n' +
        '            "minRAM": "4G",\n' +
        '            "maxRAM": "4G",\n' +
        '            "executable": null,\n' +
        '            "jvmOptions": [\n' +
        '                "-Xmn1G",\n' +
        '                "-Dfile.encoding=utf-8"\n' +
        "            ]\n" +
        "        },\n" +
        '        "game": {\n' +
        '            "resWidth": 1280,\n' +
        '            "resHeight": 720,\n' +
        '            "fullscreen": false,\n' +
        '            "autoConnect": true,\n' +
        '            "launchDetached": true\n' +
        "        },\n" +
        '        "launcher": {\n' +
        '            "allowPrerelease": false,\n' +
        '            "optionStandardize": true,\n' +
        '            "dataDirectory": ".numalauncher"\n' +
        "        }\n" +
        "    }\n" +
        "}",
    });
  });
});
