import React from "react";

export default function Button({children, color = 'blue', ...props}) {
  // Need to do it like this for now because of tailwind CSS
  if (color === 'green') {
    return (
      <button className="bg-emerald-500 shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/90 transition-all rounded-lg px-4 py-2 text-white cursor-pointer font-bold" {...props}>{children}</button>
    )
  }
  if (color === 'purple') {
    return (
      <button className="bg-violet-500 shadow-lg shadow-violet-500/50 hover:shadow-violet-500/90 transition-all rounded-lg px-4 py-2 text-white cursor-pointer font-bold" {...props}>{children}</button>
    )
  }
  if (color === 'red') {
    return (
      <button className="bg-red-500 shadow-lg shadow-red-500/50 hover:shadow-red-500/90 transition-all rounded-lg px-4 py-2 text-white cursor-pointer font-bold" {...props}>{children}</button>
    )
  }
  return (
    <button className="bg-blue-500 shadow-lg shadow-blue-500/50 hover:shadow-blue-500/90 transition-all rounded-lg px-4 py-2 text-white cursor-pointer font-bold" {...props}>{children}</button>
  )
}