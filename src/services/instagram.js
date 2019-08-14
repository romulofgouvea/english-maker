import axios from 'axios';
import open from 'open';
import querystring from 'querystring'

import WebServer from "./server";
import { UArchive } from "~/utils";

const global = {
	token: ""
}

const requestUserConsent = () => {
	var consentUrl = `${process.env.INSTAGRAM_URL}/oauth/authorize/?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&response_type=code`
	open(consentUrl)
	console.log(`> [ROBOT INSTAGRAM] Please give your consent: ${consentUrl}`);
}

const waitForInstagramCallback = webServer => {
	return new Promise((resolve, reject) => {
		console.log("> [ROBOT YOUTUBE] Waiting for user consent...");

		webServer.app.get("/oauth2callback", (req, res) => {
			const authCode = req.query.code;
			console.log(`> [ROBOT YOUTUBE] Response code: ${authCode}`);

			res.send("<h1>Thank you!</h1><p>Now close this tab.</p>");
			resolve(authCode);
		});
	});
}

const requestInstagramForAccessTokens = async (authCode) => {
	const params = {
		client_id: process.env.INSTAGRAM_CLIENT_ID,
		client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
		grant_type: 'authorization_code',
		redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
		code: authCode
	}
	const instagramResult = await axios.post(`${process.env.INSTAGRAM_URL}/oauth/access_token`, querystring.stringify(params))

	console.log("User: ", instagramResult.data.user.username);
	global.token = instagramResult.data.access_token;
}

const authenticateWithOAuth = async () => {
	const webServer = await WebServer.startWebServer();

	requestUserConsent();

	const authCode = await waitForInstagramCallback(webServer);
	await requestInstagramForAccessTokens(authCode);

	await WebServer.stopWebServer(webServer);
};

const sendVideoTimeLine = () => { }

const uploadVideo = (source) => {
	source = UArchive.getBaseUrl(source)

	
}

const sendVideoStories = async source => {
	//const arrVideos = UArchive.listFilesDir(source);

	uploadVideo(source)
}

module.exports = {
	authenticateWithOAuth,
	sendVideoTimeLine,
	sendVideoStories
}