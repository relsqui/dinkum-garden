import React from 'react'

export interface Plot {
  x: number,
  y: number,
  i: number,
  icon?: string
}

export type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void

export function FieldPlot({ onClick, plot }: { onClick: PlotClickHandler, plot: Plot }) {
  return <div className="plot" onClick={(e) => { onClick(e, plot); }}>{plot.icon}</div>
}
