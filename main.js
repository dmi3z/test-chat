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
let participants = [];

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage && parsedMessage.id) {
            let messageForAll = '';
            switch(parsedMessage.id) {
                case 'JOIN_CHAT':
                    const messageForUser = JSON.stringify({ id: 'EXISTING_PARTICIPANTS', data: participants });
                    messageForAll = JSON.stringify({ id: 'NEW_PARTICIPANT', data:  parsedMessage.name })
                    participants.push(parsedMessage.name);
                    ws.send(messageForUser);
                    sendToAll(messageForAll);
                    break;

                case 'NEW_MESSAGE':
                    messageForAll = JSON.stringify({ id: 'NEW_MESSAGE', data: parsedMessage.data });
                    sendToAll(messageForAll);
                    break;

                case 'LEAVE_CHAT':
                    sendToAll(message);
                    participants = participants.filter(part => part !== parsedMessage.name);
                    break;
            }
        }
    });
});

function sendToAll(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
