import React, { useState } from "react";
import { cardToUnicodeCode } from "./helpers";

export function fixedFromCharCode(codePt) {
  if (codePt > 0xffff) {
    codePt -= 0x10000;
    return String.fromCharCode(
      0xd800 + (codePt >> 10),
      0xdc00 + (codePt & 0x3ff)
    );
  } else {
    return String.fromCharCode(codePt);
  }
}

function valueToRank(value) {
  if (value >= 100) return "";
  switch (value) {
    case 15:
      return "2";
    case 14:
      return "A";
    case 13:
      return "K";
    case 12:
      return "Q";
    case 11:
      return "J";
    default:
      return value.toString();
  }
}

function suitToIconAndColor(suit) {
  switch (suit) {
    case "spades":
      return ["♠", "#475569"];
    case "hearts":
      return ["♥", "#f87171"];
    case "diamonds":
      return ["♦", "#0ea5e9"];
    case "clubs":
      return ["♣", "#10b981"];
    default:
      return ["", "#1e293b"];
  }
}

export function Card(props) {
  const { card, onPlace } = props;

  const [isSelected, setSelected] = useState(false);

  const rank = valueToRank(card.Value);
  const [icon, color] = suitToIconAndColor(card.Suit);

  return (
    <div
      className="rounded-xl shadow-lg relative inline-block cursor-pointer bg-white card-animation"
      style={{
        width: 120,
        height: 180,
        marginBottom: 20,
        ...(isSelected && { transform: "translateY(-10px)" }),
      }}
      onClick={() => {
        onPlace();
        setSelected(!isSelected);
      }}
    >
      <div
        className="absolute flex flex-col items-center"
        style={{ top: 10, left: 12, color }}
      >
        <div className="font-bold text-2xl">{rank}</div>
        <div>{icon}</div>
      </div>
      {card.Suit === "joker" && (
        <div className="absolute-centered">
          <div
            style={{
              backgroundImage: `url(${require("./static/joker.png")})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: 100,
              width: 100,
              filter: card.Value === 0 ? "grayscale(100%)" : "none",
            }}
          />
        </div>
      )}
    </div>
    // <div
    //     style={style}
    //     onClick={() => {onPlace(); changeCardStyle();}}
    // >
    //     {fixedFromCharCode(cardToUnicodeCode(card))}
    // </div>
  );
}

export function Cards(props) {
  const { playerCards, onPlace } = props;

  const renderedCards = playerCards.map((c, i) => (
    <Card key={JSON.stringify(c)} card={c} onPlace={() => onPlace(c)} />
  ));

  return (
    <div
      className="rounded-3xl w-full my-10"
      style={{
        background: "#D6484D",
        paddingTop: 50,
        paddingLeft: 50,
        paddingRight: 110,
        paddingBottom: 30,
      }}
    >
      {renderedCards}
    </div>
  );
}
