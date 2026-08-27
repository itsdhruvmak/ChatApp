"use client";

import {
    useContext,
    createContext,
    useEffect,
    useState
} from "react";

import { getCurrentUser } from "@/services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setLoading(false);
            return;
        }

        getCurrentUser()
            .then((userData) => {
                setUser(userData);
            })
            .catch(() => {
                localStorage.removeItem("access_token");
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (token) => {
        localStorage.setItem("access_token", token);

        try {
            const userData = await getCurrentUser();
            setUser(userData);

            return userData;
        } catch (error) {
            localStorage.removeItem("access_token");
            setUser(null);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    return useContext(AuthContext);
}