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
