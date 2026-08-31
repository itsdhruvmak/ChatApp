import api from "./api";

export async function registerUser(username,email, password){
    const response = await api.post("/auth/register", {
        email,
        password,
        username
    });

    return response.data;
}

export async function verifyOTP(email, otp){
    const response = await api.post("/auth/verify-otp", {
        email,
        otp,
    });
    return response.data
}

export async function loginUser(username, password){
    const response = await api.post("/auth/login", {
        // email,
        username,
        password,
    })

    return response.data
}

export async function getCurrentUser(){
    const response = await api.get("/me")

    return response.data
}

export async function searchUsers(query){
    const response = await api.get("/auth/search", {
        params: {
            q: query
        },
    });

    return response.data;
}