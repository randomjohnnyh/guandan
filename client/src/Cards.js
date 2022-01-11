import React from "react";

export function Card(props) {
    const { card, onPlace } = props;
    const cardStyle = {
        border: "1px solid black",
        width: "26px",
        height: "22px",
        // paddingTop: "12px",
        display: "inline-block",
        textAlign: "center",
    };
    return (
        <div
            style={cardStyle}
            onClick={onPlace}
        >
            {card} 
        </div>
    );
}

export function Cards(props) {
    const { playerCards, onPlace } = props;
    const renderedCards = playerCards.map((c, i) => (
        <Card key={i} card={c} onPlace={() => onPlace(c)}/>
    )); 
    return (
        <div>
            <div>{renderedCards}</div>
        </div>
    );
}
