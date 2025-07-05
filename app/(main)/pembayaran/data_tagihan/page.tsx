"use client";

import { useEffect, useState } from "react";
import { getTagihanByBulanTahun, updateTagihan } from "@/lib/api_tagihan";
import Swal from "sweetalert2";
import { FaWhatsapp, FaSearch, FaFileExcel, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import * as XLSX from "xlsx";

interface Tagihan {
    id: number;
    id_pelanggan: string;
    nama: string;
    jumlah_tagihan: number;
    status: string;
    no_hp: string;
    no_tagihan: string;
    id_server?: string;
    lokasi?: string;
}

export default function DataTagihanPage() {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = String(currentDate.getFullYear());

    const [selectedBulan, setSelectedBulan] = useState(currentMonth);
    const [selectedTahun, setSelectedTahun] = useState(currentYear);
    const [filtered, setFiltered] = useState<Tagihan[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (initialLoad && selectedBulan && selectedTahun) {
            handleLihat();
            setInitialLoad(false);
        }
    }, [selectedBulan, selectedTahun, initialLoad]);

    const tahunList = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
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

    const handleExportExcel = () => {
        if (filtered.length === 0) return;

        const dataToExport = filtered.map((t, i) => ({
            No: i + 1,
            "ID Pelanggan": t.id_pelanggan,
            Nama: t.nama,
            "No Tagihan": t.no_tagihan,
            "Jumlah Tagihan": Number(t.jumlah_tagihan),
            Lokasi: t.lokasi || "-",
            Status: t.status === "lunas" ? "Lunas" : "Belum Bayar",
            "No HP": t.no_hp
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tagihan");
        XLSX.writeFile(workbook, `Data_Tagihan_${selectedBulan}_${selectedTahun}.xlsx`);
    };

    const handleLihat = async () => {
        if (!selectedBulan || !selectedTahun) return;
        setLoading(true);
        setCurrentPage(1);
        try {
            const res = await getTagihanByBulanTahun(selectedBulan, selectedTahun);
            if (res.success) {
                setFiltered(res.data);
                if (res.data.length === 0) {
                    Swal.fire("Kosong", "Tidak ada data tagihan untuk bulan dan tahun ini.", "info");
                }
            }
        } catch (error) {
            Swal.fire("Error", "Gagal memuat data tagihan.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBayar = async (id: number) => {
        const confirm = await Swal.fire({
            title: "Konfirmasi",
            text: "Tandai tagihan ini sebagai LUNAS?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Batal"
        });

        if (!confirm.isConfirmed) return;
        try {
            const res = await updateTagihan(id, { status: "lunas", tgl_bayar: new Date() });
            if (res.success) {
                Swal.fire("Berhasil", "Tagihan ditandai sebagai lunas.", "success");
                handleLihat();
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan.";
            Swal.fire("Gagal", errorMessage, "error");
        }
    };

    const handleWhatsApp = (nama: string, tagihan: number, no_hp: string, bulan: string, tahun: string, no_tagihan: string, status: string, lokasi?: string) => {
        const bulanName = bulanList.find(b => b.id_bulan === bulan)?.bulan || bulan;
        const nomor = no_hp.replace(/^0/, "62");
        const statusLabel = status === "lunas" ? "✅ *Lunas*" : "❗ *Belum Bayar*";
        const pesan = `Assalamu'alaikum, ${nama}.
\n🧾 *No. Tagihan:* ${no_tagihan}
📅 *Periode:* ${bulanName} ${tahun}
📍 *Lokasi :* ${lokasi || "-"}
💰 *Jumlah Tagihan:* Rp${Number(tagihan).toLocaleString('id-ID')}
📌 *Status:* ${statusLabel}
\nSilakan jika status belum lunas, segera melakukan pembayaran sebelum akhir bulan.\n\nTerima kasih 🙏`;
        window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(pesan.trim())}`, "_blank");
    };

    const filteredData = filtered.filter((t) => {
        if (!search) return true;
        const searchTerm = search.toLowerCase();
        return (
            t.nama.toLowerCase().includes(searchTerm) ||
            t.id_pelanggan.toLowerCase().includes(searchTerm) ||
            t.no_tagihan.toLowerCase().includes(searchTerm) ||
            (t.lokasi && t.lokasi.toLowerCase().includes(searchTerm)) ||
            t.no_hp.includes(search) ||
            t.jumlah_tagihan.toString().includes(search) ||
            t.status.toLowerCase().includes(searchTerm)
        );
    });

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Data Tagihan Pelanggan</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                        <select
                            value={selectedBulan}
                            onChange={(e) => setSelectedBulan(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {bulanList.map((b) => (
                                <option key={b.id_bulan} value={b.id_bulan}>{b.bulan}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                        <select
                            value={selectedTahun}
                            onChange={(e) => setSelectedTahun(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {tahunList.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleLihat}
                            disabled={loading}
                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memuat...
                                </>
                            ) : 'Lihat Data'}
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={handleExportExcel}
                            disabled={filtered.length === 0}
                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${filtered.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FaFileExcel className="mr-2" /> Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {filtered.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Tagihan: {bulanList.find(b => b.id_bulan === selectedBulan)?.bulan} {selectedTahun}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({filteredData.length} data ditemukan)
                            </span>
                        </h3>
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari semua kolom..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pelanggan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Tagihan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagihan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.map((t, i) => (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + i + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {t.id_pelanggan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                {t.nama}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {t.no_tagihan}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Rp{Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {t.lokasi || "-"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.status === "lunas" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {t.status === "lunas" ? "LUNAS" : "BELUM LUNAS"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleBayar(t.id)}
                                                        disabled={t.status === "lunas"}
                                                        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs rounded-md shadow-sm text-white ${t.status === "lunas" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                                    >
                                                        Tandai Lunas
                                                    </button>
                                                    <button
                                                        onClick={() => handleWhatsApp(t.nama, t.jumlah_tagihan, t.no_hp, selectedBulan, selectedTahun, t.no_tagihan, t.status, t.lokasi)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        <FaWhatsapp className="mr-1" /> WhatsApp
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="grid grid-cols-1 gap-4 p-4">
                            {paginatedData.map((t, i) => (
                                <div key={t.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900">{t.nama}</h4>
                                                <p className="text-sm text-gray-500">ID: {t.id_pelanggan}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.status === "lunas" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {t.status === "lunas" ? "LUNAS" : "BELUM LUNAS"}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-gray-500">No Tagihan</p>
                                                <p className="font-medium">{t.no_tagihan}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Tagihan</p>
                                                <p className="font-medium">Rp{Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Lokasi</p>
                                                <p className="font-medium">{t.lokasi || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">No HP</p>
                                                <p className="font-medium">{t.no_hp}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={() => handleBayar(t.id)}
                                                disabled={t.status === "lunas"}
                                                className={`flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm rounded-md shadow-sm text-white ${t.status === "lunas" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                            >
                                                Tandai Lunas
                                            </button>
                                            <button
                                                onClick={() => handleWhatsApp(t.nama, t.jumlah_tagihan, t.no_hp, selectedBulan, selectedTahun, t.no_tagihan, t.status, t.lokasi)}
                                                className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                <FaWhatsapp className="mr-2" /> WA
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari{' '}
                                    <span className="font-medium">{filteredData.length}</span> data
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <FaChevronLeft className="h-4 w-4" />
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
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <FaChevronRight className="h-4 w-4" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak ada data tagihan</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {selectedBulan && selectedTahun
                            ? `Tidak ditemukan data tagihan untuk periode ${bulanList.find(b => b.id_bulan === selectedBulan)?.bulan} ${selectedTahun}`
                            : "Pilih bulan dan tahun untuk melihat data tagihan"}
                    </p>
                </div>
            )}
        </div>
    );
}