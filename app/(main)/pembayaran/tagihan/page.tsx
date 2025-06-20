"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getPelangganUntukTagihan } from "@/lib/api_pelanggan";
import { createTagihanMassal } from "@/lib/api_tagihan";
import type { Pelanggan } from "@/types/pelanggan";

export default function BuatTagihanPage() {
    const [selectedBulan, setSelectedBulan] = useState("");
    const [selectedTahun, setSelectedTahun] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingPelanggan, setLoadingPelanggan] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPaket, setFilterPaket] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);

    const tahunList = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

    const bulanList = [
        { id_bulan: "01", bulan: "Januari" },
        { id_bulan: "02", bulan: "Februari" },
        { id_bulan: "03", bulan: "Maret" },
        { id_bulan: "04", bulan: "April" },
        { id_bulan: "05", bulan: "Mei" },
        { id_bulan: "06", bulan: "Juni" },
        { id_bulan: "07", bulan: "Juli" },
        { id_bulan: "08", bulan: "Agustus" },
        { id_bulan: "09", bulan: "September" },
        { id_bulan: "10", bulan: "Oktober" },
        { id_bulan: "11", bulan: "November" },
        { id_bulan: "12", bulan: "Desember" },
    ];

    const fetchPelanggan = async () => {
        setLoadingPelanggan(true);
        const data = await getPelangganUntukTagihan();
        setPelanggans(data.data || []);
        setLoadingPelanggan(false);
    };

    useEffect(() => {
        fetchPelanggan();
    }, []);

    const handleSubmit = async () => {
        if (!selectedBulan || !selectedTahun) {
            Swal.fire("Gagal", "Pilih bulan dan tahun terlebih dahulu", "warning");
            return;
        }
        const confirm = await Swal.fire({
            title: "Buat Tagihan?",
            text: "Tagihan akan dibuat untuk semua pelanggan.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Lanjutkan",
            cancelButtonText: "Batal",
        });

        if (!confirm.isConfirmed) return;

        setLoading(true);

        try {
            const payload = {
                id_bulan: selectedBulan,
                tahun: selectedTahun,
                user_id: 1,
                pelanggan: filteredData.map((p) => ({
                    id_pelanggan: p.id_pelanggan,
                    jumlah_tagihan: p.paket?.harga || 0,
                })),
            };

            const result = await createTagihanMassal(payload);

            if (result.success) {
                Swal.fire("Berhasil", result.message, "success");
            } else if (result.status === 409) {
                Swal.fire("Gagal", result.message, "warning");
            } else {
                Swal.fire("Gagal", result.message || "Terjadi kesalahan", "error");
            }
        } catch (e) {
            Swal.fire("Error", "data duplikat", "error");
        }

        setLoading(false);
    };

    const filteredData = pelanggans.filter((p) => {
        const matchesSearch =
            p.nama.toLowerCase().includes(search.toLowerCase()) ||
            p.id_pelanggan.toLowerCase().includes(search.toLowerCase());
        const matchesPaket = filterPaket === "" || p.paket?.nama === filterPaket;
        return matchesSearch && matchesPaket;
    });

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const uniquePakets = Array.from(new Set(pelanggans.map((p) => p.paket?.nama).filter(Boolean)));

    return (
        <div className="p-1">
            <div className="p-3">
                <div className="">
                    <h1 className="text-xl font-semibold mb-6 text-gray-700 text-center">Buat Tagihan</h1>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                        <div className="w-full max-w-xs">

                            <select
                                value={selectedBulan}
                                onChange={(e) => setSelectedBulan(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-400"
                            >
                                <option value="">-- Pilih Bulan --</option>
                                {bulanList.map((b: any) => (
                                    <option key={b.id_bulan} value={b.id_bulan}>
                                        {b.id_bulan} - {b.bulan}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full max-w-xs">
                            <select
                                value={selectedTahun}
                                onChange={(e) => setSelectedTahun(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-400"
                            >
                                <option value="">-- Pilih Tahun --</option>
                                {tahunList.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>




                    </div>

                </div>


                <div className="flex gap-2 justify-center mt-6">
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-yellow-400 text-white rounded shadow">
                        Batal
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded shadow">
                        {loading ? "Memproses..." : "Buat Tagihan"}
                    </button>
                </div>





                <div className="">
                    {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div className="w-full lg:w-1/2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">Cari Pelanggan</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-400"
                                placeholder="Cari nama atau ID pelanggan"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <label className="text-sm font-medium text-gray-600 block mb-1">Filter Paket</label>
                            <select
                                value={filterPaket}
                                onChange={(e) => setFilterPaket(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring focus:border-blue-400"
                            >
                                <option value="">Semua Paket</option>
                                {uniquePakets.map((nama, i) => (
                                    <option key={i} value={nama}>{nama}</option>
                                ))}
                            </select>
                        </div>
                    </div> */}

                    <div className="overflow-x-auto bg-white rounded-xl shadow p-4 mt-4">
                        <h3 className="text-md font-semibold mb-4 text-gray-700">Daftar Pelanggan & Paket</h3>

                        {loadingPelanggan ? (
                            <div className="text-center py-8 text-gray-500 animate-pulse">Memuat data pelanggan...</div>
                        ) : (
                            <table className="min-w-full text-sm border-separate border-spacing-y-2">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-2 border border-gray-200 rounded-l-md hidden sm:table-cell">No</th>
                                        <th className="p-2 border border-gray-200 hidden sm:table-cell">ID Pelanggan</th>
                                        <th className="p-2 border border-gray-200">Nama</th>
                                        <th className="p-2 border border-gray-200 hidden sm:table-cell">Paket</th>
                                        <th className="p-2 border border-gray-200 rounded-r-md">Tagihan (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((p: any, i: number) => (
                                        <tr key={p.id} className="bg-white shadow rounded text-gray-800">
                                            <td className="p-2 border border-gray-200 hidden sm:table-cell">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                            <td className="p-2 border border-gray-200 hidden sm:table-cell">{p.id_pelanggan}</td>
                                            <td className="p-2 border border-gray-200">{p.nama}</td>
                                            <td className="p-2 border border-gray-200 hidden sm:table-cell">{p.paket?.nama || "-"}</td>
                                            <td className="p-2 border border-gray-200">
                                                Rp {Number(p.paket?.harga || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm">Halaman {currentPage} dari {totalPages}</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    disabled={currentPage === 1}
                                >Sebelumnya</button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                >Berikutnya</button>
                            </div>
                        </div>
                    </div>

                </div>


            </div>
        </div>
    );
}
