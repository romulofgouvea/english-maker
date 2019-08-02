import express from 'express';

const app = express();
const port = 5000;

const startWebServer = () => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`> [SERVER] Listening on http://localhost:${port}`)

            resolve({
                app,
                server
            })
        })
    })
}

const stopWebServer = async webServer => {
    return new Promise((resolve, reject) => {
        webServer.server.close(() => {
            resolve()
        })
    })
}

module.exports = {
    startWebServer,
    stopWebServer
}