"use client";

import MessageBubble from "./MessageBubble";

export default function MessageList({
    messages,
    loading,
}) {
    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center bg-[#09090b]">
                <div className="flex flex-col items-center gap-3">
                    <svg className="h-6 w-6 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-medium text-neutral-400">
                        Loading messages...
                    </p>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center bg-[#09090b] p-6 text-center">
                <div className="max-w-xs space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900 text-neutral-400 shadow-inner">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round5" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-white">
                        No messages yet
                    </p>
                    <p className="text-xs text-neutral-500">
                        Send a message below to start the conversation.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-[#09090b] p-6">
            <div className="mx-auto max-w-4xl space-y-4">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                    />
                ))}
            </div>
        </div>
    );
}