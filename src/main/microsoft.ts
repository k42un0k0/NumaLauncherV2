import fetch, { Headers, FormData } from "node-fetch";
function formDataFromObj(obj: { [k: keyof any]: string | Blob }) {
  const formData = new FormData();

  for (const key in obj) {
    formData.append(key, obj[key]);
  }
  return formData;
}

const tokenUri =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const authXBLUri = "https://user.auth.xboxlive.com/user/authenticate";
const authXSTSUri = "https://xsts.auth.xboxlive.com/xsts/authorize";
const authMCUri =
  "https://api.minecraftservices.com/authentication/login_with_xbox";
const profileURI = "https://api.minecraftservices.com/minecraft/profile";

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
    body: JSON.stringify({
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${accessToken}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    }),
  };
  const response = await fetch(authXBLUri, options);
  const json = (await response.json()) as XBLTokenResponse;
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
    body: JSON.stringify({
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [xblToken],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    }),
  };
  const response = await fetch(authXSTSUri, options);
  const json = (await response.json()) as XSTSResponse;
  if ("XErr" in json) {
    switch (json.XErr) {
      case 2148916233:
        throw {
          message:
            "Your Microsoft account is not connected to an Xbox account. Please create one.<br>",
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

interface MCAccessTokenResponse {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
  refresh_token: string;
}
async function getMCAccessToken(
  UHS: string,
  XSTSToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const expiresAt = new Date();
  const options = {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityToken: `XBL3.0 x=${UHS};${XSTSToken}`,
    }),
  };
  const response = await fetch(authMCUri, options);
  const json = (await response.json()) as MCAccessTokenResponse;
  expiresAt.setSeconds(expiresAt.getSeconds() + json.expires_in);
  return { accessToken: json.access_token, expiresAt: expiresAt };
}

interface AccessTokenResponse {
  // ↓refresh_tokenは存在しない、けどrefresh_tokenをどこで使っているかわかるまで書いておく
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

    body: formDataFromObj({
      client_id: process.env.CLIENT_ID,
      code: authCode,
      scope: "XboxLive.signin",
      redirect_uri:
        "https://login.microsoftonline.com/common/oauth2/nativeclient",
      grant_type: "authorization_code",
    }),
  };

  const response = await fetch(tokenUri, options);
  const json = (await response.json()) as AccessTokenResponse;
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
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const expiresAt = new Date();

  const options = {
    method: "post",
    body: formDataFromObj({
      client_id: process.env.CLIENT_ID,
      refresh_token: refreshToken,
      scope: "XboxLive.signin",
      redirect_uri:
        "https://login.microsoftonline.com/common/oauth2/nativeclient",
      grant_type: "refresh_token",
    }),
  };
  const response = await fetch(tokenUri, options);
  const json = (await response.json()) as RefreshAccessTokenResponse;
  console.log("RefreshAccessTokenResponse");
  console.log(json);
  expiresAt.setSeconds(expiresAt.getSeconds() + json.expires_in);
  return { expiresAt: expiresAt, accessToken: json.access_token };
}

export async function authMinecraft(
  accessToken: string
): Promise<{ accessToken: string; expiresAt: Date }> {
  const XBLToken = await getXBLToken(accessToken);
  const XSTSToken = await getXSTSToken(XBLToken.token);
  const MCToken = await getMCAccessToken(XBLToken.uhs, XSTSToken);

  return MCToken;
}

interface MCStoreResopnse {
  items?: { name: string; signature: string }[];
}
export async function checkMCStore(access_token: string) {
  const response = await fetch(
    "https://api.minecraftservices.com/entitlements/mcstore",
    {
      method: "get",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + access_token,
      },
    }
  );
  const json = (await response.json()) as MCStoreResopnse;
  if (json.items && json.items.length > 0) return true;
  return false;
}

interface MCProfileResponse {
  id: string;
  name: string;
}
export async function getMCProfile(
  MCAccessToken: string
): Promise<MCProfileResponse> {
  const options = {
    method: "get",
    headers: {
      Authorization: `Bearer ${MCAccessToken}`,
    },
  };
  const resonse = await fetch(profileURI, options);
  return resonse.json() as Promise<MCProfileResponse>;
}
