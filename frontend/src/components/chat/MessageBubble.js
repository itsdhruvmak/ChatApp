"use client";

import useAuth from "@/hooks/useAuth";

export default function MessageBubble({ message }) {
    const { user } = useAuth();

    const isOwnMessage =
        user && message.sender_id === user.id;

    function renderMedia() {
        if (!message.media || message.media.length === 0) {
            return null;
        }

        return (
            <div className="mt-2 space-y-2">
                {message.media.map((media) => {

                    // IMAGE
                    if (media.resource_type === "image") {
                        return (
                            <img
                                key={media.id}
                                src={media.secure_url}
                                alt={media.file_name}
                                className="max-w-sm rounded-xl object-contain"
                            />
                        );
                    }

                    // VIDEO
                    if (media.resource_type === "video") {
                        return (
                            <video
                                key={media.id}
                                src={media.secure_url}
                                controls
                                className="max-w-sm rounded-xl"
                            />
                        );
                    }

                    // AUDIO
                    if (media.resource_type === "audio") {
                        return (
                            <audio
                                key={media.id}
                                src={media.secure_url}
                                controls
                                className="max-w-sm"
                            />
                        );
                    }

                    // DOCUMENT / OTHER FILE
                    return (
                        <a
                            key={media.id}
                            href={media.secure_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                isOwnMessage
                                    ? "border-neutral-300 bg-neutral-100 hover:bg-neutral-200"
                                    : "border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                            }`}
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-700 text-xs font-bold text-white">
                                FILE
                            </div>

                            <div className="min-w-0">
                                <p
                                    className={`truncate text-sm font-medium ${
                                        isOwnMessage
                                            ? "text-neutral-900"
                                            : "text-white"
                                    }`}
                                >
                                    {media.file_name}
                                </p>

                                <p
                                    className={`text-xs ${
                                        isOwnMessage
                                            ? "text-neutral-500"
                                            : "text-neutral-400"
                                    }`}
                                >
                                    Open document
                                </p>
                            </div>
                        </a>
                    );
                })}
            </div>
        );
    }

    return (
        <div
            className={`flex w-full animate-in fade-in-50 duration-200 ${
                isOwnMessage
                    ? "justify-end"
                    : "justify-start"
            }`}
        >
            <div
                className={`relative max-w-[75%] px-4 py-3 shadow-lg backdrop-blur-md transition-all ${
                    isOwnMessage
                        ? "rounded-2xl rounded-br-sm bg-white text-neutral-950 shadow-white/5"
                        : "rounded-2xl rounded-bl-sm border border-neutral-800 bg-neutral-900/90 text-neutral-100 shadow-black/40"
                }`}
            >

                {/* Text */}
                {message.content && (
                    <p className="text-sm font-normal leading-relaxed break-words whitespace-pre-wrap">
                        {message.content}
                    </p>
                )}

                {/* Media */}
                {renderMedia()}

                {/* Time */}
                {message.created_at && (
                    <div
                        className={`mt-1 flex items-center justify-end text-[10px] font-medium ${
                            isOwnMessage
                                ? "text-neutral-500"
                                : "text-neutral-400"
                        }`}
                    >
                        <span>
                            {new Date(
                                message.created_at
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}