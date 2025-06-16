"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Folder,
    Users,
    Settings,
    ChevronDown,
    ChevronRight,
    Package,
    User,
    CreditCard,
    Box,
    X,
    Server as ServerIcon,
    Wallet,
    CreditCard as CreditCardIcon,
} from "lucide-react";
import { memo, useState, useEffect } from "react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MenuItem {
    name: string;
    icon?: any;
    path?: string;
    children?: MenuItem[];
}

const menu: MenuItem[] = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    {
        name: "Settings", icon: Settings, children: [
            { name: "Paket", icon: Box, path: "/settings/paket" },
            { name: "Server", icon: ServerIcon, path: "/settings/server" },
            { name: "Pelanggan", icon: Users, path: "/settings/pelanggan" },
        ]
    },
    {
        name: "Pembayaran", icon: CreditCard, children: [
            { name: "Buat Tagihan", icon: Package, path: "/pembayaran/tagihan" },
            { name: "Data Tagihan", icon: Folder, path: "/pembayaran/data_tagihan" },
            { name: "Pembayaran Lunas", icon: CreditCardIcon, path: "/pembayaran/lunas" },
            { name: "Belum Lunas", icon: Wallet, path: "/pembayaran/belum-lunas" },
            { name: "Penghasilan", icon: Wallet, path: "/pembayaran/penghasilan" },
        ]
    },
    {
        name: "Transaksi", icon: Wallet, children: [
            { name: "Bayar Tagihan", icon: CreditCardIcon, path: "/transaksi/bayar-tagihan" }
        ]
    }
];


function SidebarComponent({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [openSettings, setOpenSettings] = useState(false);
    const [openPembayaran, setOpenPembayaran] = useState(false);
    const [openTransaksi, setOpenTransaksi] = useState(false);

    useEffect(() => {
        if (pathname.startsWith("/settings")) setOpenSettings(true);
        if (pathname.startsWith("/pembayaran")) setOpenPembayaran(true);
        if (pathname.startsWith("/transaksi")) setOpenTransaksi(true); // ✅ tambahkan ini
    }, [pathname]);

    return (
        <aside className={`fixed lg:static top-0 left-0 z-50 w-64 h-full 
            bg-gradient-to-b from-slate-800 to-slate-900 text-white 
            font-sans tracking-wide transition-transform duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-xl rounded-r-xl`}>

            <div className="flex items-center justify-between p-6">
                <div className="text-2xl font-semibold text-white">OZ Pay</div>
                <button className="lg:hidden text-gray-300 hover:text-white transition" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1 px-2 text-sm">
                {menu.map((item) => {
                    const isDropdown = !!item.children;
                    const isParentSettings = item.name === "Settings";
                    const isParentPembayaran = item.name === "Pembayaran";
                    const isParentTransaksi = item.name === "Transaksi";
                    const isOpenDropdown = isParentSettings
                        ? openSettings
                        : isParentPembayaran
                            ? openPembayaran
                            : isParentTransaksi
                                ? openTransaksi
                                : false;

                    const setOpen = isParentSettings
                        ? setOpenSettings
                        : isParentPembayaran
                            ? setOpenPembayaran
                            : isParentTransaksi
                                ? setOpenTransaksi
                                : () => { };

                    if (isDropdown && item.children) {
                        const isParentActive = item.children?.some((child) => pathname.startsWith(child.path || ""));
                        return (
                            <div key={item.name}>
                                <button
                                    onClick={() => setOpen(!isOpenDropdown)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 transition-all duration-200 
                                    ${isParentActive ? "bg-slate-700 text-blue-400 font-semibold" : "text-slate-200"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon && <item.icon size={20} />}
                                        <span>{item.name}</span>
                                    </div>
                                    {isOpenDropdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {isOpenDropdown && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {item.children.map((child) => {
                                            const isChildActive = pathname === child.path;
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.path!}
                                                    className={`flex items-center gap-2 p-2 rounded-md transition-all 
                                                        hover:bg-slate-700 ${isChildActive ? "bg-slate-700 text-blue-400 font-semibold" : "text-slate-300"}`}
                                                >
                                                    {child.icon && <child.icon size={18} />}
                                                    <span>{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path!}
                            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-all duration-200 
                            ${isActive ? "bg-slate-700 text-blue-400 font-semibold" : "text-slate-200"}`}
                        >
                            {item.icon && <item.icon size={20} />}
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

const Sidebar = memo(SidebarComponent);
export default Sidebar;
