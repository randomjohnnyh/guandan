import React from "react";
import {
    cardToValueAscii,
    cardToSuitAscii,
} from "./helpers.js";

export function History(props) {
    const { a } = props;
    let descCards = "";
    if (a[1].length === 0) {
        descCards = "pass";
    } else {
        for (var c of a[1]) {
            if (c.Suit === "joker") {
                if (c.Value === 100) {
                    descCards += "LJ";
                } else if (c.Value === 101) {
                    descCards += "HJ";
                }
            } else {
                descCards += cardToValueAscii(c);
                descCards += cardToSuitAscii(c);
            }
            descCards += " ";
        }
    }
    let desc = "Player " + a[0] + ": " + descCards;
    return (
        <div> {desc} </div>
    );
}

export function HistoryList(props) {
    const { history } = props;
    const renderedHistory = history.map(a => (
        <History a={a}/>
    )); 
    renderedHistory.reverse();
    return (
        <div className='font-mono'>{renderedHistory}</div>
    );
}
