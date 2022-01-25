import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import "./app.css";
import {
    getPlayers,
    shallowEqual,
} from "./helpers";
import { PlayerName } from "./Player";
import { Cards } from "./Cards";
import { HistoryList } from "./HistoryList";
import { WinnersList } from "./WinnersList";

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
    const { socket, getGameState, getAssignedPlayer, getStatus } = s;
    console.log(`in Game with status = ${getStatus()} for assigned player ${getAssignedPlayer()}`);

    const emitEvent = (type, data) => {
        if (getGameState()?.currentPlayer !== getAssignedPlayer()) {
            return;
        }
        socket.emit("event", {
            type,
            player: getGameState().currentPlayer,
            data,
        });
    }

    const playCards = (cards) => {
        console.log(`player ${getAssignedPlayer()} played cards:`);
        for (var c of cards) {
            console.log(`${c.Suit} ${c.Value}`);
        }
        
        if (getGameState().isStartTrick && cards.length === 0) {
            // cannot pass if starting trick
        } else {
            emitEvent("doPlayCards", { cards });

            // check if player has emptied hand and won
            if (getGameState().playerCards[getAssignedPlayer()].length === cards.length) {
                console.log(`player ${getAssignedPlayer()} has won!!!`);
                emitEvent("hasEmptyHand", {});
            }
        }
    }

    const startGame = () => {
        console.log('PRESSED START_GAME BUTTON!'); 
        socket.emit("start_game");
    }

    const changeName = (player, displayName) => {
        localStorage.setItem("playerName", displayName);
        socket.emit("change_name", { player, displayName });
    };

    const title =
        getStatus() === "inprogress" &&
        getAssignedPlayer() === getGameState().currentPlayer ? (
            <h2>It's your turn!</h2>
        ) : (
            <h2>Guandan</h2>
        );

    const startButtonStyle = {
        marginTop: "30px",
    };
    const playButtonStyle = {
        marginTop: "60px",
        marginLeft: "2px",
    };
    const passButtonStyle = {
        marginTop: "60px",
        marginLeft: "12px",
    };

    let [selectedCards, setSelectedCards] = useState([]);

    if (getStatus() === "init") {
        return (
            <div style={{ textAlign: "center" }}>
                <h3>Players</h3>
                <div>
                    {getPlayers(getGameState()).map((p, i) => {
                        const isSelf = i.toString() === getAssignedPlayer();
                        return (
                            <h3>
                                <PlayerName
                                    number={i+1} 
                                    player={p} 
                                    editable={isSelf} 
                                    changeName={changeName} 
                                />
                            </h3>
                        ); 
                    })}
                </div>
                <button style={startButtonStyle} onClick={startGame}>
                   Start Game
                </button>
            </div>
        );
    } else if (getStatus() === "inprogress") {
        let playerCardsNow = getGameState().playerCards[getAssignedPlayer()];
        let history = getGameState().history;
        let playersWon = getGameState().playersWon;

        const selectCard = (c) => {
            console.log(`player ${getAssignedPlayer()} selected card ${c.Suit} ${c.Value}`);
            selectedCards = selectedCards.filter(card => playerCardsNow.some(card2 => shallowEqual(card2, card)));
            if (selectedCards.some(card => shallowEqual(card, c))) {
                selectedCards = selectedCards.filter(card => !shallowEqual(card, c))
            } else {
                selectedCards.push(c);
            }
            setSelectedCards(selectedCards);
        }

        return (
            <div>
                {title}
                <Cards playerCards={playerCardsNow} onPlace={selectCard}/>
                <button style={playButtonStyle} onClick={() => {playCards(selectedCards);}}>Play</button>
                <button style={passButtonStyle} onClick={() => {playCards([]);}}>Pass</button>

                <h3>Recent plays:</h3>
                <HistoryList history={history}/>
                <WinnersList playersWon={playersWon}/>
            </div>
        );
    } else if (getStatus() === "disconnected") {
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
