"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Monitor, FileText, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export default function BottomNavbar() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const menu = [
        { name: "Home", icon: LayoutDashboard, path: "/pembayaran/belum-lunas" },
        { name: "Monitoring", icon: Monitor, path: "/monitoring/servers" },
        { name: "Data Tagihan", icon: FileText, path: "/pembayaran/penghasilan" },
        { name: "Pembayaran", icon: DollarSign, path: "/transaksi/bayar-tagihan" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 10) {
                // Scrolling down
                setVisible(false);
            } else {
                // Scrolling up
                setVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-6 py-3 flex justify-around md:hidden z-50 backdrop-blur-sm transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
            {menu.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={`group flex flex-col items-center justify-center text-xs transition-all duration-300 ${isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"}`}
                    >
                        <div className={`rounded-full p-2 transition-transform duration-300 ${isActive ? "bg-blue-100 scale-110" : "bg-transparent group-hover:bg-blue-50"}`}>
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                        </div>
                        <span className={`mt-1 transition-all duration-300 ${isActive ? "font-semibold" : "font-normal"}`}>
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}