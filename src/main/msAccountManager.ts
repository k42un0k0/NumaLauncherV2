import * as Microsoft from "./api/microsoft";
import * as Mojang from "./api/mojang";
export interface AuthAccount {
  accessToken: string;
  username: string;
  uuid: string;
  displayName: string;
  expiresAt: string;
  type: "microsoft";
  microsoft: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

export async function fetchMSAccount(authCode: string): Promise<AuthAccount> {
  const MSAccessToken = await Microsoft.getAccessToken(authCode);
  const MCAccessToken = await Microsoft.authMinecraft(
    MSAccessToken.accessToken
  );
  const minecraftBuyed = await Microsoft.checkMSStore(
    MCAccessToken.accessToken
  );
  if (!minecraftBuyed)
    throw {
      message:
        "You didn't buy Minecraft! Please use another Microsoft account or buy Minecraft.",
    };
  const MCProfile = await Mojang.getMCProfile(MCAccessToken.accessToken);
  return JSON.parse(
    JSON.stringify({
      accessToken: MCAccessToken.accessToken,
      username: MCProfile.name.trim(),
      uuid: MCProfile.id,
      displayName: MCProfile.name.trim(),
      expiresAt: MCAccessToken.expiresAt,
      type: "microsoft",
      microsoft: {
        accessToken: MCAccessToken.accessToken,
        refreshToken: MSAccessToken.refreshToken,
        expiresAt: MSAccessToken.expiresAt,
      },
    })
  );
}
