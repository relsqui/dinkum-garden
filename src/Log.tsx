export function Log({ logContents }: { logContents: string[] }) {
    return <div className="log">
        <div>
            {logContents.map(logLine => (
                <div className="logLine">
                    {logLine}
                </div>
            )
            )}
        </div>
    </div>
}