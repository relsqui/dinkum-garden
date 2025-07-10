import { useState } from 'react'
import './App.css'

function ctoi(x, y) {
  return x * 5 + y;
}

const center = ctoi(2, 2)

function emptyGrid() {
  const grid = [];
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

function Plot({onClick, plot}) {
  return <div className="plot" onClick={(e) => onClick(e, plot)}>{plot.icon} </div>
}

function App() {
  const [grid, setGrid] = useState(emptyGrid)

  function handleClick(e, plot) {
    e.stopPropagation()
    if (plot.i == center) {
      return
    }
    const newPlot = {...plot}
    if (plot.icon) {
      newPlot.icon = undefined
    } else {
      newPlot.icon = "🌱"
    }
    const newGrid = [...grid]
    newGrid[plot.i] = newPlot
    setGrid(newGrid)
  }

  return (
    <>
      <div className="field">
        {grid?.map((plot) => <Plot onClick={handleClick} plot={plot} key={plot.i} />)}
      </div>
    </>
  )
}

export default App
