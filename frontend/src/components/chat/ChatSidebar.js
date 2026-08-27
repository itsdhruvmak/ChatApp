"use client";

import { useEffect, useState } from "react";
import { Plus, X, Users, UserPlus } from "lucide-react";

import {
    createChat,
    createGroupChat,
} from "@/services/chat";

import { searchUsers } from "@/services/auth";

export default function ChatSidebar({
    chats,
    selectedChatId,
    onSelectChat,
    onChatCreated,
}) {
    const [showNewChat, setShowNewChat] = useState(false);
    const [chatType, setChatType] = useState("private");

    // Username search
    const [username, setUsername] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    // Selected users
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Group
    const [groupName, setGroupName] = useState("");

    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Search users while typing.
     *
     * 300ms debounce prevents an API request
     * on every single keystroke.
     */
    useEffect(() => {
        if (!username.trim()) {
            setSuggestions([]);
            return;
        }

        // Don't search after selecting a private user
        if (chatType === "private" && selectedUser) {
            setSuggestions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setSearchLoading(true);

            try {
                const users = await searchUsers(username);

                /*
                 * For group chat, don't show users
                 * that have already been selected.
                 */
                if (chatType === "group") {
                    const filteredUsers = users.filter(
                        (user) =>
                            !selectedUsers.some(
                                (selected) =>
                                    selected.id === user.id
                            )
                    );

                    setSuggestions(filteredUsers);
                } else {
                    setSuggestions(users);
                }
            } catch (error) {
                console.error(
                    "Failed to search users:",
                    error
                );

                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [
        username,
        chatType,
        selectedUser,
        selectedUsers,
    ]);

    function resetForm() {
        setUsername("");
        setSuggestions([]);

        setSelectedUser(null);
        setSelectedUsers([]);

        setGroupName("");
        setError("");
    }

    function handleClose() {
        setShowNewChat(false);
        setChatType("private");
        resetForm();
    }

    function handleSelectPrivateUser(user) {
        setSelectedUser(user);
        setUsername(user.username);
        setSuggestions([]);
        setError("");
    }

    function handleSelectGroupUser(user) {
        setSelectedUsers((previous) => [
            ...previous,
            user,
        ]);

        setUsername("");
        setSuggestions([]);
        setError("");
    }

    function removeGroupUser(userId) {
        setSelectedUsers((previous) =>
            previous.filter(
                (user) => user.id !== userId
            )
        );
    }

    async function handleCreateChat(event) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            let chat;

            /*
             * PRIVATE CHAT
             */
            if (chatType === "private") {
                if (!selectedUser) {
                    setError(
                        "Please select a user from the suggestions."
                    );

                    setLoading(false);
                    return;
                }

                chat = await createChat(
                    selectedUser.id
                );
            }

            /*
             * GROUP CHAT
             */
            else {
                if (!groupName.trim()) {
                    setError(
                        "Please enter a group name."
                    );

                    setLoading(false);
                    return;
                }

                if (selectedUsers.length === 0) {
                    setError(
                        "Please select at least one user."
                    );

                    setLoading(false);
                    return;
                }

                const userIds = selectedUsers.map(
                    (user) => user.id
                );

                chat = await createGroupChat(
                    groupName.trim(),
                    userIds
                );
            }

            resetForm();
            setShowNewChat(false);
            setChatType("private");

            if (onChatCreated) {
                onChatCreated(chat);
            }
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Failed to create chat."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <aside className="flex h-full w-80 min-h-0 flex-col border-r border-neutral-800/80 bg-neutral-950">

            {/* Header */}
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-neutral-800/80 px-6">

                <h2 className="text-lg font-semibold tracking-tight text-white">
                    Chats
                </h2>

                <button
                    onClick={() => {
                        if (showNewChat) {
                            handleClose();
                        } else {
                            setShowNewChat(true);
                            setError("");
                        }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white active:scale-95"
                    title="New Chat"
                >
                    {showNewChat ? (
                        <X size={18} />
                    ) : (
                        <Plus size={18} />
                    )}
                </button>
            </div>

            {/* New Chat Form */}
            {showNewChat && (
                <div className="relative z-10 shrink-0 border-b border-neutral-800/80 bg-neutral-950 px-4 py-4">

                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-lg shadow-black/10">

                        {/* Chat type selector */}
                        <div className="mb-4 grid grid-cols-2 gap-2">

                            <button
                                type="button"
                                onClick={() => {
                                    setChatType("private");
                                    resetForm();
                                    setError("");
                                }}
                                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                                    chatType === "private"
                                        ? "border-neutral-600 bg-neutral-800 text-white shadow-sm"
                                        : "border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-300"
                                }`}
                            >
                                <UserPlus size={15} />
                                Private
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setChatType("group");
                                    resetForm();
                                    setError("");
                                }}
                                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                                    chatType === "group"
                                        ? "border-neutral-600 bg-neutral-800 text-white shadow-sm"
                                        : "border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700 hover:bg-neutral-900 hover:text-neutral-300"
                                }`}
                            >
                                <Users size={15} />
                                Group
                            </button>

                        </div>

                        <form
                            onSubmit={handleCreateChat}
                            className="space-y-3"
                        >

                            {/* ========================= */}
                            {/* PRIVATE CHAT */}
                            {/* ========================= */}

                            {chatType === "private" && (
                                <>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                                        Start a private chat
                                    </p>

                                    <div className="relative">

                                        <input
                                            type="text"
                                            placeholder="Search username..."
                                            value={username}
                                            onChange={(event) => {
                                                setUsername(
                                                    event.target.value
                                                );

                                                setSelectedUser(
                                                    null
                                                );

                                                setError("");
                                            }}
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 transition-all focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/40"
                                            required
                                        />

                                        {/* Suggestions */}
                                        {suggestions.length > 0 && (
                                            <div className="relative mt-2 max-h-36 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-inner custom-scrollbar">

                                                {suggestions.map(
                                                    (user) => (
                                                        <button
                                                            key={
                                                                user.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectPrivateUser(
                                                                    user
                                                                )
                                                            }
                                                            className="flex w-full items-center border-b border-neutral-800/60 px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-neutral-900"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-white">
                                                                    {
                                                                        user.username
                                                                    }
                                                                </p>

                                                                <p className="text-[11px] text-neutral-500">
                                                                    User #
                                                                    {
                                                                        user.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {searchLoading && (
                                        <p className="text-[11px] text-neutral-500">
                                            Searching...
                                        </p>
                                    )}

                                    {/* Selected private user */}
                                    {selectedUser && (
                                        <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5">

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {
                                                        selectedUser.username
                                                    }
                                                </p>

                                                <p className="text-[11px] text-neutral-500">
                                                    Ready to chat
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUser(
                                                        null
                                                    );
                                                    setUsername(
                                                        ""
                                                    );
                                                }}
                                                className="shrink-0 rounded-lg px-2 py-1 text-[11px] text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
                                            >
                                                Change
                                            </button>

                                        </div>
                                    )}
                                </>
                            )}

                            {/* ========================= */}
                            {/* GROUP CHAT */}
                            {/* ========================= */}

                            {chatType === "group" && (
                                <>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                                        Create a group
                                    </p>

                                    {/* Group name */}
                                    <input
                                        type="text"
                                        placeholder="Group name"
                                        value={groupName}
                                        onChange={(event) =>
                                            setGroupName(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 transition-all focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/40"
                                        required
                                    />

                                    {/* Username search */}
                                    <div className="relative">

                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={username}
                                            onChange={(event) => {
                                                setUsername(
                                                    event.target.value
                                                );
                                                setError("");
                                            }}
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 transition-all focus:border-neutral-600 focus:bg-neutral-950 focus:ring-2 focus:ring-neutral-700/40"
                                        />

                                        {/* Suggestions */}
                                        {suggestions.length > 0 && (
                                            <div className="relative mt-2 max-h-36 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-inner custom-scrollbar">

                                                {suggestions.map(
                                                    (user) => (
                                                        <button
                                                            key={
                                                                user.id
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectGroupUser(
                                                                    user
                                                                )
                                                            }
                                                            className="flex w-full items-center border-b border-neutral-800/60 px-3.5 py-2.5 text-left transition-colors last:border-b-0 hover:bg-neutral-900"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-white">
                                                                    {
                                                                        user.username
                                                                    }
                                                                </p>

                                                                <p className="text-[11px] text-neutral-500">
                                                                    User #
                                                                    {
                                                                        user.id
                                                                    }
                                                                </p>
                                                            </div>
                                                        </button>
                                                    )
                                                )}

                                            </div>
                                        )}

                                    </div>

                                    {/* Selected members */}
                                    {selectedUsers.length > 0 && (
                                        <div className="space-y-2">

                                            <p className="text-[11px] font-medium text-neutral-500">
                                                Selected members
                                            </p>

                                            <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto custom-scrollbar">

                                                {selectedUsers.map(
                                                    (user) => (
                                                        <div
                                                            key={
                                                                user.id
                                                            }
                                                            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5"
                                                        >
                                                            <span className="max-w-[140px] truncate text-xs text-white">
                                                                {
                                                                    user.username
                                                                }
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeGroupUser(
                                                                        user.id
                                                                    )
                                                                }
                                                                className="text-neutral-500 transition hover:text-red-400"
                                                            >
                                                                <X
                                                                    size={
                                                                        13
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    )
                                                )}

                                            </div>

                                        </div>
                                    )}

                                    <p className="text-[11px] leading-relaxed text-neutral-500">
                                        Search and select the people you want
                                        to add to the group.
                                    </p>
                                </>
                            )}

                            {/* Error */}
                            {error && (
                                <p className="rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2 text-xs font-medium text-red-400">
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-neutral-950 shadow-md shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating..."
                                    : chatType === "private"
                                        ? "Start Chat"
                                        : "Create Group"}
                            </button>

                        </form>

                    </div>
                </div>
            )}

            {/* Chat List */}
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">

                {chats.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-center">
                        <p className="text-sm text-neutral-500">
                            No chats yet.
                        </p>
                    </div>
                ) : (
                    chats.map((chat) => {

                        const isSelected =
                            selectedChatId === chat.id;

                        const isGroup =
                            chat.type === "group";

                        return (
                            <button
                                key={chat.id}
                                onClick={() =>
                                    onSelectChat(chat)
                                }
                                className={`group relative w-full rounded-xl p-3.5 text-left transition-all ${
                                    isSelected
                                        ? "border border-neutral-700/60 bg-neutral-800/70 shadow-inner"
                                        : "border border-transparent hover:bg-neutral-900/60"
                                }`}
                            >

                                <div className="mb-1 flex items-center justify-between">

                                    <div className="flex min-w-0 items-center gap-2">

                                        {isGroup ? (
                                            <Users
                                                size={16}
                                                className="shrink-0 text-neutral-400"
                                            />
                                        ) : (
                                            <UserPlus
                                                size={16}
                                                className="shrink-0 text-neutral-500"
                                            />
                                        )}

                                        <p
                                            className={`truncate text-sm ${
                                                isSelected
                                                    ? "font-semibold text-white"
                                                    : "font-medium text-neutral-200 group-hover:text-white"
                                            }`}
                                        >
                                            {chat.type === "private"
                                                ? chat.username ||
                                                  `Chat ${chat.id}`
                                                : chat.name ||
                                                  `Group ${chat.id}`}
                                        </p>

                                    </div>

                                    <span className="ml-2 shrink-0 rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                                        {isGroup
                                            ? "GROUP"
                                            : "PRIVATE"}
                                    </span>

                                </div>

                                <p className="truncate text-xs text-neutral-400">
                                    {isGroup
                                        ? `${chat.member_count} members`
                                        : "Private conversation"}
                                </p>

                            </button>
                        );
                    })
                )}

            </div>
        </aside>
    );
}