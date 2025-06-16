


import Cookies from "js-cookie";

// LOGIN
export async function login(email: string, password: string): Promise<{
    success: boolean;
    message?: string;
}> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            Cookies.set("token", data.token, { expires: 1 });
            Cookies.set("role", data.user.role);
            Cookies.set("user", data.user.name); // ⬅️ simpan nama user
            return { success: true };
        } else {
            return { success: false, message: data.message || "Login gagal" };
        }
    } catch {
        return { success: false, message: "Koneksi ke server gagal" };
    }
}

// LOGOUT
export async function logout() {
    const token = Cookies.get("token");

    if (token) {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch {
            // Tidak apa-apa kalau gagal, tetap logout di sisi client
        }
    }

    // Hapus cookies
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user");

    window.location.href = "/login";
}

// AMBIL USER (optional helper)
export function getUser() {
    return {
        name: Cookies.get("user") || "User",
        role: Cookies.get("role") || "user",
    };
}

