export default function ChatHeader({
    chat,
    connected,
}) {
    if (!chat) {
        return (
            <header className="flex h-20 items-center border-b border-neutral-800/80 bg-neutral-900/60 px-6 backdrop-blur-xl">
                <p className="text-sm text-neutral-500">
                    Select a chat to start messaging
                </p>
            </header>
        );
    }

    return (
        <header className="flex h-20 items-center justify-between border-b border-neutral-800/80 bg-neutral-900/60 px-6 backdrop-blur-xl">
            {/* Chat Info */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-800/50 font-semibold text-white shadow-inner">
                    {chat.name ? chat.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                    <h2 className="text-base font-semibold tracking-tight text-white">
                        {chat.name || "Chat"}
                    </h2>
                    <p className="text-xs text-neutral-400">Active conversation</p>
                </div>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 px-3.5 py-1.5 shadow-sm">
                <span className="relative flex h-2 w-2">
                    {connected && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`}></span>
                </span>
                <span className={`text-xs font-medium ${connected ? "text-emerald-400" : "text-red-400"}`}>
                    {connected ? "Connected" : "Disconnected"}
                </span>
            </div>
        </header>
    );
}