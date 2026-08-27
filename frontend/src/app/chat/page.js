"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";
import useWebSocket from "@/hooks/useWebSocket";

import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import NotificationPopup from "@/components/notification/NotificationPopUp";

import {
    getChats,
    getMessages,
    uploadChatMedia
} from "@/services/chat";

export default function ChatPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [uploading, setUploading] = useState(false)
    const [notification, setNotification] = useState(null)

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (!loading && user) {
            loadChats();
        }
    }, [loading, user]);

    async function loadChats() {
        try {
            const data = await getChats();
            setChats(data);
        } catch (error) {
            console.error("Failed to load chats:", error);
        }
    }

    async function selectChat(chat) {
        if (!chat || !chat.id) {
            console.error("Invalid chat object:", chat);
            return;
        }

        setSelectedChat(chat);
        setLoadingMessages(true);

        try {
            const data = await getMessages(chat.id);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages:", error);
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }

    function handleChatCreated(chat) {
        setChats((previous) => {
            const exists = previous.some(
                (item) => item.id === chat.id
            );

            if (exists) {
                return previous;
            }

            return [chat, ...previous];
        });

        selectChat(chat);
    }

    const handleIncomingMessage = useCallback((message) => {
    if (message.chat_id !== selectedChat?.id) {
        return; // belt-and-suspenders: ignore anything not for the open chat
    }
    setMessages((previous) => {
        const exists = previous.some((item) => item.id === message.id);
        if (exists) return previous;
        return [...previous, message];
    });
}, [selectedChat?.id]);

const handleNotification = useCallback((message) => {
    // Don't notify yourself
    if (user && message.sender_id === user.id) {
        return;
    }

    // Don't show notification if this chat is currently open
    if (message.chat_id === selectedChat?.id) {
        return;
    }

    // Show notification for messages
    // coming from another chat.
    setNotification(message);

}, [user, selectedChat?.id]);

    const {
    connected,
    sendMessage,
} = useWebSocket(
    selectedChat?.id,
    handleIncomingMessage,
    handleNotification   // <-- was missing
);

    function handleSendMessage(content) {
        if (!selectedChat) {
            return;
        }

        if (!connected) {
            console.log("WebSocket is not connected");
            return;
        }

        const sent = sendMessage(content);

        if (!sent) {
            console.log("Failed to send message");
        }
    }

    if (loading) {
        return (
            <main className="flex h-screen items-center justify-center">
                <p className="text-gray-500">
                    Loading...
                </p>
            </main>
        );
    }

    // User is not authenticated.
    // Redirect is already happening above.
    if (!user) {
        return null;
    }

    async function handleUpload(file, caption) {
    if (!selectedChat) {
        return;
    }

    setUploading(true);

    try {
        const message = await uploadChatMedia(
            selectedChat.id,
            file
        );

        console.log("Media uploaded:", message);

        setMessages((previous) => {
            const exists = previous.some(
                (item) => item.id === message.id
            );

            if (exists) {
                return previous;
            }

            return [...previous, message];
        });

    } catch (error) {
        console.error(
            "Failed to upload media:",
            error.response?.data?.detail ||
            error.message ||
            error
        );
    } finally {
        setUploading(false);
    }
}

function handleNotificationClick(clickedNotification) {
    const chat = chats.find(
        (item) => item.id === clickedNotification.chat_id
    );

    if (chat) {
        selectChat(chat);
    } else {
        getChats().then((data) => {
            setChats(data);
            const found = data.find(
                (item) => item.id === clickedNotification.chat_id
            );
            if (found) {
                selectChat(found);
            }
        });
    }

    setNotification(null);
}

    return (
        <main className="flex h-screen">

            <NotificationPopup 
                notification={notification}
                onClose={() => setNotification(null)}
                onNotificationClick={handleNotificationClick}
            />
            <ChatSidebar
                chats={chats}
                selectedChatId={selectedChat?.id}
                onSelectChat={selectChat}
                onChatCreated={handleChatCreated}
            />

            <section className="flex flex-1 flex-col">
                <ChatHeader
                    chat={selectedChat}
                    connected={connected}
                />

                <MessageList
                    messages={messages}
                    loading={loadingMessages}
                />

                <MessageInput
                    onSend={handleSendMessage}
                    onUpload={handleUpload}
                    uploading={uploading}
                    disabled={!selectedChat || !connected}
                />
            </section>
        </main>
    );
}