import { useState } from 'react'
import { Field } from './Field'
import { Log } from './Log'

function App() {
  const [ logContents, setLogContents ] = useState<string[]>([])

  function appendLog(message: string) {
    setLogContents([...logContents, message])
  }

  return (
    <>
      <Field appendLog={appendLog} />
      <Log logContents={logContents} />
    </>
  )
}

export default App
