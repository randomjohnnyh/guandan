const NUM_CARDS_IN_SUIT = 13;

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

export function getPlayers(gameState) {
    if (!(gameState && gameState.players)) {
        return [];
    }
    const players = [];
    for (const k in gameState.players) {
        const p = gameState.players[k];
        players[parseInt(k)] = { name : p.displayName };
    }
    return players;
}

export function playerNumberToColor(n) {
    return [
    "lightblue",
    "lightcoral",
    "lightgoldenrodyellow",
    "lightgreen",
    "lightsalmon",
    "lightseagreen",
    "plum",
    "sandybrown",][n - 1];
}

export function cardToUnicodeCode(card) {
    if (card.Suit === "joker") {
        return 127199;
    }
    let start = {"spades": 127137, "hearts": 127153, "diamonds": 127169, "clubs": 127185};
    let code = start[card.Suit] + ((card.Value  - 1) % NUM_CARDS_IN_SUIT)
        + ((card.Value === 12 || card.Value === 13) ? 1 : 0);
    return code;
}

export function cardToSuitAscii(card) {
    switch (card.Suit) {
        case "spades":
            return "♠";
        case "hearts":
            return "♥";
        case "diamonds":
            return "♦";
        case "clubs":
            return "♣";
        case "joker":
            if (card.Value === 0) {
                return "LJ";
            } else if (card.Value === 1) {
                return "HJ";
            }
    }
}

export function cardToValueAscii(card) {
    if (card.Value === 14) {
        return "A";
    } else if (card.Value === 15) {
        return "2";
    } else if (card.Value === 10) {
        return "T";
    } else if (card.Value === 11) {
        return "J";
    } else if (card.Value === 12) {
        return "Q";
    } else if (card.Value === 13) {
        return "K";
    } else {
        return card.Value.toString();
    }
}
