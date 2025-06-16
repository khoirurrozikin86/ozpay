"use client";

import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";

import {
    getServers,
    createServer,
    updateServer,
    deleteServer,
} from "@/lib/api_server";

export default function ServerPage() {
    const [servers, setServers] = useState([]);
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const ipInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true); // Add loading state

    const load = async () => {
        setLoading(true); // Set loading to true when loading starts
        const data = await getServers();
        setServers(data);
        setLoading(false); // Set loading to false once the data is fetched
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (showFormModal) {
            setTimeout(() => {
                ipInputRef.current?.focus();
            }, 100);
        }
    }, [showFormModal]);

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
            Swal.fire("Sukses", `Data berhasil ${editId ? "diperbarui" : "ditambahkan"}.`, "success");
        } catch (error: any) {
            const errData = await error.json?.();
            const message = errData?.message || JSON.stringify(errData?.errors || error);
            Swal.fire("Gagal", message, "error");
        }
    };

    const handleEdit = (server: any) => {
        setForm(server);
        setEditId(server.id);
        setShowFormModal(true);
    };

    const filteredServers = servers.filter((s: any) =>
        s.lokasi.toLowerCase().includes(search.toLowerCase()) ||
        s.ip.includes(search)
    );

    const totalPages = Math.ceil(filteredServers.length / itemsPerPage);
    const paginatedServers = filteredServers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-4">
            <div className="space-y-6">
                {/* Title Section */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Server</h1>

                {/* Button and Search Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <button
                        onClick={() => setShowFormModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm transition-all duration-300 shadow-md w-full sm:w-auto"
                    >
                        Tambah Server
                    </button>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari lokasi atau IP..."
                        className="w-full sm:w-64 px-4 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                </div>

                {/* Server Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && (
                        <div className="text-center p-12">
                            <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                            <p className="mt-2 text-xl text-gray-600">Memuat data...</p>
                        </div>
                    )}

                    {paginatedServers.map((s: any) => (
                        <div
                            key={s.id}
                            className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all ease-in-out transform hover:scale-105 hover:shadow-2xl duration-300"
                        >
                            <div className="space-y-3">
                                <p className="text-sm uppercase font-semibold tracking-wide text-white/90">Server IP</p>
                                <h3 className="text-xl font-bold">{s.ip}</h3>
                                <hr className="border-white/20" />

                                <table className="w-full text-sm text-white border border-white/30 rounded overflow-hidden">
                                    <tbody>
                                        <tr className="border-b border-white/30">
                                            <td className="py-1 px-2 font-semibold w-1/3">Lokasi</td>
                                            <td className="py-1 px-2">{s.lokasi}</td>
                                        </tr>
                                        <tr className="border-b border-white/30">
                                            <td className="py-1 px-2 font-semibold">User</td>
                                            <td className="py-1 px-2">{s.user}</td>
                                        </tr>
                                        <tr className="border-b border-white/30">
                                            <td className="py-1 px-2 font-semibold">Mikrotik</td>
                                            <td className="py-1 px-2">{s.mikrotik || "-"}</td>
                                        </tr>
                                        <tr>
                                            <td className="py-1 px-2 font-semibold">No Int</td>
                                            <td className="py-1 px-2">{s.no_int || "-"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={() => handleEdit(s)}
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-2 text-sm rounded-full shadow-md"
                                >
                                    <i className="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setServerToDelete(s);
                                        setShowDeleteModal(true);
                                    }}
                                    className="bg-red-100 text-red-600 hover:bg-red-200 font-medium px-6 py-2 text-sm rounded-full shadow-md"
                                >
                                    <i className="fas fa-trash mr-1"></i>Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-md ${page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {/* Modal Form */}
                {showFormModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-xl space-y-4 transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn">
                            <h2 className="text-lg font-semibold">{editId ? "Edit Server" : "Tambah Server"}</h2>
                            <div className="space-y-4">
                                {Object.entries(form).map(([field, value]) => (
                                    <div key={field} className="flex flex-col">
                                        <label className="text-sm text-gray-700 capitalize mb-1">{field.replace("_", " ")}</label>
                                        <input
                                            type={["harga", "durasi"].includes(field) ? "number" : "text"}
                                            value={value}
                                            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                            placeholder={field}
                                            className="border p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowFormModal(false);
                                    }}
                                    className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {editId ? "Update" : "Tambah"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Hapus */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn">
                            <h2 className="text-lg font-semibold">Konfirmasi Hapus</h2>
                            <p>Apakah kamu yakin ingin menghapus server <b>{serverToDelete?.ip}</b>?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={async () => {
                                        await deleteServer(serverToDelete.id);
                                        setShowDeleteModal(false);
                                        load();
                                    }}
                                    className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
