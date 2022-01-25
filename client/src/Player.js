import React, { useState } from "react";

import { playerNumberToColor } from "./helpers";
import { Input } from './components';

export function PlayerName(props) {
    const { editable, player, number, changeName} = props;
    let [name, setName] = useState(player.name);
    let [timeoutId, setTimeoutId] = useState();
    let [pendingUpdate, setPendingUpdate] = useState(false);
    
    const handleNameChange = (e) => {
        setPendingUpdate(true);
        const name = e.target.value;
        setName(name);
        if (timeoutId) clearTimeout(timeoutId);
        setTimeoutId(
            setTimeout(() => {
                changeName(number, name);
                pendingUpdate = false;
            }, 300)
        );
    };

    const playerColorStyle = {
        color: playerNumberToColor(number),
    };

    const playerNameStyle = {
        backgroundColor: "black",
        color: "white",
        paddingLeft: "2px",
        paddingRight: "2px",
    };

    return editable ? (
        <div className='py-2'>
            <span className='mr-3' style={playerColorStyle}>■</span> 
            <Input
                type="text"   
                value={pendingUpdate ? name : player.name}
                onChange={handleNameChange}
                autofocus="true"
            />
        </div> 
    ) : (
        <div className='py-2'>
            <span style={playerColorStyle}>■</span>{" "}
            <span style={playerNameStyle}>{player.name}</span>
        </div>
    ); 
}
