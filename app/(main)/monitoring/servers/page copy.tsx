'use client';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getServers, createServer, updateServer } from "@/lib/api_server";
import { getMonitoring } from "@/lib/api_monitoring";  // Import the monitoring API function

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
    const [routerStatus, setRouterStatus] = useState<any[]>([]); // To store router status data
    const [loadingMonitoring, setLoadingMonitoring] = useState(false); // Loading state for monitoring


    const load = async () => {
        setLoading(true);
        const data = await getServers();
        setServers(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleServerClick = async (serverId: number) => {
        setSelectedServerId(serverId); // Set the selected server id
        setRouterStatus([]); // Clear previous router data
        setLoadingMonitoring(true); // Set loading state before fetching
        try {
            const data = await getMonitoring(serverId);
            setRouterStatus(data.routerStatus);  // Set the router status data for the selected server
        } catch (error) {
            Swal.fire("Error", "Failed to fetch monitoring data", "error");
        } finally {
            setLoadingMonitoring(false); // Reset loading state after fetch
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

    const handleSubmit = async () => {
        try {
            if (editId) {
                await updateServer(editId, form);
            } else {
                await createServer(form);
            }
            resetForm();
            setShowFormModal(false);
            load();
            Swal.fire("Success", `Data successfully ${editId ? "updated" : "added"}.`, "success");
        } catch (error: any) {
            const errData = await error.json?.();
            const message = errData?.message || JSON.stringify(errData?.errors || error);
            Swal.fire("Error", message, "error");
        }
    };

    const filteredServers = servers.filter((s: any) =>
        s.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        s.ip.includes(search)
    );

    const totalPages = Math.ceil(filteredServers.length / itemsPerPage);
    // const paginatedServers = filteredServers.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // );

    //tanpa pagination

    const paginatedServers = filteredServers;


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
                            {/* <div className="text-xs text-gray-500">
                                Parent: {node.parent === node.ip ? "Root" : node.parent}
                            </div> */}
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

                {/* Server Grid Section */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {paginatedServers.map((s: any) => (
                        <div
                            key={s.id}
                            onClick={() => handleServerClick(s.id)} // Click to fetch monitoring data
                            className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-lg shadow-md p-2 flex flex-col justify-between items-stretch transition-all ease-in-out transform hover:scale-105 hover:shadow-lg duration-300 cursor-pointer"
                        >
                            <div className="flex justify-between items-center space-x-2">
                                <p className="text-xs sm:text-sm font-semibold flex-1"><span className="font-bold">{s.lokasi}</span></p>
                                <span
                                    className="bg-gray-400 text-white text-xs sm:text-sm font-medium py-1 px-2 rounded shadow-md hover:bg-gray-500"
                                >
                                    Lihat
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Display Router Monitoring Data */}
                <div className="mt-6">
                    <span className="text-xl font-bold text-gray-800 mb-4">Server : {selectedServerId} - {paginatedServers.find(s => s.id === selectedServerId)?.lokasi}</span>
                    <div className="space-y-4 overflow-auto max-h-[500px] p-4 bg-white rounded-lg shadow-md">
                        {loadingMonitoring ? (
                            <div className="text-center p-6">
                                <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                                <p className="mt-2 text-xl text-gray-600">Memuat data monitoring...</p>
                            </div>
                        ) : (
                            renderRouterTree(routerStatus)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
