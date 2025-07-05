"use client";

import { useState, useEffect } from "react";
import { getPenghasilanByTanggal } from "@/lib/api_tagihan";
import * as XLSX from "xlsx";

export default function PenghasilanPage() {
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    const [tanggal, setTanggal] = useState(today);
    const [result, setResult] = useState<{ data: any[]; summary: any } | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 10;

    const handleCheck = async () => {
        if (!tanggal) return;
        setLoading(true);
        setCurrentPage(1); // Reset to first page when new data is loaded
        const res = await getPenghasilanByTanggal(tanggal);
        if (res.success) {
            setResult({
                data: res.data,
                summary: res.summary,
            });
        } else {
            setResult(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        handleCheck(); // otomatis ambil data saat halaman dibuka
    }, []);

    // Filter data based on search term across all columns
    const filteredData = result?.data?.filter((t) => {
        if (t.status !== "lunas") return false;

        const searchLower = searchTerm.toLowerCase();

        // Check all relevant fields for search term
        const matchesSearch =
            (t.no_tagihan?.toLowerCase().includes(searchLower)) ||
            (t.pelanggan?.nama?.toLowerCase().includes(searchLower)) ||
            (t.pelanggan?.alamat?.toLowerCase().includes(searchLower)) ||
            (t.jumlah_tagihan?.toString().includes(searchTerm)) ||
            (t.tgl_bayar?.toLowerCase().includes(searchLower)) ||
            (t.user?.name?.toLowerCase().includes(searchLower)) ||
            (t.id_bulan?.toString().includes(searchTerm)) ||
            (t.tahun?.toString().includes(searchTerm));

        return matchesSearch;
    }) || [];

    // Calculate dynamic summary based on filtered data
    const dynamicSummary = {
        total_lunas: filteredData.reduce((sum, item) => sum + (Number(item.jumlah_tagihan) || 0), 0),
        total_transaksi: filteredData.length
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) return;

        const excelData = filteredData.map((t: any, i: number) => ({
            No: i + 1,
            "No Tagihan": t.no_tagihan,
            "ID Pelanggan": t.id_pelanggan,
            "Nama Pelanggan": t.pelanggan?.nama || "-",
            "Jumlah Tagihan": Number(t.jumlah_tagihan) || 0, // Konversi ke number
            "Tanggal Bayar": t.tgl_bayar
                ? new Date(t.tgl_bayar).toLocaleDateString("id-ID")
                : "-",
            Penerima: t.user?.name || "-",
            "ID Bulan": t.id_bulan,
            Tahun: t.tahun,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Opsional: Format kolom jumlah sebagai currency
        if (worksheet['!ref']) {
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let i = range.s.r + 1; i <= range.e.r; ++i) {
                const cellAddress = XLSX.utils.encode_cell({ r: i, c: 4 }); // Kolom E (indeks 4) adalah Jumlah Tagihan
                if (worksheet[cellAddress]) {
                    worksheet[cellAddress].t = 'n'; // Set tipe cell ke number
                    worksheet[cellAddress].z = '#,##0.00'; // Format angka dengan separator ribuan
                }
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tagihan Lunas");

        XLSX.writeFile(workbook, `Tagihan_Lunas_${tanggal}.xlsx`);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-xl font-semibold mb-4">Penghasilan Harian</h1>

            {/* Filter and Button Section */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="border px-3 py-2 rounded w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleCheck}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
                    disabled={loading}
                >
                    {loading ? "Memuat..." : "Cek"}
                </button>
            </div>

            {/* Loading State */}
            {loading && <p>Sedang menghitung...</p>}

            {/* Result Data */}
            {result && (
                <>
                    {/* Summary Section */}
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                        <div className="bg-blue-100 p-4 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2">Total Tertagih (Lunas)</h2>
                            <p className="text-2xl font-bold text-blue-700">
                                Rp {Number(dynamicSummary.total_lunas || 0).toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                Jumlah Pembayaran: {dynamicSummary.total_transaksi} transaksi
                            </p>
                        </div>
                    </div>

                    {/* Search Section */}
                    <div className="mt-6">
                        <input
                            type="text"
                            placeholder="Cari berdasarkan no tagihan, nama, alamat, jumlah, penerima, dll..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="border px-3 py-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Tagihan Lunas Section */}
                    {filteredData.length > 0 ? (
                        <>
                            <div className="mt-8 flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    {(currentPage - 1) * itemsPerPage + 1} -{' '}
                                    {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                                </div>
                                <button
                                    onClick={handleExportExcel}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 mb-3"
                                >
                                    <i className="fas fa-file-excel text-green-300"></i>
                                    Export Excel
                                </button>
                            </div>

                            {/* Desktop Table (Hidden in Mobile) */}
                            <div className="overflow-x-auto hidden sm:block">
                                <table className="table-auto w-full text-sm border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border px-2 py-1">No</th>
                                            <th className="border px-2 py-1">No Tagihan</th>
                                            <th className="border px-2 py-1">Pelanggan</th>
                                            <th className="border px-2 py-1">Alamat</th>
                                            <th className="border px-2 py-1">Jumlah</th>
                                            <th className="border px-2 py-1">Tanggal Bayar</th>
                                            <th className="border px-2 py-1">Penerima</th>
                                            <th className="border px-2 py-1">ID Bulan</th>
                                            <th className="border px-2 py-1">Tahun</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedData.map((t, i) => (
                                            <tr key={t.id}>
                                                <td className="border px-2 py-1">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                                <td className="border px-2 py-1">{t.no_tagihan}</td>
                                                <td className="border px-2 py-1">{t.pelanggan?.nama}</td>
                                                <td className="border px-2 py-1">{t.pelanggan?.alamat}</td>
                                                <td className="border px-2 py-1">
                                                    Rp {Number(t.jumlah_tagihan).toLocaleString("id-ID")}
                                                </td>
                                                <td className="border px-2 py-1">
                                                    {new Date(t.tgl_bayar).toLocaleDateString("id-ID")}
                                                </td>
                                                <td className="border px-2 py-1">{t.user?.name || "-"}</td>
                                                <td className="border px-2 py-1">{t.id_bulan}</td>
                                                <td className="border px-2 py-1">{t.tahun}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View (Hidden in Desktop) */}
                            <div className="sm:hidden">
                                {paginatedData.map((t) => (
                                    <div
                                        key={t.id}
                                        className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-4 flex flex-col"
                                    >
                                        <h3 className="text-xl font-bold mb-2">{t.pelanggan?.nama}</h3>
                                        <div className="text-sm text-gray-200 mb-2"> {t.id_bulan}/{t.tahun}- {t.pelanggan?.alamat}</div>
                                        <div className="text-lg font-semibold mb-3">
                                            Rp {Number(t.jumlah_tagihan).toLocaleString("id-ID")}
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Lunas</span>
                                            <span className="text-sm">
                                                {new Date(t.tgl_bayar).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                        <div className="text-sm">Penerima: {t.user?.name || "-"}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-4">
                                    <nav className="inline-flex rounded-md shadow">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            prev
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
                                                    className={`px-3 py-1 border-t border-b border-gray-300 ${currentPage === pageNum ? 'bg-blue-50 text-blue-600 border-blue-500' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            next
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="mt-6 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                            Tidak ada data yang sesuai dengan pencarian
                        </div>
                    )}
                </>
            )}
        </div>
    );
}