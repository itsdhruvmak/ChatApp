"use client"

import {useAuthContext} from "@/context/authContext"

export default function useAuth() {
    return useAuthContext();
}