import { useState } from "react";
import { Field } from "./Field";
import { Log } from "./Log";
import { StatusPane } from "./StatusPane";
import { appendLog, type LogLine } from "./log";

function App() {
  const [logContents, setLogContents] = useState<LogLine[]>([]);

  return (
    <>
      <StatusPane />
      <Field
        log={
          // The setter needs to be a function so it handles multiple log
          // messages in one render properly.
          (message: string) =>
            setLogContents((logContents) => appendLog(message, logContents))
        }
        clearLog={() => setLogContents([])}
      />
      <Log logContents={logContents} />
    </>
  );
}

export default App;
