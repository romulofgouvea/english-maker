import WebServer from "./server";

const createOAuthClient = () => { }

const requestUserConsent = OAuthClient => { }

const waitForInstagramCallback = webServer => { }

const requestInstagramForAccessTokens = (OAuthClient, authorizationToken) => { }

const setGlobalInstagramAuthentication = OAuthClient => { }

const authenticateWithOAuth = async (type) => {
  const webServer = await WebServer.startWebServer();
  const OAuthClient = await createOAuthClient();

  requestUserConsent(OAuthClient);

  const authorizationToken = await waitForInstagramCallback(webServer);
  await requestInstagramForAccessTokens(OAuthClient, authorizationToken);
  await setGlobalInstagramAuthentication(OAuthClient);

  await WebServer.stopWebServer(webServer);
};

module.exports = {
  authenticateWithOAuth
}