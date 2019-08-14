import graph from 'fbgraph'
import open from 'open';

import WebServer from "./server";

var config = {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    scope: 'email',
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI
};

graph.setVersion("4.0");

const requestUserConsent = () => {
    var consentUrl = graph.getOauthUrl({
        "client_id": config.client_id,
        "redirect_uri": config.redirect_uri,
        "scope": config.scope
    });

    open(consentUrl)
    console.log(`> [ROBOT FACEBOOK] Please give your consent: ${consentUrl}`);
}

const waitForFacebookCallback = webServer => {
    return new Promise((resolve, reject) => {
        console.log("> [ROBOT FACEBOOK] Waiting for user consent...");

        webServer.app.get("/oauth2callback", (req, res) => {
            const authCode = req.query.code;
            console.log(`> [ROBOT FACEBOOK] Response code: ${authCode}`);

            res.send("<h1>Thank you!</h1><p>Now close this tab.</p>");
            resolve(authCode);
        });
    });
}

const requestFacebookForAccessTokens = async (authCode) => {
    console.log("> [ROBOT FACEBOOK] Authorize access...");

    var facebookResult = await new Promise((resolve, reject) => {
        graph.authorize({
            "client_id": config.client_id,
            "redirect_uri": config.redirect_uri,
            "client_secret": config.client_secret,
            "code": authCode
        }, (err, data) => {
            if (!data)
                resolve(graph.getAccessToken())
            resolve(data)
        });
    });

    console.log("Token: ", facebookResult.access_token);
}

const authenticateWithOAuth = async () => {
    const webServer = await WebServer.startWebServer();

    requestUserConsent();

    const authCode = await waitForFacebookCallback(webServer);
    await requestFacebookForAccessTokens(authCode);

    await WebServer.stopWebServer(webServer);
};




module.exports = {
    authenticateWithOAuth,
};
