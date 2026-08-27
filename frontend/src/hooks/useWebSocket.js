"use client";

import { useEffect, useRef, useState } from "react";

export default function useWebSocket(
    chatId,
    onMessage,
    onNotification
) {
    const chatSocketRef = useRef(null);
    const notificationSocketRef = useRef(null);

    const onMessageRef = useRef(onMessage);
    const onNotificationRef = useRef(onNotification);

    const [connected, setConnected] = useState(false);
    const [notificationConnected, setNotificationConnected] =
        useState(false);


    // Keep latest callbacks without reconnecting sockets
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        onNotificationRef.current = onNotification;
    }, [onNotification]);


    // =====================================================
    // NOTIFICATION WEBSOCKET
    // =====================================================

    useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsBaseUrl) {
        console.error("NEXT_PUBLIC_WS_URL is not defined.");
        return;
    }

    let cancelled = false; // tracks a Strict-Mode phantom cleanup
    const socket = new WebSocket(`${wsBaseUrl}/ws/notifications?token=${token}`);
    notificationSocketRef.current = socket;

    socket.onopen = () => {
        if (cancelled) return; // this mount was already torn down
        console.log("Notification WebSocket connected");
        setNotificationConnected(true);
    };

    socket.onmessage = (event) => {
        if (cancelled) return;
        try {
            const message = JSON.parse(event.data);
            onNotificationRef.current?.(message);
        } catch (error) {
            console.error("Failed to parse notification:", error);
        }
    };

    socket.onerror = (error) => {
        if (cancelled) return; // suppress the expected Strict-Mode teardown error
        console.error("Notification WebSocket error:", error);
    };

    socket.onclose = (event) => {
        if (cancelled) return;
        console.log("Notification WebSocket disconnected.", event.code, event.reason);
        setNotificationConnected(false);
    };

    return () => {
        cancelled = true;
        // socket may still be CONNECTING — closing it now is expected and fine,
        // we just don't want to log/react to the resulting event.
        socket.close();
        if (notificationSocketRef.current === socket) {
            notificationSocketRef.current = null;
        }
    };
}, []);


    // =====================================================
    // CHAT WEBSOCKET
    // =====================================================

    useEffect(() => {
        if (!chatId) {
            setConnected(false);
            return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
            return;
        }

        const wsBaseUrl =
            process.env.NEXT_PUBLIC_WS_URL;

        if (!wsBaseUrl) {
            console.error(
                "NEXT_PUBLIC_WS_URL is not defined."
            );
            return;
        }

        const chatUrl =
            `${wsBaseUrl}/ws/chats/${chatId}?token=${token}`;

        console.log(
            "Connecting chat WebSocket:",
            chatUrl
        );

        const socket =
            new WebSocket(chatUrl);

        chatSocketRef.current = socket;

        socket.onopen = () => {
            console.log(
                "Chat WebSocket connected:",
                chatId
            );

            setConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const message =
                    JSON.parse(event.data);

                console.log(
                    "Chat WebSocket message:",
                    message
                );

                if (onMessageRef.current) {
                    onMessageRef.current(message);
                }

            } catch (error) {
                console.error(
                    "Failed to parse chat message:",
                    error
                );
            }
        };

        socket.onerror = (error) => {
            console.error(
                "Chat WebSocket error:",
                error
            );
        };

        socket.onclose = (event) => {
            console.log(
                "Chat WebSocket disconnected:",
                chatId,
                "Code:",
                event.code,
                "Reason:",
                event.reason
            );

            setConnected(false);
        };

        return () => {
            console.log(
                "Cleaning up chat WebSocket:",
                chatId
            );

            socket.close();

            if (
                chatSocketRef.current === socket
            ) {
                chatSocketRef.current = null;
            }

            setConnected(false);
        };

    }, [chatId]);


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    function sendMessage(content) {
        if (!chatSocketRef.current) {
            return false;
        }

        if (
            chatSocketRef.current.readyState !==
            WebSocket.OPEN
        ) {
            return false;
        }

        chatSocketRef.current.send(
            JSON.stringify({
                content,
            })
        );

        return true;
    }


    return {
        connected,
        notificationConnected,
        sendMessage,
    };
}