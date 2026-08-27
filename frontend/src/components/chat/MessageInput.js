"use client";

import { useRef, useState } from "react";
import { Send, Paperclip, X } from "lucide-react";

export default function MessageInput({
    onSend,
    onUpload,
    disabled = false,
    uploading = false,
}) {
    const [content, setContent] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const fileInputRef = useRef(null);

    function handleSubmit(event) {
        event.preventDefault();

        if (disabled || uploading) {
            return;
        }

        // If a file is selected, send the file
        if (selectedFile) {
            onUpload(selectedFile, content.trim());

            setSelectedFile(null);
            setContent("");

            return;
        }

        // Otherwise send text
        const trimmed = content.trim();

        if (!trimmed) {
            return;
        }

        onSend(trimmed);
        setContent("");
    }

    function handleFileSelect(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (disabled || uploading) {
            return;
        }

        setSelectedFile(file);

        // Allows selecting the same file again
        event.target.value = "";
    }

    function openFilePicker() {
        if (disabled || uploading) {
            return;
        }

        fileInputRef.current?.click();
    }

    function removeSelectedFile() {
        setSelectedFile(null);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex items-center gap-3 border-t border-neutral-800/80 bg-neutral-900/60 p-4 backdrop-blur-xl"
        >

            {/* File preview */}
            {selectedFile && (
                <div className="absolute bottom-full left-0 right-0 border-t border-neutral-800 bg-neutral-900 p-3">

                    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2">

                        <div className="flex min-w-0 items-center gap-3">

                            <Paperclip
                                size={16}
                                className="shrink-0 text-neutral-400"
                            />

                            <div className="min-w-0">
                                <p className="truncate text-sm text-white">
                                    {selectedFile.name}
                                </p>

                                <p className="text-xs text-neutral-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                        >
                            <X size={15} />
                        </button>

                    </div>

                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || uploading}
            />

            {/* Attachment */}
            <button
                type="button"
                onClick={openFilePicker}
                disabled={disabled || uploading}
                title="Attach file"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950/60 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Paperclip size={18} />
            </button>

            {/* Message input */}
            <div className="relative flex-1">

                <input
                    type="text"
                    value={content}
                    onChange={(event) =>
                        setContent(event.target.value)
                    }
                    placeholder={
                        disabled
                            ? "Select a chat to start messaging..."
                            : uploading
                                ? "Uploading file..."
                                : selectedFile
                                    ? "Add a message (optional)..."
                                    : "Type a message..."
                    }
                    disabled={disabled || uploading}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/50 disabled:cursor-not-allowed disabled:opacity-50"
                />

            </div>

            {/* Send */}
            <button
                type="submit"
                disabled={
                    disabled ||
                    uploading ||
                    (!content.trim() && !selectedFile)
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
                <span>
                    {uploading
                        ? "Uploading..."
                        : "Send"}
                </span>

                <Send
                    size={16}
                    className="text-neutral-950"
                />
            </button>

        </form>
    );
}