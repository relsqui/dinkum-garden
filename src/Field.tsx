import React, { useState } from 'react'
import { FieldPlot, type Plot } from './Plot'

function emptyGrid() {
  const grid: Plot[] = [];
  let i = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      grid.push({ x, y, i })
      i = i + 1
    }
  }
  grid[12].icon = "💧"
  return grid;
}

export function Field({ appendLog, clearLog }: { appendLog: (message: string) => void, clearLog: () => void }) {
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
      delete newPlot.stem
    } else {
      newPlot.icon = "🌱"
      appendLog(`Adding ${newPlot.icon} at ${String(plot.x)},${String(plot.y)}.`)
    }
    setGrid(grid.map((p, i) => i == plot.i ? newPlot : p))
  }

  function handleIterate(e: React.MouseEvent) {
    e.stopPropagation()
    appendLog("Iterating ...")
    const newGrid = emptyGrid()
    grid.map((plot, i) => {
      if (plot.icon) {
        newGrid[i] = { ...plot }
        if (plot.icon == "🌱") {
          [
            plot.x > 0 ? grid[i - 1] : undefined,
            plot.x < 4 ? grid[i + 1] : undefined,
            plot.y > 0 ? grid[i - 5] : undefined,
            plot.y < 4 ? grid[i + 5] : undefined,
          ].map((neighbor) => {
            if (neighbor && typeof neighbor.icon == "undefined") {
              // TODO: Track child count and then randomize this
              newGrid[neighbor.i].icon = "🎃"
              newGrid[neighbor.i].stem = plot.i
              appendLog(`Growing ${newGrid[neighbor.i].icon} at ${String(neighbor.x)},${String(neighbor.y)}.`)
            }
          })
        }
      }
    })
    setGrid(newGrid)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setGrid(emptyGrid())
    clearLog()
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
