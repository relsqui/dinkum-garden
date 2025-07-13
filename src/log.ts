export interface LogLine {
  message: string;
  count: number;
}

export function appendLog(message: string, logContents: LogLine[]) {
  let nextContents;
  if (logContents.length == 0) {
    nextContents = [{ message, count: 1 }];
  } else {
    // Even though we're slicing, we still need to make a copy to avoid our
    // slice containing a reference to the original count value.
    const lastLog = { ...logContents.slice(-1)[0] };
    if (message == lastLog.message) {
      lastLog.count++;
      nextContents = [...logContents.slice(0, -1), lastLog];
    } else {
      nextContents = [...logContents, { message, count: 1 }];
    }
  }
  return nextContents;
}
