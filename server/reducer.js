import _ from "lodash";

const NUM_PLAYERS = 4;
const NUM_CARDS = 108;
const PLAYER_NUM_CARDS = NUM_CARDS / NUM_PLAYERS;

export function makeNewPlayer(gameState) {
    if (gameState.status !== "init") {
        console.log(`Invalid move. Player cannot be added to a ${gameState.status} game.`);
        return;
    } 
    gameState.numberPlayers++;
    const newPlayer = _.cloneDeep(initialPlayerState);
    gameState.players[gameState.numberPlayers.toString()] = newPlayer;

    return gameState.numberPlayers.toString();
}

export function startGame(gameState) {
    if (gameState.status !== "init") {
        console.log(`
            Invalid move. Player cannot start a game with status ${gameState.status}`
        );
        return;
    };

    // initial drawing of cards
    var arr = [];
    for (var i = 0; i < NUM_CARDS; i++) {
        arr.push(i);
    } 
    let shuffled_arr = _.shuffle(arr)
    for (var i = 0; i < NUM_PLAYERS; i++) {
        gameState.playerCards[i]
            = shuffled_arr.slice(i * PLAYER_NUM_CARDS, (i+1) * PLAYER_NUM_CARDS);
        console.log(`player ${i} has cards ${gameState.playerCards[i]}`);
    }

    gameState.status = "inprogress";
}

export function reduceEvent(gameState, event) {
    gameState.events.push(event);
    switch (event.type) {
        case "doPlayCard":
            doPlayCard(gameState, event);
            break;    
    }
    gameState.currentPlayer = (
        (parseInt(gameState.currentPlayer) % NUM_PLAYERS) + 1
    ).toString();
}

function doPlayCard(gameState, event) {
    console.log(`player ${event.player} played card ${event.data.card}!`);
    let cards = gameState.playerCards[parseInt(event.player)];
    // remove played card from player hand
    const index = cards.indexOf(event.data.card);
    cards.splice(index, 1);

    // record history in game state
    gameState.history.push([event.player, event.data.card]);
}

var initialPlayerState = {
    displayName: "",
    cards: [],
}

var initialGameState = {
    numberPlayers: 0,
    currentPlayer: "1",
    status: "init", // "init", "inprogress", "ended"
    players: {}, // player number to Player object
    playerCards: [[], [], [], []], // player number to list of cards remaining in hand
    history: [[1, 0], [2, 0], [3, 0], [4, 0]], // 0 = pass 
    events: [],
}

export function getInitialGameState() {
    for (var i = 0; i < NUM_CARDS; i++) {
        initialGameState.playerCards[Math.floor(i / PLAYER_NUM_CARDS)].push(i);
    }
    return _.cloneDeep(initialGameState);
}

export function redactGameState(gameState) {
    const redacted = _.cloneDeep(gameState);
    return gameState;
}
