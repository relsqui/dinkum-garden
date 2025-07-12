export interface LogLine {
  message: string;
  count: number;
}

export function Log({ logContents }: { logContents: LogLine[] }) {
  return (
    <div className="log">
      <div>
        {logContents.map((logLine, i) => (
          <div className="logLine" key={i}>
            {logLine.message}
            {logLine.count > 1 ? ` (x${String(logLine.count)})` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
