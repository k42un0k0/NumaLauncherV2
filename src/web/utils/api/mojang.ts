import axios from "axios";
export const statuses = [
  {
    service: "sessionserver.mojang.com",
    status: "green",
    name: "Multiplayer Session Service",
    essential: true,
  },
  {
    service: "authserver.mojang.com",
    status: "grey",
    name: "Authentication Service",
    essential: true,
  },
  {
    service: "textures.minecraft.net",
    status: "grey",
    name: "Minecraft Skins",
    essential: false,
  },
  {
    service: "api.mojang.com",
    status: "grey",
    name: "Public API",
    essential: false,
  },
  {
    service: "minecraft.net",
    status: "grey",
    name: "Minecraft.net",
    essential: false,
  },
  {
    service: "account.mojang.com",
    status: "grey",
    name: "Mojang Accounts Website",
    essential: false,
  },
];

export const statusToHex = function (status: string) {
  switch (status.toLowerCase()) {
    case "green":
      return "#a5c325";
    case "yellow":
      return "#eac918";
    case "red":
      return "#c32625";
    case "grey":
    default:
      return "#848484";
  }
};
