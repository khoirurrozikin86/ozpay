"use client";

import { useEffect, useState } from "react";
import { getTagihanLunasByBulanTahun } from "@/lib/api_tagihan";
import StrukPDF from "@/components/report/StrukPDF";
import { pdf } from "@react-pdf/renderer";
import * as XLSX from "xlsx";

const bulanList = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
    { value: "03", label: "Maret" }, { value: "04", label: "April" },
    { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
    { value: "09", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

export default function TagihanLunasPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBulan, setSelectedBulan] = useState("");
    const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
    const [search, setSearch] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const tahunList = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

    const fetchData = async () => {
        if (!selectedBulan || !selectedTahun) return;
        setLoading(true);
        const res = await getTagihanLunasByBulanTahun(selectedBulan, selectedTahun);
        if (res.success) setData(res.data);
        setLoading(false);
        setCurrentPage(1);
    };

    const handleDownloadStruk = async (tagihan: any) => {
        const blob = await pdf(
            <StrukPDF
                data={{
                    pelanggan: `${tagihan.id_pelanggan} - ${tagihan.pelanggan.nama}`,
                    paket: tagihan.pelanggan.paket?.nama ?? "-",
                    bulan: tagihan.id_bulan,
                    tahun: tagihan.tahun,
                    jumlah_tagihan: tagihan.jumlah_tagihan,
                    status: tagihan.status,
                    tgl_bayar: new Date(tagihan.tgl_bayar).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "short", year: "numeric",
                    }),
                    penerima: tagihan.user?.name ?? "-", // ➕ Tambahkan ini
                }}
            />
        ).toBlob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Struk_Tagihan_${tagihan.id}.pdf`;
        link.click();
    };

    const handleExportExcel = () => {
        if (!filteredData.length) return;

        const excelData = filteredData.map((t, i) => ({
            No: i + 1,
            "ID Pelanggan": t.id_pelanggan,
            Nama: t.pelanggan?.nama || "-",
            "Nama Paket": t.pelanggan?.paket?.nama || "-",
            "Bulan/Tahun": `${t.id_bulan}/${t.tahun}`,
            "Jumlah Tagihan": t.jumlah_tagihan,
            Status: t.status,
            "Tanggal Bayar": t.tgl_bayar
                ? new Date(t.tgl_bayar).toLocaleDateString("id-ID")
                : "-",
            "Penerima": t.user?.name || "-", // ➕ Tambahkan kolom ini
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TagihanLunas");
        XLSX.writeFile(workbook, `Tagihan_Lunas_${selectedBulan}_${selectedTahun}.xlsx`);
    };


    const filteredData = data.filter((t) =>
        t.id_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
        t.pelanggan?.nama.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md min-h-screen">
            <h1 className="text-2xl font-semibold mb-6">TAGIHAN LUNAS</h1>

            {/* Filter Form */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <select
                    value={selectedBulan}
                    onChange={(e) => setSelectedBulan(e.target.value)}
                    className="p-3 rounded-lg w-full sm:w-auto border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                    <option value="">-- Pilih Bulan --</option>
                    {bulanList.map((b) => (
                        <option key={b.value} value={b.value}>
                            {b.label}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedTahun}
                    onChange={(e) => setSelectedTahun(e.target.value)}
                    className="p-3 rounded-lg w-full sm:w-auto border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                >
                    <option value="">-- Pilih Tahun --</option>
                    {tahunList.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau ID"
                    className="p-3 rounded-lg w-full sm:w-64 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                />

                <div className="flex gap-2 justify-center sm:justify-start">
                    <button
                        onClick={fetchData}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-search"></i> Lihat
                    </button>
                    {filteredData.length > 0 && (
                        <button
                            onClick={handleExportExcel}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full sm:w-auto transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-file-excel text-green-300"></i> Excel
                        </button>
                    )}
                </div>
            </div>


            {/* Table or Card Display */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden sm:block">
                        <table className="table-auto w-full text-sm text-left border-separate border-spacing-0">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Bulan/Tahun</th>
                                    <th className="px-4 py-3">Tagihan</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Tanggal</th>
                                    <th className="px-4 py-3">Penerima</th>
                                    <th className="px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {paginatedData.map((t, i) => (
                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="px-4 py-2">{t.id_pelanggan} - {t.pelanggan.nama}</td>
                                        <td className="px-4 py-2">{t.id_bulan}/{t.tahun}</td>
                                        <td className="px-4 py-2">Rp {Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}</td>
                                        <td className="px-4 py-2">
                                            <span className="text-white bg-green-600 px-2 py-1 text-xs rounded">LUNAS</span>
                                        </td>
                                        <td className="px-4 py-2">{new Date(t.tgl_bayar).toLocaleDateString("id-ID")}</td>
                                        <td className="px-4 py-2">{t.user?.name ?? "-"}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => handleDownloadStruk(t)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs transition-all duration-300"
                                            >
                                                🖨 Struk
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden">
                        {paginatedData.map((t) => (
                            <div
                                key={t.id}
                                className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-4 flex flex-col"
                            >
                                <h3 className="text-xl font-bold mb-2">{t.pelanggan.nama}</h3>
                                <div className="text-sm text-gray-200 mb-2">Bulan/Tahun: {t.id_bulan}/{t.tahun}</div>
                                <div className="text-lg font-semibold mb-3">Rp {Number(t.jumlah_tagihan).toLocaleString("id-ID")}</div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">LUNAS</span>
                                    <span className="text-sm">{new Date(t.tgl_bayar).toLocaleDateString("id-ID")}</span>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleDownloadStruk(t)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs"
                                    >
                                        🖨 Struk
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredData.length > itemsPerPage && (
                        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                            <div>Menampilkan {paginatedData.length} dari {filteredData.length} entri</div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border rounded disabled:opacity-50"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
