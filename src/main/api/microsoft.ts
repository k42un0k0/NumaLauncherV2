import { getMCAccessToken } from "./mojang";
import axios from "axios";
function urlSearchParamsFromObj(obj: { [k: keyof any]: string }) {
  const formData = new URLSearchParams();

  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
}
const tokenUri = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const authXBLUri = "https://user.auth.xboxlive.com/user/authenticate";
const authXSTSUri = "https://xsts.auth.xboxlive.com/xsts/authorize";

interface XBLToken {
  token: string;
  uhs: string;
}

interface XBLTokenResponse {
  IssueInstant: string;
  NotAfter: string;
  Token: string;
  DisplayClaims: { xui: { uhs: string }[] };
}
async function getXBLToken(accessToken: string): Promise<XBLToken> {
  const options = {
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: {
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${accessToken}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    },
  };
  const response = await axios<XBLTokenResponse>(authXBLUri, options);
  const json = response.data;
  return { token: json.Token, uhs: json.DisplayClaims.xui[0].uhs };
}

type XSTSResponse =
  | { XErr: number }
  | {
      IssueInstant: string;
      NotAfter: string;
      Token: string;
      DisplayClaims: { xui: { uhs: string }[] };
    };
async function getXSTSToken(xblToken: string) {
  const options = {
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: {
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [xblToken],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    },
  };
  const response = await axios<XSTSResponse>(authXSTSUri, options);
  const json = response.data;
  if ("XErr" in json) {
    switch (json.XErr) {
      case 2148916233:
        throw {
          message: "Your Microsoft account is not connected to an Xbox account. Please create one.<br>",
        };

      case 2148916238:
        throw {
          message:
            "Since you are not yet 18 years old, an adult must add you to a family in order for you to use NumaLauncher!",
        };
    }
    throw new Error("予期しないエラー");
  }

  return json.Token;
}

interface AccessTokenResponse {
  refresh_token: string;
  username: string;
  roles: unknown[];
  metadata: undefined;
  access_token: string;
  expires_in: number;
  token_type: string;
}
export async function getAccessToken(authCode: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}> {
  const expiresAt = new Date();
  const options = {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: urlSearchParamsFromObj({
      client_id: process.env.CLIENT_ID,
      code: authCode,
      scope: "XboxLive.signin",
      redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
      grant_type: "authorization_code",
    }),
  };
  const response = await axios<AccessTokenResponse>(tokenUri, options);
  const json = response.data;
  expiresAt.setSeconds(expiresAt.getSeconds() + json.expires_in);
  return {
    expiresAt: expiresAt,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
  };
}

interface RefreshAccessTokenResponse {
  expires_in: number;
  access_token: string;
}
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const expiresAt = new Date();

  const options = {
    method: "post",
    body: urlSearchParamsFromObj({
      client_id: process.env.CLIENT_ID,
      refresh_token: refreshToken,
      scope: "XboxLive.signin",
      redirect_uri: "https://login.microsoftonline.com/common/oauth2/nativeclient",
      grant_type: "refresh_token",
    }),
  };
  const response = await axios<RefreshAccessTokenResponse>(tokenUri, options);
  const json = response.data;
  console.log("RefreshAccessTokenResponse");
  console.log(json);
  expiresAt.setSeconds(expiresAt.getSeconds() + json.expires_in);
  return { expiresAt: expiresAt, accessToken: json.access_token };
}

export async function authMinecraft(accessToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const XBLToken = await getXBLToken(accessToken);
  const XSTSToken = await getXSTSToken(XBLToken.token);
  const MCToken = await getMCAccessToken(XBLToken.uhs, XSTSToken);

  return MCToken;
}

interface MCStoreResopnse {
  items?: { name: string; signature: string }[];
}
export async function checkMSStore(access_token: string) {
  const response = await axios<MCStoreResopnse>("https://api.minecraftservices.com/entitlements/mcstore", {
    method: "get",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });
  const json = response.data;
  if (json.items && json.items.length > 0) return true;
  return false;
}
