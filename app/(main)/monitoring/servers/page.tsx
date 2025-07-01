'use client';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getServers, createServer, updateServer } from "@/lib/api_server";
import { getMonitoring } from "@/lib/api_monitoring";

export default function ServerPage() {
    const [servers, setServers] = useState<any[]>([]);
    const [form, setForm] = useState({
        ip: "",
        user: "",
        password: "",
        lokasi: "",
        no_int: "",
        mikrotik: "",
        remark1: "",
        remark2: "",
        remark3: "",
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(true);
    const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
    const [routerStatus, setRouterStatus] = useState<any[]>([]);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);
    const [showMonitoringData, setShowMonitoringData] = useState(false); // Tambahkan state baru

    const load = async () => {
        setLoading(true);
        const data = await getServers();
        setServers(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleServerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serverId = Number(e.target.value);
        setSelectedServerId(serverId);
        setRouterStatus([]); // Bersihkan data router sebelum memuat yang baru
        setShowMonitoringData(false); // Sembunyikan data monitoring saat memulai loading

        if (!serverId) return;

        setLoadingMonitoring(true);

        try {
            const data = await getMonitoring(serverId);
            setRouterStatus(data.routerStatus || []);
            setShowMonitoringData(true); // Tampilkan data monitoring setelah berhasil dimuat
        } catch (error) {
            Swal.fire("Error", "Failed to fetch monitoring data", "error");
            setRouterStatus([]);
        } finally {
            setLoadingMonitoring(false);
        }
    };

    const resetForm = () => {
        setForm({
            ip: "",
            user: "",
            password: "",
            lokasi: "",
            no_int: "",
            mikrotik: "",
            remark1: "",
            remark2: "",
            remark3: "",
        });
        setEditId(null);
    };

    const filteredServers = servers.filter((s: any) =>
        s.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        s.ip.includes(search)
    );

    // Function to build a tree structure from flat router data
    const buildRouterTree = (routers: any[]) => {
        const routerMap: Record<string, any> = {};
        const tree: any[] = [];

        // First pass: create a map of all routers
        routers.forEach(router => {
            routerMap[router.ip] = { ...router, children: [] };
        });

        // Second pass: build the tree structure
        routers.forEach(router => {
            const node = routerMap[router.ip];
            if (router.parent !== router.ip) { // Skip if parent is self (root)
                const parent = routerMap[router.parent];
                if (parent) {
                    parent.children.push(node);
                } else {
                    // If parent not found, treat as root node
                    tree.push(node);
                }
            } else {
                // This is the root node
                tree.push(node);
            }
        });

        return tree;
    };

    // Function to recursively display routers in a tree structure
    const renderRouterTree = (routers: any[], depth: number = 0) => {
        if (routers.length === 0) {
            return <p className="text-gray-500">No routers to display</p>;
        }

        // First build the tree structure
        const routerTree = buildRouterTree(routers);

        const renderNode = (node: any, level: number = 0) => {
            const hasChildren = node.children && node.children.length > 0;

            return (
                <div key={node.ip} className="relative pl-6" style={{ marginLeft: `${level * 20}px` }}>
                    {/* Vertical line */}
                    {level > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                    )}

                    {/* Node content */}
                    <div className={`flex items-start mb-2 ${level > 0 ? 'mt-2' : ''}`}>
                        {/* Horizontal line */}
                        {level > 0 && (
                            <div className="absolute left-0 top-4 w-4 h-px bg-gray-300"></div>
                        )}

                        {/* Status indicator */}
                        <div className={`w-3 h-3 rounded-full mt-1 mr-2 flex-shrink-0 ${node.status === "green" ? "bg-green-500" : "bg-red-500"
                            }`}></div>

                        {/* Router info */}
                        <div className={`p-2 rounded-lg ${node.status === "green" ? "bg-green-50" : "bg-red-50"
                            }`}>
                            <div className="font-semibold">{node.name || 'Unnamed Router'}</div>
                            <div className="text-sm text-gray-600">IP: {node.ip}</div>
                        </div>
                    </div>

                    {/* Children */}
                    {hasChildren && (
                        <div className="children-container">
                            {node.children.map((child: any) => renderNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="router-tree-container border-l-2 border-gray-200 pl-4">
                {routerTree.map(root => renderNode(root))}
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Monitoring Server</h1>

                {loading && (
                    <div className="text-center p-12">
                        <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                        <p className="mt-2 text-xl text-gray-600">Memuat data...</p>
                    </div>
                )}

                {/* Server Dropdown Select */}
                <div className="w-full max-w-md">
                    <select
                        value={selectedServerId || ""}
                        onChange={handleServerChange}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-400 text-gray-700"
                    >
                        <option value="">-- Pilih Server --</option>
                        {filteredServers.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.lokasi} ({s.ip})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Display Router Monitoring Data */}
                {selectedServerId && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                Server: {servers.find(s => s.id === selectedServerId)?.lokasi}
                            </h2>
                            <span className="text-sm text-gray-500">
                                IP: {servers.find(s => s.id === selectedServerId)?.ip}
                            </span>
                        </div>

                        {loadingMonitoring ? (
                            <div className="text-center p-6 bg-white rounded-lg shadow-md mx-2">
                                <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                                <p className="mt-2 text-xl text-gray-600">Memuat data monitoring...</p>
                            </div>
                        ) : showMonitoringData && (
                            <div className="w-full overflow-hidden">
                                <div className="max-w-full overflow-x-auto">
                                    <div className="min-w-max md:min-w-0 p-4 bg-white rounded-lg shadow-md mx-2">
                                        {routerStatus.length > 0 ? (
                                            <div className="w-full max-w-full">
                                                {renderRouterTree(routerStatus)}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">Tidak ada data router yang tersedia</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}