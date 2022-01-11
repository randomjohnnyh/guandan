import React from "react";

export function History(props) {
    const { card, onPlace } = props;
    const cardStyle = {
        border: "1px solid black",
        width: "30px",
        height: "33px",
        paddingTop: "12px",
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

export function History(props) {
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
