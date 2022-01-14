import { Server } from "http";
import express from "express";
import { Server as SocketServer } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import {
    getInitialGameState,
    startGame,
    reduceEvent,
    updateDisplayName,
    redactGameState,
    makeNewPlayer,
} from "./reducer.js";

const app = express();
app.use(express.static("static"));
app.use(cors());

const server = Server(app)
const io = new SocketServer(server, {allowEIO3: true});

var STATIC_CHANNELS = [{
    name: 'Global chat',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Funny',
    participants: 0,
    id: 2,
    sockets: []
}];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

const games = {}

const start = () => {
    console.log(`starting game!`);
    startGame(games[0].state);
    issueUpdate();
};

const issueUpdate = () => {
    for (const o of Object.values(games[0].observers)) {
        const players = (o.cookie && games[0].cookies[o.cookie].players) || [];
        o.callback({
            type: "game_state",
            data: redactGameState(games[0].state, players),
        });
    }
}

const issuePlayerUpdate = (observerId) => {
    const game = games[0];
    const observer = game.observers[observerId];
    const cookie = game.cookies[observer.cookie];
    observer.callback({
        type: "player_assignment",
        data: { players: cookie.players },
    });
}

const registerCookie = (observerId, cookie) => {
    console.log(`registering cookie`);
    const game = games[0];
    const cookies = game.cookies;
    if (!(cookie in cookies)) {
        // this is 0-indexed sequential player number
        const player = makeNewPlayer(game.state);
        cookies[cookie] = { players : [player] };
    }
    game.observers[observerId].cookie = cookie;
    issueUpdate();
    issuePlayerUpdate(observerId);
};

const registerGameObserver = (callback) => {
    const id = uuidv4();
    if (!games[0]) {
        games[0] = {
            state: getInitialGameState(),
            observers: [], // observerId -> {callback, cookie}
            cookies: [], // observers[observerId].cookie -> {players}
        };
    }
    games[0].observers[id] = { callback };
    return id;
};

const processEvent = (observerId, event) => {
    reduceEvent(games[0].state, event);
    issueUpdate();
};

const changeName = (observerId, player, displayName) => {
    updateDisplayName(games[0].state, player, displayName);
    issueUpdate();
}

io.on("connection", (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log("new client connected");
    socket.emit("connection", null);

    socket.on("join", ({ cookie }) => {
        let observerId = registerGameObserver((observerEvent) => {
            console.log(`emitting type = ${observerEvent.type} data = ${observerEvent.data}`);
            socket.emit(observerEvent.type, observerEvent.data)}
        );
        console.log(`registered game observer ${observerId}`);

        registerCookie(observerId, cookie);

        socket.on("start_game", () => {
            start();
        });

        socket.on("change_name", ({ player, displayName }) => {
            changeName(observerId, player, displayName);
        });

        socket.on("event", (event) => {
            console.log("got event ", event);
            try {
                processEvent(observerId, event);
            } catch(e) {
                console.log(e);
            }
        });
    });

    socket.on("channel-join", id => {
        console.log("channel join", id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit("channel", c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit("channel", c);
                }
            }
        });

        return id;
    });

    socket.on("send-message", message => {
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});

/**
 * @description This method retrieves the static channels
 */
app.get("/getChannels", (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});

console.log(`process.env.PORT = ${process.env.PORT}`);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
