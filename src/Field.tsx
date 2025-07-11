import { useState } from 'react'
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
      appendLog(`Removing plant at ${String(plot.x)},${String(plot.y)}.`)
      newPlot.icon = undefined
    } else {
      appendLog(`Adding plant at ${String(plot.x)},${String(plot.y)}.`)
      newPlot.icon = "🌱"
    }
    setGrid(grid.map((p, i) => i == plot.i ? newPlot : p))
  }

  return (
    <>
      <div className="field">
        {grid.map((plot) => <FieldPlot onClick={handlePlotClick} plot={plot} key={plot.i} />)}
      </div>
    </>
  )
}
