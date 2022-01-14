import React, { useState } from "react";

export function Card(props) {
    const { card, onPlace } = props;
    const cardStyle = {
        border: "1px solid black",
        width: "26px",
        height: "22px",
        display: "inline-block",
        textAlign: "center",
    };

    const cardStyleSelected = {
        border: "1px solid black",
        width: "26px",
        height: "22px",
        display: "inline-block",
        textAlign: "center",
        backgroundColor: "yellow",
    };

    let [style, setStyle] = useState(cardStyle);
    const changeCardStyle = () => {
        console.log(`change card style!`);
        setStyle(cardStyleSelected);
    };
    return (
        <div
            style={style}
            onClick={ () => {onPlace(); changeCardStyle();} }
        >
            {card} 
        </div>
    );
}

export function Cards(props) {
    const { playerCards, onPlace } = props;

    const renderedCards = playerCards.map((c, i) => (
        <Card key={c} card={c} onPlace={() => onPlace(c)}/>
    )); 
    return (
        <div>
            <div>{renderedCards}</div>
        </div>
    );
}
