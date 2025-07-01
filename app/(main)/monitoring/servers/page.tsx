'use client';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getServers } from "@/lib/api_server";
import { getMonitoring } from "@/lib/api_monitoring";

export default function ServerPage() {
    const [servers, setServers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedServerId, setSelectedServerId] = useState<number | null>(null);
    const [routerStatus, setRouterStatus] = useState<any[] | null>(null);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);

    const loadServers = async () => {
        setLoading(true);
        try {
            const data = await getServers();
            setServers(data);
        } catch (error) {
            Swal.fire("Error", "Gagal memuat daftar server", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServers();
    }, []);

    const handleServerChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serverId = Number(e.target.value);

        // Reset data saat ganti server
        setRouterStatus(null);
        setSelectedServerId(serverId);

        if (!serverId) return;

        setLoadingMonitoring(true);
        try {
            const data = await getMonitoring(serverId);
            setRouterStatus(data.routerStatus || []);
        } catch (error) {
            Swal.fire("Error", "Gagal memuat data router", "error");
            setRouterStatus([]);
        } finally {
            setLoadingMonitoring(false);
        }
    };

    const renderRouterList = () => {
        if (!selectedServerId) {
            return <div className="text-center py-12 text-gray-500">Silakan pilih server</div>;
        }

        if (routerStatus === null) {
            return (
                <div className="text-center py-4">
                    {/* <p className="text-gray-600">Memuat data router...</p> */}
                </div>
            );
        }

        if (routerStatus.length === 0) {
            return <div className="text-center py-12 text-gray-500">Tidak ada data router</div>;
        }

        return (
            <div className="space-y-2">
                <div className="font-semibold">IP: {servers.find(s => s.id === selectedServerId)?.ip}</div>
                {routerStatus.map((router, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${router.status === "green" ? "bg-green-500" : "bg-red-500"
                            }`}></div>
                        <div>
                            <p className="font-medium">{router.name}</p>
                            <p className="text-sm text-gray-600">IP: {router.ip}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Monitoring</h1>

                {loading ? (
                    <div className="text-center p-12">
                        <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                        <p className="mt-2 text-xl text-gray-600">Memuat daftar server...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-md">
                            <select
                                value={selectedServerId || ""}
                                onChange={handleServerChange}
                                className="w-full border border-gray-300 p-3 rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-400 text-gray-700"
                            >
                                <option value="">-- Pilih Server --</option>
                                {servers.map((server) => (
                                    <option key={server.id} value={server.id}>
                                        {server.lokasi} ({server.ip})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 bg-white rounded-lg shadow-md p-4 min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {selectedServerId ? servers.find(s => s.id === selectedServerId)?.lokasi : 'Monitoring'}
                                </h2>
                            </div>

                            {renderRouterList()}

                            {loadingMonitoring && (
                                <div className="text-center py-4">
                                    <p className="text-gray-600">Memuat data router...</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}