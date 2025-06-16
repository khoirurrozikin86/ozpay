"use client";

import { useEffect, useState } from "react";
import { getTagihanBelumLunas } from "@/lib/api_tagihan";
import * as XLSX from "xlsx";

export default function BelumLunasPage() {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;



    useEffect(() => {
        getTagihanBelumLunas().then((res) => {
            if (res.success) setData(res.data);
        });
    }, []);

    const filtered = data.filter((t) =>
        t.pelanggan?.nama?.toLowerCase().includes(search.toLowerCase()) ||
        t.id_pelanggan?.toLowerCase().includes(search.toLowerCase())
    );

    const totalCount = filtered.length;
    const totalNominal = filtered.reduce((sum, t) => sum + Number(t.jumlah_tagihan || 0), 0);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportExcel = () => {
        const exportData = filtered.map((t, i) => ({
            No: i + 1,
            "ID Pelanggan": t.id_pelanggan,
            "Nama Pelanggan": t.pelanggan?.nama || "-",
            "Bulan/Tahun": `${t.id_bulan}/${t.tahun}`,
            "Jumlah Tagihan": t.jumlah_tagihan,
            Status: t.status,
            "Tanggal Bayar": t.tgl_bayar
                ? new Date(t.tgl_bayar).toLocaleDateString("id-ID")
                : "-",
            "Lokasi Server": t.pelanggan?.server?.lokasi || "-",
            Penerima: t.user?.nama || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Belum Lunas");
        XLSX.writeFile(workbook, "Tagihan_Belum_Lunas.xlsx");
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h1 className="text-xl font-semibold mb-4 sm:mb-0">TAGIHAN BELUM LUNAS</h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Cari nama atau ID pelanggan..."
                        className="border border-gray-200 dark:border-gray-600 p-2 rounded text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <button
                        onClick={handleExportExcel}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 w-full sm:w-auto transition-all duration-300"
                    >
                        <i className="fas fa-file-excel text-green-300"></i> Export Excel
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-100 p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold text-red-800 mb-1">Total Belum Lunas (Nominal)</h2>
                    <p className="text-xl font-bold text-red-700">
                        Rp {Number(totalNominal).toLocaleString("id-ID")}
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow">
                    <h2 className="text-sm font-semibold text-red-800 mb-1">Jumlah Tagihan</h2>
                    <p className="text-xl font-bold text-red-700">{totalCount} data</p>
                </div>
            </div>

            {/* Table Section (Desktop) */}
            <div className="overflow-x-auto hidden sm:block">
                <table className="table-auto w-full text-sm border border-separate border-spacing-0">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-2 py-2 border">No</th>
                            <th className="px-2 py-2 border">Pelanggan</th>
                            <th className="px-2 py-2 border">Bulan/Tahun</th>
                            <th className="px-2 py-2 border">Tagihan</th>
                            <th className="px-2 py-2 border">Status</th>
                            <th className="px-2 py-2 border">Tanggal</th>
                            <th className="px-2 py-2 border">Lokasi Server</th>
                            <th className="px-2 py-2 border">Penerima</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((t, i) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-2 py-1 border">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                <td className="px-2 py-1 border">{t.id_pelanggan} - {t.pelanggan?.nama}</td>
                                <td className="px-2 py-1 border">{t.id_bulan}/{t.tahun}</td>
                                <td className="px-2 py-1 border">
                                    Rp {Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}
                                </td>

                                <td className="px-2 py-1 border">
                                    <span className="text-white bg-red-600 px-2 py-1 text-xs rounded">BELUM</span>
                                </td>
                                <td className="px-2 py-1 border">
                                    {t.tgl_bayar ? new Date(t.tgl_bayar).toLocaleDateString("id-ID") : "-"}
                                </td>
                                <td className="px-2 py-1 border">{t.pelanggan?.server?.lokasi || "-"}</td>
                                <td className="px-2 py-1 border">{t.user?.nama || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Card View Section (Mobile) */}
            <div className="sm:hidden">
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {paginated.map((t) => (
                        <div
                            key={t.id}
                            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 flex flex-col"
                        >
                            <h3 className="text-xl font-bold mb-2">{t.pelanggan.nama}</h3>
                            <div className="text-sm text-gray-200 mb-2">Bulan/Tahun: {t.id_bulan}/{t.tahun}</div>
                            <div className="text-lg font-semibold mb-3">Rp {Number(t.jumlah_tagihan).toLocaleString("id-ID")}</div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">BELUM</span>
                                <span className="text-sm">   {t.tgl_bayar ? new Date(t.tgl_bayar).toLocaleDateString("id-ID") : "-"}</span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {filtered.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
                    <span>Menampilkan {paginated.length} dari {filtered.length} entri</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}
        </div>

    );
}
