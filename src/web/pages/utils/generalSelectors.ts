import { Server } from "@/common/types";

export const serverSelectors = {
  orderlessName: (server: Server) => {
    const serverName = server.name;
    const reg = /^%*%/;
    if (!reg.test(serverName)) {
      return serverName;
    }
    return serverName.split("%")[2];
  },
};

export const nonNullableSelector =
  <T>(defaultValue: T): ((state?: T | null) => T) =>
  (state) => {
    if (state != null) return state;
    return defaultValue;
  };
