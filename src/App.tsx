import { useState } from "react";
import { Field, emptyField } from "./Field";
import { Log, type LogLine } from "./Log";

function App() {
  const [field, setField] = useState(emptyField);
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  function appendLog(message: string) {
    setLogContents((prevLogContents) => {
      if (prevLogContents.length == 0) {
        return [{ message, count: 1 }];
      } else {
        const lastLog = prevLogContents.slice(-1)[0];
        if (message == lastLog.message) {
          lastLog.count++;
          return [...prevLogContents.slice(0, -1), lastLog];
        } else {
          return [...prevLogContents, { message, count: 1 }];
        }
      }
    });
  }

  function clearLog() {
    setLogContents([{ message: "Cleared.", count: 1 }]);
  }

  return (
    <>
      <Field field={field} setField={setField} appendLog={appendLog} clearLog={clearLog} />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
