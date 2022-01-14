import React from "react";

export function History(props) {
    const { a } = props;
    let desc = "Player " + a[0] + ": " + (a[1] === 0 ? "pass" : a[1]);
    return (
        <div> {desc} </div>
    );
}

export function HistoryList(props) {
    const { history } = props;
    const renderedHistory = history.map(a => (
        <History a={a}/>
    )); 
    return (
        <div>
            <div>{renderedHistory}</div>
        </div>
    );
}
