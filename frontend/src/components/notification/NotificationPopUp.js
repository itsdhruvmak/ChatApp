"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function NotificationPopup({
    notification,
    onClose,
    onNotificationClick,
}) {
    useEffect(() => {
        if (!notification) {
            return;
        }

        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [notification, onClose]);

    if (!notification) {
        return null;
    }

    return (
        <div className="fixed right-5 top-5 z-[9999] w-[360px]">
            <div
                onClick={() => onNotificationClick?.(notification)}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition hover:border-neutral-600"
            >
                {/* Elephant */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <img
                        src="/elephant_notification.png"
                        alt="New message"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-400">
                        New message
                    </p>

                    <p className="truncate text-sm font-medium text-white">
                        {notification.content ||
                            getMediaText(notification)}
                    </p>
                </div>

                {/* Close */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // don't trigger the card's onClick too
                        onClose();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
}

function getMediaText(message) {
    switch (message.message_type) {
        case "image":
            return "📷 Sent an image";
        case "video":
            return "🎥 Sent a video";
        case "audio":
            return "🎵 Sent an audio";
        case "document":
            return "📄 Sent a document";
        default:
            return "You received a new message";
    }
}