import React, { useState } from 'react'
import { FieldPlot, type Plot } from './Plot'

function emptyGrid() {
  const grid: Plot[] = [];
  let i = 0;
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      grid.push({ x, y, i })
      i = i + 1
    }
  }
  // Center
  grid[12].icon = "💧"
  return grid;
}

export function Field({ appendLog }: { appendLog: (message: string) => void }) {
  const [grid, setGrid] = useState(emptyGrid)

  function handlePlotClick(e: React.MouseEvent, plot: Plot) {
    e.stopPropagation()
    if (plot.x == plot.y && plot.x == 2) {
      appendLog("Don't plant over the sprinkler.")
      return
    }
    const newPlot = { ...plot }
    if (plot.icon) {
      appendLog(`Removing ${plot.icon} at ${String(plot.x)},${String(plot.y)}.`)
      delete newPlot.icon
    } else {
      newPlot.icon = "🌱"
      appendLog(`Adding ${newPlot.icon} at ${String(plot.x)},${String(plot.y)}.`)
    }
    setGrid(grid.map((p, i) => i == plot.i ? newPlot : p))
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation()
    const newGrid = emptyGrid()
    grid.map((plot, i) => {
      if (plot.icon) {
        newGrid[i].icon = plot.icon
      }
      if (plot.icon == "🌱") {
        [
          plot.x > 0 ? grid[i - 5] : undefined,
          plot.x < 4 ? grid[i + 5] : undefined,
          plot.y > 0 ? grid[i - 1] : undefined,
          plot.y < 4 ? grid[i + 1] : undefined,
        ].map((neighbor) => {
          if (neighbor) {
            console.log(neighbor)
          }
          if (neighbor && typeof neighbor.icon == "undefined") {
            newGrid[neighbor.i].icon = "🎃"
            newGrid[neighbor.i].stem = plot.i
          }
        })
      }
    })
    setGrid(newGrid)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setGrid(emptyGrid())
    appendLog("Cleared the field.")
  }

  return (
    <>
      <div className="fieldContainer">
        <div className="field">
          {grid.map((plot) => <FieldPlot onClick={handlePlotClick} plot={plot} key={plot.i} />)}
        </div>
        <div className="buttonBar">
          <button onClick={handleIterate}>Iterate</button>
          <button onClick={handleClear}>Clear</button>
        </div>
      </div>
    </>
  )
}
