import _ from "lodash";

const NUM_PLAYERS = 4;
const NUM_CARDS = 108;
const NUM_CARDS_IN_SUIT = 13;
const suits = ["clubs", "diamonds", "hearts", "spades"];
const NUM_SUITS = suits.length;
const PLAYER_NUM_CARDS = NUM_CARDS / NUM_PLAYERS;

export function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}

export function arrayEquals(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length
        && a.every((val, index) => val === b[index]);
}

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

function Card(suit, value, deck) {
    this.Suit = suit;
    this.Value = value;
    this.Deck = deck;
}

var initialDecks = [[], []];
for (var deck = 0; deck <= 1; deck++) {
    for (var suit = 0; suit < NUM_SUITS; suit++) {
        for (var val = 1; val <= NUM_CARDS_IN_SUIT; val++) {
            // ranking is 3 lowest, A and 2 highest
            initialDecks[deck].push(new Card(suits[suit], val + 2, deck));
        }
    }
    initialDecks[deck].push(new Card("joker", 100, deck));
    initialDecks[deck].push(new Card("joker", 101, deck));
}

export function startGame(gameState) {
    if (gameState.status !== "init") {
        console.log(`
            Invalid move. Player cannot start a game with status ${gameState.status}`
        );
        return;
    };

    // initial drawing of cards
    var deck = _.cloneDeep(initialDecks[0]).concat(_.cloneDeep(initialDecks[1]));
    let shuffledDeck = _.shuffle(deck);
    
    for (var i = 0; i < NUM_PLAYERS; i++) {
        gameState.playerCards[i] = shuffledDeck.slice(i * PLAYER_NUM_CARDS,
                (i+1) * PLAYER_NUM_CARDS);

        gameState.playerCards[i].sort((a, b) => {
            if (a.Suit === "joker" && b.Suit === "joker") {
                return a.Value > b.Value ? 1 : -1;
            }
            if (a.Suit === "joker") {
                return 1;
            }
            if (b.Suit === "joker") {
                return -1;
            }
            return a.Value > b.Value ? 1 : -1;
        });

        console.log(`player ${i} has cards:`);
        for (var c of gameState.playerCards[i]) {
            console.log(`${c.Suit} ${c.Value} ${c.Deck}`);
        }
    }

    gameState.status = "inprogress";
}

export function reduceEvent(gameState, event) {
    validateEvent(gameState, event);
    gameState.events.push(event);
    
    switch (event.type) {
        case "hasEmptyHand":
            hasEmptyHand(gameState, event); 
            break;
        case "doPlayCards":
            doPlayCards(gameState, event);
            break;    
    }
    // TODO: find next player who has not won yet
    gameState.currentPlayer = (
        (parseInt(gameState.currentPlayer) + 1) % NUM_PLAYERS
    ).toString();
}

function getCardValueFreq(cards) {
    var map = {}
    cards.forEach(c => {
        if (map[c.Value]) {
            map[c.Value]++;
        } else {
            map[c.Value] = 1;
        }
    });
    return map;
}

function areKeysConsecutive(keys) {
    for (var i = 1; i < keys.length; i++) {
        if (keys[i] != keys[i-1] + 1) {
            return false;
        }
    }
    return true;
}

function areSameSuit(cards) {
    var suit = cards[0].Suit;
    for (var c in cards) {
        if (c.Suit !== suit) {
            return false;
        }
    }
    return true;
}

function getTrick(cards) {
    var valueFreq = getCardValueFreq(cards);
    var freqSorted = Object.values(valueFreq).map(x => parseInt(x));
    freqSorted.sort(function(a, b) { return a - b; });
    var keySorted = Object.keys(valueFreq).map(x => parseInt(x));
    keySorted.sort(function(a, b) { return a - b;});
    var len = freqSorted.length;

    // straights, K-straight-flushes have base value K*1000
    console.log(`freqSorted = ${freqSorted}`);
    console.log(`keySorted = ${keySorted}`);
    console.log(`${cards.length} ${len === cards.length} ${areKeysConsecutive(keySorted)}`);
    if (cards.length >= 5 && len === cards.length && areKeysConsecutive(keySorted)) {
        if (areSameSuit(cards)) {
            return {Format: "Bomb", Value: cards.length * 1000 + keySorted[len - 1]};
        }
        return {Format: "Straight" + len, Value: keySorted[len - 1]}; 
    }

    // K-bombs has base value K*100
    if (cards.length >= 4 && len === 1) {
        return {Format: "Bomb", Value: cards.length * 100 + cards[0].Value};
    }

    // tractors 
    if (cards.length >= 6 && len === cards.length / 2 && arrayEquals(freqSorted, Array(len).fill(2))) {
        if (areKeysConsecutive(keySorted)) {
            return {Format: "Tractor" + len, Value: keySorted[len - 1]};
        }
    }

    // airplanes
    if (cards.length >= 6 && len === cards.length / 3 && arrayEquals(freqSorted, Array(len).fill(3))) {
        if (areKeysConsecutive(keySorted)) {
            console.log(`are consecutive!`);
            return {Format: "Airplane" + len, Value: keySorted[len - 1]};
        }
    }

    // other formats
    if (cards.length === 1) {
        return {Format: "Single", Value: cards[0].Value};
    } else if (cards.length === 2) {
        if (len === 1) {
            return {Format: "Pair", Value: cards[0].Value};
        }
    } else if (cards.length === 3) {
        if (len === 1) {
            return {Format: "Triple", Value: cards[0].Value};
        }
    } else if (cards.length === 5) {
        if (len === 2 && arrayEquals(freqSorted, [2, 3])) {
            var tripValue = keySorted.find(key => valueFreq[key] === 3);
            return {Format: "FullHouse", Value: parseInt(tripValue)};
        }
    }

    return {Format: "Invalid"};
}

function validateEvent(gameState, event) {
    switch (event.type) {
        case "hasEmptyHand":
            break;
        case "doPlayCards":
            // is playing passing?
            if (event.data.cards.length === 0) { break; }

            var trick = getTrick(event.data.cards);

            // get previous valid trick
            var prvTrickIndex = gameState.history.length - 1;
            var cnt = NUM_PLAYERS - 2;
            while (cnt > 0 && gameState.history[prvTrickIndex][1].length == 0) {
                prvTrickIndex--;
                cnt--;
            }
            var prvTrick = getTrick(gameState.history[prvTrickIndex][1]);
            var isStartTrick = (prvTrick.Format === "Invalid");
            console.log(`prvTrickIndex = ${prvTrickIndex} isStartTrick = ${isStartTrick} trickFormat = ${trick.Format} ${trick.Value}`);

            if (isStartTrick) {
                // if starter trick, needs to be valid trick-format 
                if (trick.Format === "Invalid") {
                    throw new Error("Invalid trick format.");
                }
            } else {
                // if follower trick, and not bomb, need to follow trick-format and have larger value
                if (trick.Format !== "Bomb" && trick.Format != prvTrick.Format) {
                    throw new Error("Must follow trick format.");
                }
                if (trick.Value <= prvTrick.Value) {
                    throw new Error("Must be larger than previous trick.");
                }
            }
            break;
    }
}

function hasEmptyHand(gameState, event) {
    gameState.playersWon.push(event.player);
    console.log(`player ${event.player} has won! all players won ${gameState.playersWon}`);
}

function doPlayCards(gameState, event) {
    console.log(`player ${event.player} played cards:`)
    for (var c of event.data.cards) {
        console.log(`${c.Suit} ${c.Value}`);
    }
    let cards = gameState.playerCards[parseInt(event.player)];

    // remove played cards from player hand
    gameState.playerCards[parseInt(event.player)] = cards.filter((c) =>
            !event.data.cards.some(card => shallowEqual(card, c)));

    // record history in game state
    gameState.history.push([event.player, event.data.cards]);

    // flip isStartingTrick if necessary
    var hlen = gameState.history.length;
    if (gameState.history[hlen-1][1].length === 0
            && gameState.history[hlen-2][1].length === 0
            && gameState.history[hlen-3][1].length === 0) {
        gameState.isStartTrick = true;
    } else {
        gameState.isStartTrick = false;
    }
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
    history: [[0, []], [1, []], [2, []], [3, []]], // 0 = pass 
    events: [],
    isStartTrick: true,
    playersWon: [],
}

export function getInitialGameState() {
    for (var i = 0; i < NUM_PLAYERS; i++) {
        for (var k = 0; k < PLAYER_NUM_CARDS; k++) {
            initialGameState.playerCards[i].push({Suit: "joker", Value: 101});
        }
    }
    return _.cloneDeep(initialGameState);
}

export function redactGameState(gameState, assignedPlayers) {
    const redacted = _.cloneDeep(gameState);
    return redacted;
}
