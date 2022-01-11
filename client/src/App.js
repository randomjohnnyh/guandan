import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { ChannelList } from './ChannelList';
import './app.css';
import { MessagesPanel } from './MessagesPanel';
import {
    getPlayers,
} from "./helpers";
import { Cards } from "./Cards";
import { HistoryList } from "./HistoryList";

function getCookie() {
    let cookie = localStorage.getItem("guandanCookie");
    if (!cookie) {
        cookie = uuidv4();
        localStorage.setItem("guandanCookie", cookie);
    }
    return cookie;
}

function makeSocket(onEvent) {
    const socket = io("/");
    socket.on("connect", () => {
        console.log(`successfully connected to socket-io.client!`);
        const cookie = getCookie();
        socket.emit("join", { cookie });
    });
    
    let _gameState = null;
    let _assignedPlayer = null;
    const getStatus = () => _gameState?.status || "init";

    let _nEvents = 0;
    const handleEvent = (type, event) => {
        switch (type) {
            case "game_state":
                _gameState = event;
                break;
            case "player_assignment":
                _assignedPlayer = event.players[0];
                break;
            default:
                console.error("unknown event");
                return;
        }
        _nEvents++;
        onEvent(_nEvents);
    };

    socket.on("game_state", (e) => {
        console.log(`client is responding to game state change to ${e}!`);
        handleEvent("game_state", e);
    });
    socket.on("player_assignment", (e) => {
        console.log(`assigned player number ${e.players[0]}`);
        handleEvent("player_assignment", e);
    });

    const getGameState = () => _gameState;
    const getAssignedPlayer = () => _assignedPlayer;
    return {socket, handleEvent, getGameState, getAssignedPlayer, getStatus};
}

function Game(props) {
    const setNEvents = useState(0)[1];
    const [s] = useState(() => {
        return makeSocket((n) => {
            setNEvents(n);
        });
    });
    const { socket, handleEvent, getGameState, getAssignedPlayer, getStatus } = s;
    console.log(`in Game with status = ${getStatus()} for assigned player ${getAssignedPlayer()}`);

    const emitEvent = (type, data) => {
        if (!getGameState()?.currentPlayer) {
            return;
        }
        socket.emit("event", {
            type,
            // player: getGameState().currentPlayer,
            player: getAssignedPlayer(),
            data,
        });
    }

    const playCard = (card) => {
        console.log(`player ${getAssignedPlayer()} played card ${card}`);
        emitEvent("doPlayCard", { card });
    }

    const startGame = () => {
        console.log('PRESSED START_GAME BUTTON!'); 
        socket.emit("start_game");
    }

    const title =
        getStatus() === "inprogress" &&
        getAssignedPlayer() === getGameState().currentPlayer ? (
            <h2>It's your turn!</h2>
        ) : (
            <h2>Guandan</h2>
        );
    if (getStatus() === "init") {
        return (
            <button onClick={startGame}>
                Start Game
            </button>
        );
    } else if (getStatus() === "inprogress") {
        let playerCardsNow = getGameState().playerCards[getAssignedPlayer()];
        let history = getGameState().history;
        return (
            <div>
                {title}
                <Cards playerCards={playerCardsNow} onPlace={playCard}/>
                <HistoryList history={history}/>
            </div>
        );
    } else if (getStatus() == "disconnected") {
        return (
            <h1>Game diconnected</h1>
        );
    }
}

function MakeGame() {
    useEffect(() => {
        const gameId = uuidv4();
        window.location.search = `?game=${gameId}`;
    });
    return "Creating game...";
}

export class App extends React.Component {
    state = {
        channels: null,
        socket: null,
        channel: null
    }
    socket;
    handleChannelSelect = id => {
        let channel = this.state.channels.find(c => {
            return c.id === id;
        });
        this.setState({ channel });
        this.socket.emit("channel-join", id, ack => {
        });
    }

    handleSendMessage = (channel_id, text) => {
        this.socket.emit('send-message', { channel_id, text, senderName: this.socket.id, id: Date.now() });
    }

    render() {
        const currentGame = new URL(window.location.href).searchParams.get("game");
        if (!currentGame) {
            console.log(`about to render MakeGame`);
            return (
                <div>
                    <MakeGame />
                </div>
            );
        } else {
            console.log(`about to render Game`);
            return (
                <div className='guandan-app'>
                    <Game />
                </div>
            );
        }
    }
}
