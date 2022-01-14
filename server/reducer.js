import _ from "lodash";

const NUM_PLAYERS = 4;
const NUM_CARDS = 108;
const PLAYER_NUM_CARDS = NUM_CARDS / NUM_PLAYERS;

export function makeNewPlayer(gameState) {
    if (gameState.status !== "init") {
        console.log(`Invalid move. Player cannot be added to a ${gameState.status} game.`);
        return;
    } 
    const newPlayer = _.cloneDeep(initialPlayerState);
    newPlayer.displayName = `Player ${gameState.numberPlayers}`;
    const res = gameState.numberPlayers.toString();
    gameState.players[res] = newPlayer;

    gameState.numberPlayers++;
    return res;
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
            = _.sortBy(shuffled_arr.slice(i * PLAYER_NUM_CARDS, (i+1) * PLAYER_NUM_CARDS));
        console.log(`player ${i} has cards ${gameState.playerCards[i]}`);
    }

    gameState.status = "inprogress";
}

export function reduceEvent(gameState, event) {
    console.log(event);
    gameState.events.push(event);
    switch (event.type) {
        case "doPlayCards":
            doPlayCards(gameState, event);
            break;    
    }
    gameState.currentPlayer = (
        (parseInt(gameState.currentPlayer) + 1) % NUM_PLAYERS
    ).toString();
}

function doPlayCards(gameState, event) {
    console.log(`player ${event.player} played cards ${event.data.cards}!`);
    let cards = gameState.playerCards[parseInt(event.player)];

    // remove played cards from player hand
    gameState.playerCards[parseInt(event.player)] = cards.filter((c) => !event.data.cards.includes(c));

    // record history in game state
    gameState.history.push([event.player, event.data.cards]);
}

export function updateDisplayName(gameState, player, displayName) {
    gameState.players[player].displayName = displayName;
}

var initialPlayerState = {
    displayName: "",
    cards: [],
}

var initialGameState = {
    numberPlayers: 0,
    currentPlayer: "0",
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

export function redactGameState(gameState, assignedPlayers) {
    const redacted = _.cloneDeep(gameState);
    return redacted;
}
