"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar"; // tambahkan ini

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col bg-gray-100">
                <Navbar onHamburgerClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-auto p-3">{children}</main>
                <BottomNavbar /> {/* tampil hanya di layar kecil */}
            </div>
        </div>
    );
}
