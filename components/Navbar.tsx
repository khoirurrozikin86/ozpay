"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { logout, getUser } from "@/lib/auth"; // pastikan ini benar

interface NavbarProps {
    onHamburgerClick?: () => void;
}

export default function Navbar({ onHamburgerClick }: NavbarProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ambil nama user dari cookie
    const user = getUser();
    const initial = user.name.charAt(0).toUpperCase();

    return (
        <header className="w-full h-16 bg-white flex items-center justify-between px-4 lg:px-6 shadow">
            <div className="flex items-center gap-4">
                <button className="lg:hidden" onClick={onHamburgerClick}>
                    <Menu size={24} />
                </button>

            </div>

            <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                <Bell size={20} />
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold transition hover:brightness-110"
                >
                    {initial}
                </button>

                {/* DROPDOWN */}
                <div
                    className={`absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-200 ease-out origin-top transform ${dropdownOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
                >
                    <div className="py-2 text-sm text-gray-700">
                        <div className="px-4 py-2 font-semibold text-indigo-700">
                            {user.name}
                        </div>
                        <Link
                            href="/profile"
                            className="block px-4 py-2 hover:bg-gray-100 transition"
                            onClick={() => setDropdownOpen(false)}
                        >
                            Manage Profile
                        </Link>
                        <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                            onClick={() => {
                                setDropdownOpen(false);
                                logout(); // 🔥 panggil logout asli
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
