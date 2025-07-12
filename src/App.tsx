import { useState } from "react";
import { Field } from "./Field";
import { Log, type LogLine } from "./Log";

function App() {
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  function appendLog(message: string) {
    setLogContents((prevLogContents) => {
      if (prevLogContents.length == 0) {
        return [{ message, count: 1 }];
      } else {
        // Even though we're slicing, we still need to make a copy to avoid our
        // slice containing a reference to the original count value.
        const lastLog = { ...prevLogContents.slice(-1)[0] };
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

  const fieldProps = {
    appendLog,
    clearLog,
  };

  return (
    <>
      <Field {...fieldProps} />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
