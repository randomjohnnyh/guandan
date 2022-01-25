import React from "react";

export default function Input({children, ...props}) {
  return (
    <input
      {...props}
      className="appearance-none inline-block focus:outline-none"
      style={{ background: "none", ...props.style }}
    />
  )
}