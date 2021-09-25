/*** CONFIG ***/
const PORT = 8080;


/*** SETUP ***/
const fs = require("fs");
const express = require('express');
const https = require("https");
const main = express()


let privateKey, certificate;

privateKey = fs.readFileSync("ssl/server-key.pem", "utf8");
certificate = fs.readFileSync("ssl/server-cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };
const server = https.createServer(credentials, main);

const io  = require('socket.io').listen(server);

server.listen(PORT, null, function() {
    console.log("Listening on port " + PORT);
});

 main.get('/', function(req, res){ res.sendFile(__dirname + '/client.html'); });
 main.get('/styles.css', function(req, res){ res.sendfile('styles.css'); });
 main.get('/notes/C.mp3', function(req, res){ res.sendfile(__dirname + '/notes/C.mp3'); console.log('C.mp3 Requested');});
 main.get('/notes/Db.mp3', function(req, res){ res.sendfile(__dirname + '/notes/Db.mp3'); console.log('Db.mp3 Requested');});
 main.get('/notes/D.mp3', function(req, res){ res.sendfile(__dirname + '/notes/D.mp3'); console.log('D.mp3 Requested');});
 main.get('/notes/Eb.mp3', function(req, res){ res.sendfile(__dirname + '/notes/Eb.mp3'); console.log('Eb.mp3 Requested');});
 main.get('/notes/E.mp3', function(req, res){ res.sendfile(__dirname + '/notes/E.mp3'); console.log('E.mp3 Requested');});
 main.get('/notes/F.mp3', function(req, res){ res.sendfile(__dirname + '/notes/F.mp3'); console.log('F.mp3 Requested');});
 main.get('/notes/Gb.mp3', function(req, res){ res.sendfile(__dirname + '/notes/Gb.mp3'); console.log('Gb.mp3 Requested');});
 main.get('/notes/G.mp3', function(req, res){ res.sendfile(__dirname + '/notes/G.mp3'); console.log('G.mp3 Requested');});
 main.get('/notes/Ab.mp3', function(req, res){ res.sendfile(__dirname + '/notes/Ab.mp3'); console.log('Ab.mp3 Requested');});
 main.get('/notes/A.mp3', function(req, res){ res.sendfile(__dirname + '/notes/A.mp3'); console.log('A.mp3 Requested');});
 main.get('/notes/Bb.mp3', function(req, res){ res.sendfile(__dirname + '/notes/Bb.mp3'); console.log('Bb.mp3 Requested');});
 main.get('/notes/B.mp3', function(req, res){ res.sendfile(__dirname + '/notes/B.mp3'); console.log('B.mp3 Requested');});



var channels = {};
var sockets = {};


io.sockets.on('connection', function (socket) {
    socket.channels = {};
    sockets[socket.id] = socket;

    console.log("["+ socket.id + "] connection accepted");

    socket.on('join', function (config) {
        console.log("["+ socket.id + "] join ", config);
        var channel = config.channel;
        var userdata = config.userdata;

        if (channel in socket.channels) {
            console.log("["+ socket.id + "] ERROR: already joined ", channel);
            return;
        }

        if (!(channel in channels)) {
            channels[channel] = {};
        }

        for (id in channels[channel]) {
            channels[channel][id].emit('addPeer', {'peer_id': socket.id, 'should_create_offer': false});
            socket.emit('addPeer', {'peer_id': id, 'should_create_offer': true});
        }

        channels[channel][socket.id] = socket;
        socket.channels[channel] = channel;
    });

    socket.on('relayICECandidate', function(config) {
        var peer_id = config.peer_id;
        var ice_candidate = config.ice_candidate;
        console.log("["+ socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);

        if (peer_id in sockets) {
            sockets[peer_id].emit('iceCandidate', {'peer_id': socket.id, 'ice_candidate': ice_candidate});
        }
    });

    socket.on('relaySessionDescription', function(config) {
        var peer_id = config.peer_id;
        var session_description = config.session_description;
        console.log("["+ socket.id + "] relaying session description to [" + peer_id + "] ", session_description);

        if (peer_id in sockets) {
            sockets[peer_id].emit('sessionDescription', {'peer_id': socket.id, 'session_description': session_description});
        }
    });


    // PIANO
    
    socket.on('keydown', (white, black) => {
        console.log('keydown event')
          io.emit('receiveKeyDown', {
            whiteKeyIndex: white,
            blackKeyIndex: black
        });
        console.log('receiveKeyDown')
    
      });
    
    
      socket.on('keyup', (white, black) => {
        console.log('keyup event')
    
          io.emit('receiveKeyUp', {
            whiteKeyIndex: white,
            blackKeyIndex: black
        });
    
        console.log('receiveKeyUp')
    
      });
});
