import { useState } from 'react'
import { Field } from './Field'
import { Log, type LogLine } from './Log'

function App() {
  const [logContents, setLogContents] = useState<LogLine[]>([])

  function appendLog(message: string) {
    if (logContents.length == 0) {
      setLogContents([{ message, count: 1 }])
    } else {
      const lastLog = logContents.slice(-1)[0]
      if (message == lastLog.message) {
        lastLog.count++
        setLogContents([...logContents.slice(0, -1), lastLog])
      } else {
        setLogContents([...logContents, { message, count: 1 }])
      }
    }
  }

  return (
    <>
      <Field appendLog={appendLog} />
      <Log logContents={logContents} />
    </>
  )
}

export default App
