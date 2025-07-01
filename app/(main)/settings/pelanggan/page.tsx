'use client';

import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { getPelanggan, createPelanggan, updatePelanggan, deletePelanggan } from "@/lib/api_pelanggan";
import { getPakets } from "@/lib/api_paket";
import { getServers } from "@/lib/api_server";
import * as XLSX from "xlsx";

interface Pelanggan {
    id: number;
    id_pelanggan: string;
    nama: string;
    alamat: string;
    no_hp: string;
    email: string;
    password: string;
    id_paket: string;
    id_server: string;
    ip_router: string;
    ip_parent_router: string;
    remark1: string; // Add remark1 field
}

interface Paket {
    id: number;
    nama: string;
}

interface Server {
    id: number;
    lokasi: string;
}

export default function PelangganPage() {
    const [form, setForm] = useState({
        id_pelanggan: "",
        nama: "",
        alamat: "",
        no_hp: "",
        email: "",
        password: "",
        id_paket: "",
        id_server: "",
        ip_router: "",
        ip_parent_router: "",
        remark1: "1", // Default to "Tidak Aktif"
    });
    const [editId, setEditId] = useState<number | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pelangganToDelete, setPelangganToDelete] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const idInputRef = useRef<HTMLInputElement>(null);

    const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
    const [pakets, setPakets] = useState<Paket[]>([]);
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState({
        table: true,
        form: false,
        delete: false
    });

    const load = async () => {
        setLoading(prev => ({ ...prev, table: true }));
        const data = await getPelanggan();
        setPelanggans(data.data || []);
        setLoading(prev => ({ ...prev, table: false }));
    };

    const loadPaket = async () => {
        const data = await getPakets();
        setPakets(data);
    };

    const loadServer = async () => {
        const data = await getServers();
        setServers(data);
    };

    useEffect(() => {
        load();
        loadPaket();
        loadServer();
    }, []);

    const handleSubmit = async () => {
        try {
            if (editId) {
                await updatePelanggan(editId, form); // Update the selected pelanggan
            } else {
                await createPelanggan(form); // Create a new pelanggan
            }
            resetForm();
            setShowFormModal(false);
            load();
            Swal.fire("Sukses", `Data berhasil ${editId ? "diperbarui" : "ditambahkan"}.`, "success");
        } catch (error: any) {
            const message = error?.message || JSON.stringify(error);
            Swal.fire("Gagal", message, "error");
        }
    };

    const handleEdit = (data: any) => {
        const { remark1, remark2, remark3, created_at, updated_at, ...filtered } = data;

        // Ensure remark1 is not null or undefined, fallback to "0" (Tidak Aktif) if it is
        setForm({ ...filtered, remark1: remark1 != null ? remark1.toString() : "0" });

        setEditId(data.id);
        setShowFormModal(true);
    };
    const handleExportExcel = () => {
        if (!pelanggans || pelanggans.length === 0) {
            Swal.fire("Info", "Tidak ada data pelanggan untuk diekspor.", "info");
            return;
        }

        const dataToExport = pelanggans.map((p, i) => {
            const paketName = pakets.find(pk => pk.id === Number(p.id_paket))?.nama || "-";
            const serverName = servers.find(s => s.id === Number(p.id_server))?.lokasi || "-";

            return {
                No: i + 1,
                "ID Pelanggan": p.id_pelanggan,
                Nama: p.nama,
                Alamat: p.alamat,
                "No HP": p.no_hp,
                Email: p.email,
                Paket: paketName,
                Server: serverName,
                "IP Router": p.ip_router,
                "IP Parent Router": p.ip_parent_router
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pelanggan");
        XLSX.writeFile(workbook, "Data_Pelanggan.xlsx");
    };

    const renderFormField = (key: string, value: string) => {
        if (key === 'id_paket') {
            return (
                <select
                    value={value}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Pilih Paket</option>
                    {pakets.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                </select>
            );
        }
        if (key === 'id_server') {
            return (
                <select
                    value={value}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Pilih Server</option>
                    {servers.map((s) => (
                        <option key={s.id} value={s.id}>{s.lokasi}</option>
                    ))}
                </select>
            );
        }
        if (key === 'remark1') {
            return (
                <select
                    value={value}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="1">Aktif</option>
                    <option value="0">Tidak Aktif</option>
                </select>
            );
        }
        return (
            <input
                type={key === 'password' ? 'password' : 'text'}
                value={value}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Masukkan ${key.replace('_', ' ')}`}
            />
        );
    };

    const resetForm = () => {
        setForm({
            id_pelanggan: "",
            nama: "",
            alamat: "",
            no_hp: "",
            email: "",
            password: "",
            id_paket: "",
            id_server: "",
            ip_router: "",
            ip_parent_router: "",
            remark1: "1", // Default to "Tidak Aktif"
        });
        setEditId(null);
    };

    const filteredData = pelanggans.filter((p: any) =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.id_pelanggan.includes(search)
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginated = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-4">
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manajemen Pelanggan</h1>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFormModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-all ease-in-out duration-300 shadow-lg transform hover:scale-105"
                        >
                            <i className="fas fa-user-plus"></i> Tambah Pelanggan
                        </button>

                        <button
                            onClick={handleExportExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2 w-full sm:w-auto transition-all ease-in-out duration-300 shadow-lg transform hover:scale-105"
                        >
                            <i className="fas fa-file-export"></i> Export Excel
                        </button>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        className="w-full sm:w-64 px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ease-in-out duration-300"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-fixed min-w-full table-pelanggan">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    {['ID', 'Nama', 'No HP', 'Email', 'Paket', 'Server', 'IP Router', 'Aksi'].map((header) => (
                                        <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginated.map((p: any) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-all ease-in-out duration-300">
                                        {['id_pelanggan', 'nama', 'no_hp', 'email'].map((key) => (
                                            <td key={key} className="px-4 py-3 text-sm text-gray-900">{p[key]}</td>
                                        ))}
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {pakets.find((paket) => paket.id === p.id_paket)?.nama || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {servers.find((server) => server.id === p.id_server)?.lokasi || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{p.ip_router || '-'}</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handleEdit(p); }}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    Edit
                                                </a>
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setPelangganToDelete(p); setShowDeleteModal(true); }}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Hapus
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Versi mobile (card style) */}
                <div className="sm:hidden space-y-4">
                    {paginated.map((p: any) => {
                        const paketNama = pakets.find((paket) => paket.id === p.id_paket)?.nama || '-';
                        const lokasiServer = servers.find((s) => s.id === p.id_server)?.lokasi || '-';

                        return (
                            <div key={p.id} className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-2">
                                <div className="font-semibold text-gray-900">{p.nama}</div>
                                <div className="font-semibold text-gray-900 text-sm"> {paketNama} || {lokasiServer}</div>

                                <div className="flex justify-end gap-4 pt-2 border-t border-gray-100 mt-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPelangganToDelete(p);
                                            setShowDeleteModal(true);
                                        }}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-500">
                            {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}-
                            {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                            >
                                Prev
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-md text-sm ${pageNum === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Form Modal */}
                {showFormModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-sm sm:max-w-md space-y-4 animate-fadeIn max-h-[80vh] overflow-hidden scrollbar-hide flex flex-col">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">{editId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h2>

                            <div className="overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(form).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <label className="mb-1 text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</label>

                                            {key === 'id_pelanggan' ? (
                                                <input
                                                    type="text"
                                                    value={value}
                                                    readOnly
                                                    className="border border-gray-300 p-2 rounded-md text-sm bg-gray-100 text-gray-500"
                                                    placeholder="ID Pelanggan"
                                                />
                                            ) : key === 'id_paket' ? (
                                                <select
                                                    value={value}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Pilih Paket</option>
                                                    {pakets.map((p: any) => (
                                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                                    ))}
                                                </select>
                                            ) : key === 'id_server' ? (
                                                <select
                                                    value={value}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Pilih Server</option>
                                                    {servers.map((s: any) => (
                                                        <option key={s.id} value={s.id}>{s.lokasi}</option>
                                                    ))}
                                                </select>
                                            ) : key === 'remark1' ? (
                                                <select
                                                    value={value}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="1">Aktif</option>
                                                    <option value="0">Tidak Aktif</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type={key === 'password' ? 'password' : 'text'}
                                                    value={value}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    className="border border-gray-300 p-2 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={`Masukkan ${key.replace('_', ' ')}`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between gap-2 pt-4 mt-4 border-t border-gray-200 pt-4">
                                <button
                                    onClick={() => { resetForm(); setShowFormModal(false); }}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm w-full sm:w-auto"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm w-full sm:w-auto"
                                >
                                    {editId ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 animate-fadeIn">
                            <h2 className="text-lg font-semibold text-gray-800">Konfirmasi Hapus</h2>
                            <p className="text-gray-600">Yakin ingin menghapus pelanggan <b>{pelangganToDelete?.nama}</b>?</p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={async () => {
                                        await deletePelanggan(pelangganToDelete.id);
                                        setShowDeleteModal(false);
                                        load();
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
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
