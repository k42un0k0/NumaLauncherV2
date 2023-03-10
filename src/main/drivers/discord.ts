// Work in progress
import loggerutil from "../utils/loggerutil";
const logger = loggerutil("%c[DiscordWrapper]", "color: #7289da; font-weight: bold");

import { Client } from "discord-rpc";
import { DiscordJson, DiscordJson2 } from "../entities/distribution/json";

export class DiscordWrapper {
  static client: Client | null;
  static activity: Record<string, unknown> | null;
  static initRPC(genSettings: DiscordJson, servSettings: DiscordJson2, initialDetails = "ロード中..") {
    DiscordWrapper.client = new Client({ transport: "ipc" });

    DiscordWrapper.activity = {
      details: initialDetails,
      state: "▶" + servSettings.shortId,
      largeImageKey: servSettings.largeImageKey,
      largeImageText: servSettings.largeImageText,
      smallImageKey: genSettings.smallImageKey,
      smallImageText: genSettings.smallImageText,
      startTimestamp: new Date().getTime(),
      instance: false,
    };

    DiscordWrapper.client.on("ready", () => {
      logger.log("Discord RPC Connected");
      DiscordWrapper.client!.setActivity(DiscordWrapper.activity!);
    });

    DiscordWrapper.client.login({ clientId: genSettings.clientId }).catch((error: any) => {
      if (error.message.includes("ENOENT")) {
        logger.log("Unable to initialize Discord Rich Presence, no client detected.");
      } else {
        logger.log("Unable to initialize Discord Rich Presence: " + error.message, error);
      }
    });
  }

  static updateDetails(details: string) {
    DiscordWrapper.activity!.details = details;
    DiscordWrapper.client!.setActivity(DiscordWrapper.activity!);
  }

  static shutdownRPC() {
    if (!DiscordWrapper.client) return;
    DiscordWrapper.client.clearActivity();
    DiscordWrapper.client.destroy();
    DiscordWrapper.client = null;
    DiscordWrapper.activity = null;
  }
}
