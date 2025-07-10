import React, { useState } from 'react'
import './App.css'

interface Plot {
  x: number,
  y: number,
  i: number,
  icon?: string
}

type PlotClickHandler = (e: React.MouseEvent, plot: Plot) => void

function ctoi(x: number, y: number) {
  return x * 5 + y;
}

const center = ctoi(2, 2)

function emptyGrid() {
  const grid: Plot[] = [];
  let i = 0;
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      grid.push({ x, y, i })
      i = i + 1
    }
  }
  grid[center].icon = "💧"
  return grid;
}

function Plot({ onClick, plot }: { onClick: PlotClickHandler, plot: Plot }) {
  return <div className="plot" onClick={(e) => { onClick(e, plot); }}>{plot.icon}</div>
}

function App() {
  const [grid, setGrid] = useState(emptyGrid)

  function handleClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation()
    if (plot.i == center) {
      return
    }
    const newPlot = { ...plot }
    if (plot.icon) {
      newPlot.icon = undefined
    } else {
      newPlot.icon = "🌱"
    }
    setGrid(grid.map((p, i) => i == plot.i ? newPlot : p))
  }

  return (
    <>
      <div className="field">
        {grid.map((plot) => <Plot onClick={handleClick} plot={plot} key={plot.i} />)}
      </div>
    </>
  )
}

export default App
