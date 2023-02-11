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

interface GetCurrentSkinResponse {
  id: string;
  name: string;
  properties: {
    name: string;
    value: string;
    signature: string;
  }[];
}
interface GetCurrentSkinResponseValue {
  timestamp: number;
  profileId: string;
  profileName: string;
  signatureRequired: boolean;
  textures: Textures;
}

interface Textures {
  SKIN: Skin;
  CAPE: Cape;
}

interface Skin {
  url: string;
  metadata: Metadata;
}

interface Metadata {
  model: string;
}

interface Cape {
  url: string;
}
// 3dview今着ているスキンの呼び出しAPI
export async function getCurrentSkin(
  uuid: string
): Promise<{ skinURL: string; model: "default" | "slim" | undefined }> {
  const response = await axios.get<GetCurrentSkinResponse>(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
  );
  const data = response.data;
  const base64Textures = data.properties.find((element) => element.name == "textures")?.value || "";
  if (base64Textures == "") {
    throw new Error("skin not found");
  }
  const texturesJSON = atob(base64Textures);
  const textures = JSON.parse(texturesJSON.toString()) as GetCurrentSkinResponseValue;
  const skinURL = textures.textures.SKIN.url;
  let model: "default" | "slim" | undefined = "default";
  if ("metadata" in textures.textures.SKIN) {
    model = textures.textures.SKIN.metadata.model as undefined | "slim";
  }
  console.log(textures.textures.SKIN);
  return { model, skinURL };
}

// TextureIDを取得するAPI
export async function getTextureID(uuid: string) {
  let textureID = null;
  try {
    const response = await axios.get<GetCurrentSkinResponse>(
      `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`
    );
    let base64Textures = "";
    response.data.properties.forEach((element) => {
      if (element.name == "textures") {
        base64Textures = element.value;
      }
    });
    if (base64Textures != "") {
      const texturesJSON = atob(base64Textures);
      const textures = JSON.parse(texturesJSON.toString());
      const skinURL = textures.textures.SKIN.url;
      textureID = skinURL.replace("http://textures.minecraft.net/texture/", "");
    }
  } catch (error) {
    console.log(error);
  }
  return textureID;
}

export async function uploadSkin(variant: string, file: File, accessToken: string) {
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  };

  const param = new FormData();
  if (variant === "slim") {
    param.append("variant", variant);
  } else {
    param.append("variant", "classic");
  }
  param.append("file", file, "skin.png");
  await axios.post("https://api.minecraftservices.com/minecraft/profile/skins", param, config);
}
