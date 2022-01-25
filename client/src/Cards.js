import React, { useState } from "react";
import {
    cardToUnicodeCode
} from "./helpers";

export function fixedFromCharCode(codePt) {
    if (codePt > 0xFFFF) {
        codePt -= 0x10000;
        return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
    }
    else {
        return String.fromCharCode(codePt);
    }
}

export function Card(props) {
    const { card, onPlace } = props;

    const cardStyle = {
        leftMargin: "-10px",
        fontSize: "80px",
        display: "inline-block",
    };

    const cardStyleSelected = {
        leftMargin: "-10px",
        fontSize: "80px",
        display: "inline-block",
        backgroundColor: "yellow",
    };

    let [style, setStyle] = useState(cardStyle);
    const changeCardStyle = () => {
        if (style.backgroundColor === "yellow") {
            setStyle(cardStyle);
        } else {
            setStyle(cardStyleSelected);
        }
    };

    // special 4-deck coloring
    if (card.Suit === "joker" && card.Value === 101) {
        style.color = "#EE0000";
    };
    if (card.Suit === "spades") {
        style.color = "black";
    };
    if (card.Suit === "hearts") {
        style.color = "#EE0000";
    };
    if (card.Suit === "diamonds") {
        style.color = "#0000EE";
    };
    if (card.Suit === "clubs") {
        style.color = "#00AA00";
    };

    return (
        <div
            style={style}
            onClick={() => {onPlace(); changeCardStyle();}}
        >
            {fixedFromCharCode(cardToUnicodeCode(card))}
        </div>
    );
}

export function Cards(props) {
    const { playerCards, onPlace } = props;

    const renderedCards = playerCards.map((c, i) => (
        <Card key={JSON.stringify(c)} card={c} onPlace={() => onPlace(c)}/>
    )); 
    
    const cardsStyle = {
        paddingTop: "12px",
        display: "inline-block",
    };
    return (
        <div>
            <div style={cardsStyle}>{renderedCards}</div>
        </div>
    );
}
