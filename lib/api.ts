// lib/api.ts
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = async (endpoint: string, method = "GET", body?: any) => {
    const token = typeof window !== "undefined" ? Cookies.get("token") : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
};
