import axios from "axios";

const authMCUri = "https://api.minecraftservices.com/authentication/login_with_xbox";
const profileURI = "https://api.minecraftservices.com/minecraft/profile";

interface MCAccessTokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
  refresh_token: string;
}

export async function getMCAccessToken(
  UHS: string,
  XSTSToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const expiresAt = new Date();
  const options = {
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({
      identityToken: `XBL3.0 x=${UHS};${XSTSToken}`,
    }),
  };
  const response = await axios<MCAccessTokenResponse>(authMCUri, options);
  const json = response.data;
  expiresAt.setSeconds(expiresAt.getSeconds() + json.expires_in);
  return { accessToken: json.access_token, expiresAt: expiresAt };
}

interface MCProfileResponse {
  id: string;
  name: string;
  skins: {
    id: string;
    state: string;
    url: string;
    variant: string;
  }[];
  capes: unknown[];
  profileActions: unknown;
}
export async function getMCProfile(MCAccessToken: string): Promise<MCProfileResponse> {
  const options = {
    method: "get",
    headers: {
      Authorization: `Bearer ${MCAccessToken}`,
    },
  };
  const response = await axios<MCProfileResponse>(profileURI, options);
  return response.data;
}

interface VersionUrlResonse {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: {
    id: string;
    type: string;
    url: string;
    time: string;
    releaseTime: string;
  }[];
}
export async function getVersionUrl(version: string) {
  const response = await axios.get<VersionUrlResonse>("https://launchermeta.mojang.com/mc/game/version_manifest.json");
  const v = response.data.versions.find((v) => {
    return (v.id = version);
  });
  if (v == null) throw Error;
  return v.url;
}
