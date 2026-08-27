import api from "./api";

export async function getChats() {
    const response = await api.get("/chats");

    return response.data;
}

export async function getMessages(chatId) {
    const response = await api.get(`/chats/${chatId}/messages`);

    return response.data;
}

export async function sendMessage(chatId, content) {
    const response = await api.post(`/chats/${chatId}/messages`, {
        content,
    });

    return response.data;
}

export async function createChat(userId) {
    const response = await api.post("/chats", {
        user_id: Number(userId),
    });

    return response.data;
}

export async function createGroupChat(name, userIds) {
    const response = await api.post("/chats/group", {
        name,
        user_ids: userIds,
    });

    return response.data;
}

export async function uploadChatMedia(chatId, file){
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        `/chats/${chatId}/messages/media`,
        formData
    );

    return response.data;
}