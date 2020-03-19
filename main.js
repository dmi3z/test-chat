const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const app = express();
const server = app
    .use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .listen(port, () => {
    console.log('Server started on port: ', port);
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

