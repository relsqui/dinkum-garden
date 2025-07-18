import type { LogLine } from "../lib/log";

export function Log({ logContents }: { logContents: LogLine[] }) {
  return (
    <div className="log sidebar">
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
