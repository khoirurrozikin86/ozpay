"use client";

import Cookies from 'js-cookie';
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
    role?: 'admin' | 'user';
}

interface MenuItem {
    name: string;
    icon?: any;
    path?: string;
    children?: MenuItem[];
    allowedRoles?: ('admin' | 'user')[];
}






const menuConfig: MenuItem[] = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
        allowedRoles: ['admin', 'user']
    },
    {
        name: "Settings",
        icon: Settings,
        allowedRoles: ['admin'],
        children: [
            { name: "Paket", icon: Box, path: "/settings/paket" },
            { name: "Server", icon: ServerIcon, path: "/settings/server" },
            { name: "Pelanggan", icon: Users, path: "/settings/pelanggan" },
        ]
    },
    {
        name: "Pembayaran",
        icon: CreditCard,
        allowedRoles: ['admin', 'user'],
        children: [
            { name: "Buat Tagihan", icon: Package, path: "/pembayaran/tagihan", allowedRoles: ['admin'] },
            { name: "Data Tagihan", icon: Folder, path: "/pembayaran/data_tagihan", allowedRoles: ['admin'] },
            { name: "Pembayaran Lunas", icon: CreditCardIcon, path: "/pembayaran/lunas", allowedRoles: ['admin'] },
            { name: "Belum Lunas", icon: Wallet, path: "/pembayaran/belum-lunas", allowedRoles: ['admin', 'user'] },
            { name: "Penghasilan", icon: Wallet, path: "/pembayaran/penghasilan", allowedRoles: ['admin', 'user'] },
        ]
    },
    {
        name: "Transaksi",
        icon: Wallet,
        allowedRoles: ['admin', 'user'],
        children: [
            { name: "Bayar Tagihan", icon: CreditCardIcon, path: "/transaksi/bayar-tagihan", allowedRoles: ['admin', 'user'] }
        ]
    },
    {
        name: "Monitoring",
        icon: ServerIcon,
        allowedRoles: ['admin'],
        children: [
            { name: "Servers", icon: ServerIcon, path: "/monitoring/servers" }
        ]
    }
];

function SidebarComponent({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [role, setRole] = useState<'admin' | 'user'>('user');


    useEffect(() => {
        const cookieRole = Cookies.get('role') as 'admin' | 'user' | undefined;

        // console.log('Role dari cookies:', cookieRole);

        if (cookieRole) {
            setRole(cookieRole);
        } else {
            console.warn('Role tidak ditemukan di cookies, menggunakan default "user"');
        }
    }, []);

    // Debug: Log role yang diterima
    console.log('Role saat ini:', role);

    useEffect(() => {
        const newOpenMenus: Record<string, boolean> = {};
        menuConfig.forEach(item => {
            if (item.children) {
                const isActive = item.children.some(child =>
                    pathname.startsWith(child.path || '')
                );
                newOpenMenus[item.name] = isActive;
            }
        });
        setOpenMenus(newOpenMenus);
    }, [pathname]);

    // Filter menu berdasarkan role
    const filteredMenu = menuConfig
        .filter(item => {
            const isAllowed = !item.allowedRoles || item.allowedRoles.includes(role);
            console.log(`Menu ${item.name} diizinkan untuk role ${role}:`, isAllowed);
            return isAllowed;
        })
        .map(item => {
            if (item.children) {
                const filteredChildren = item.children.filter(child => {
                    const isChildAllowed = !child.allowedRoles || child.allowedRoles.includes(role);
                    console.log(`Submenu ${child.name} diizinkan untuk role ${role}:`, isChildAllowed);
                    return isChildAllowed;
                });
                return { ...item, children: filteredChildren };
            }
            return item;
        })
        .filter(item => {
            const hasValidChildren = !item.children || item.children.length > 0;
            console.log(`Menu ${item.name} memiliki children valid:`, hasValidChildren);
            return hasValidChildren;
        });

    // Debug: Log menu yang akan dirender
    console.log('Menu yang akan dirender:', filteredMenu);

    const toggleMenu = (menuName: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    return (
        <aside className={`fixed lg:static top-0 left-0 z-50 w-64 h-full 
            bg-gradient-to-b from-slate-800 to-slate-900 text-white 
            font-sans tracking-wide transition-transform duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-xl rounded-r-xl`}>

            {/* ... (bagian JSX lainnya tetap sama) ... */}
            <div className="flex items-center justify-between p-6">
                <div className="text-2xl font-semibold text-white">OZ Pay</div>
                <button className="lg:hidden text-gray-300 hover:text-white transition" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto max-h-screen space-y-1 px-2 text-sm scroll-smooth 
                scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {filteredMenu.map((item) => {
                    const isDropdown = !!item.children;
                    const isActive = item.children
                        ? item.children.some(child => pathname === child.path)
                        : pathname === item.path;

                    if (isDropdown && item.children) {
                        return (
                            <div key={item.name}>
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 transition-all duration-200 
                                    ${isActive ? "bg-slate-700 text-blue-400 font-semibold" : "text-slate-200"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon && <item.icon size={20} />}
                                        <span>{item.name}</span>
                                    </div>
                                    {openMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {openMenus[item.name] && (
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