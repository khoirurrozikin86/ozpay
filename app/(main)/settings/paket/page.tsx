"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    getPakets,
    createPaket,
    updatePaket,
    deletePaket,
} from "@/lib/api_paket";

export default function PaketPage() {
    const [pakets, setPakets] = useState([]);
    const [form, setForm] = useState({
        nama: "",
        harga: "",
        kecepatan: "",
        durasi: "",
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paketToDelete, setPaketToDelete] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(true); // Add loading state

    const load = async () => {
        setLoading(true); // Set loading to true when loading starts
        const data = await getPakets();
        setPakets(data);
        setLoading(false); // Set loading to false once the data is fetched
    };

    useEffect(() => {
        load();
    }, []);

    const resetForm = () => {
        setForm({
            nama: "",
            harga: "",
            kecepatan: "",
            durasi: "",
        });
        setEditId(null);
    };

    const handleSubmit = async () => {
        if (!form.nama || !form.harga || !form.kecepatan || !form.durasi) {
            return Swal.fire("Error", "Semua field wajib diisi!", "warning");
        }

        if (isNaN(Number(form.harga)) || Number(form.harga) <= 0) {
            return Swal.fire("Error", "Harga harus berupa angka positif", "warning");
        }

        if (isNaN(Number(form.durasi)) || Number(form.durasi) < 1) {
            return Swal.fire("Error", "Durasi minimal 1 hari", "warning");
        }

        try {
            const formToSend = {
                ...form,
                harga: parseFloat(form.harga),
                durasi: parseInt(form.durasi, 10),
            };

            if (editId) {
                await updatePaket(editId, formToSend);
            } else {
                await createPaket(formToSend);
            }

            resetForm();
            setShowFormModal(false);
            load();
            Swal.fire("Sukses", `Data berhasil ${editId ? "diperbarui" : "ditambahkan"}.`, "success");
        } catch (error: any) {
            if (error instanceof Response) {
                const errData = await error.json();
                const message =
                    errData?.message ||
                    Object.values(errData.errors || {}).flat().join("\n") ||
                    "Terjadi kesalahan.";
                Swal.fire("Gagal", message, "error");
            } else {
                Swal.fire("Gagal", error?.message || "Terjadi kesalahan.", "error");
            }
        }
    };

    const handleEdit = (paket: any) => {
        const { nama, harga, kecepatan, durasi } = paket;
        setForm({ nama, harga, kecepatan, durasi });
        setEditId(paket.id);
        setShowFormModal(true);
    };

    const filteredPakets = pakets.filter((p: any) =>
        p.nama.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPakets.length / itemsPerPage);
    const paginatedPakets = filteredPakets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-4">
            <div className="space-y-6">
                {/* Title Section */}
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Paket WiFi</h1>

                {/* Button and Search Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <button
                        onClick={() => setShowFormModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm transition-all duration-300 shadow-md w-full sm:w-auto"
                    >
                        Tambah Paket
                    </button>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari paket..."
                        className="w-full sm:w-64 px-4 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                </div>

                {/* Paket Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && (
                        <div className="text-center p-12">
                            <i className="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
                            <p className="mt-2 text-xl text-gray-600">Memuat data...</p>
                        </div>
                    )}

                    {paginatedPakets.map((p: any) => (
                        <div
                            key={p.id}
                            className="bg-gradient-to-br from-blue-500 to-indigo-400 text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-all ease-in-out transform hover:scale-105 hover:shadow-2xl duration-300"
                        >
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-1">{p.nama}</h3>
                                <div className="border-t border-white/30 my-2"></div>
                                <p className="text-sm">ID Paket: {p.id_paket}</p>
                                <p className="text-4xl font-bold my-3">Rp {Number(p.harga || 0).toLocaleString("id-ID")}</p>
                                <p className="text-sm">Durasi: {p.durasi} Hari</p>
                                <p className="text-sm">Kecepatan: {p.kecepatan}</p>
                            </div>

                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={() => handleEdit(p)}
                                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-2 text-sm rounded-full shadow-md"
                                >
                                    <i className="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setPaketToDelete(p);
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
                            <h2 className="text-lg font-semibold">{editId ? "Edit Paket" : "Tambah Paket"}</h2>
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
                            <p>Apakah kamu yakin ingin menghapus paket <b>{paketToDelete?.nama}</b>?</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={async () => {
                                        await deletePaket(paketToDelete.id);
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
