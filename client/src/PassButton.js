import React from "react";

export function PassButton(props) {
    const { onPlace } = props;
    return (
        <div onClick={onPlace(0)}>
            Pass
        </div>
    );
}
