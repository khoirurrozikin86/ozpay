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
    const [selectedBulan, setSelectedBulan] = useState(
        // Set default value to current month (pad with leading zero)
        (new Date().getMonth() + 1).toString().padStart(2, '0')
    );
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
                    penerima: tagihan.user?.name ?? "-",
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
            Alamat: t.pelanggan?.alamat || "-",
            "Nama Paket": t.pelanggan?.paket?.nama || "-",
            "Bulan/Tahun": `${t.id_bulan}/${t.tahun}`,
            "Jumlah Tagihan": Number(t.jumlah_tagihan), // Convert to number
            Status: t.status,
            "Tanggal Bayar": t.tgl_bayar
                ? new Date(t.tgl_bayar).toLocaleDateString("id-ID")
                : "-",
            "Penerima": t.user?.name || "-",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TagihanLunas");
        XLSX.writeFile(workbook, `Tagihan_Lunas_${selectedBulan}_${selectedTahun}.xlsx`);
    };

    const filteredData = data.filter((t) => {
        const searchTerm = search.toLowerCase();
        return (
            t.id_pelanggan.toLowerCase().includes(searchTerm) ||
            t.pelanggan?.nama.toLowerCase().includes(searchTerm) ||
            t.pelanggan?.alamat.toLowerCase().includes(searchTerm) ||
            t.pelanggan?.paket?.nama.toLowerCase().includes(searchTerm) ||
            t.tahun.toString().includes(searchTerm) ||
            t.jumlah_tagihan.toString().includes(searchTerm) ||
            t.user?.name.toLowerCase().includes(searchTerm)
        );
    });

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md min-h-screen">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">TAGIHAN LUNAS</h1>

            {/* Filter Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Bulan</label>
                    <select
                        value={selectedBulan}
                        onChange={(e) => setSelectedBulan(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Pilih Bulan</option>
                        {bulanList.map((b) => (
                            <option key={b.value} value={b.value}>
                                {b.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">Tahun</label>
                    <select
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Pilih Tahun</option>
                        {tahunList.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Pencarian</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari data apapun..."
                            className="w-full p-2.5 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={fetchData}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Cari
                    </button>
                    {filteredData.length > 0 && (
                        <button
                            onClick={handleExportExcel}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Excel
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
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan/Tahun</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagihan</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bayar</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerima</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.map((t, i) => (
                                    <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {t.id_pelanggan} - {t.pelanggan.nama}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.pelanggan.alamat || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.id_bulan}/{t.tahun}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Rp {Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                LUNAS
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(t.tgl_bayar).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.user?.name ?? "-"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDownloadStruk(t)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Struk
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="sm:hidden space-y-3">
                        {paginatedData.map((t) => (
                            <div key={t.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{t.pelanggan.nama}</h3>
                                        <p className="text-sm text-gray-500">{t.id_pelanggan}</p>
                                    </div>
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        LUNAS
                                    </span>
                                </div>

                                <div className="mt-2 text-sm">
                                    <div className="flex">
                                        <span className="text-gray-500 w-24">Alamat</span>
                                        <span className="text-gray-700">{t.pelanggan.alamat || '-'}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24">Periode</span>
                                        <span className="text-gray-700">{t.id_bulan}/{t.tahun}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24">Tagihan</span>
                                        <span className="text-gray-700">Rp {Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24">Tanggal</span>
                                        <span className="text-gray-700">{new Date(t.tgl_bayar).toLocaleDateString("id-ID")}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-24">Penerima</span>
                                        <span className="text-gray-700">{t.user?.name ?? "-"}</span>
                                    </div>
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => handleDownloadStruk(t)}
                                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                    >
                                        Unduh Struk
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {filteredData.length > itemsPerPage && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:block text-sm text-gray-700">
                                Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, filteredData.length)}
                                </span>{' '}
                                dari <span className="font-medium">{filteredData.length}</span> hasil
                            </div>
                            <div className="flex-1 flex justify-between sm:justify-end space-x-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}