"use client";

import { useState, useEffect } from "react";
import { getPenghasilanByTanggal } from "@/lib/api_tagihan";
import * as XLSX from "xlsx";

export default function PenghasilanPage() {
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    const [tanggal, setTanggal] = useState(today);
    const [result, setResult] = useState<{ data: any[]; summary: any } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!tanggal) return;
        setLoading(true);
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

    const tagihanLunas = result?.data?.filter((t) => t.status === "lunas") || [];

    const handleExportExcel = () => {
        if (!result || !result.data) return;

        const excelData = tagihanLunas.map((t: any, i: number) => ({
            No: i + 1,
            "No Tagihan": t.no_tagihan,
            "ID Pelanggan": t.id_pelanggan,
            "Nama Pelanggan": t.pelanggan?.nama || "-",
            "Jumlah Tagihan": t.jumlah_tagihan,
            "Tanggal Bayar": t.tgl_bayar
                ? new Date(t.tgl_bayar).toLocaleDateString("id-ID")
                : "-",
            Penerima: t.user?.name || "-",
            "ID Bulan": t.id_bulan,
            Tahun: t.tahun,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
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
                    {loading ? "Cek Penghasilan" : "Cek Penghasilan"}
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
                                Rp {Number(result.summary.total_lunas || 0).toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                Jumlah Pembayaran: {result.summary.count_lunas} transaksi
                            </p>
                        </div>
                    </div>

                    {/* Tagihan Lunas Section */}
                    {tagihanLunas.length > 0 && (
                        <>
                            <div className="mt-8 flex justify-end">
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
                                            <th className="border px-2 py-1">Jumlah</th>
                                            <th className="border px-2 py-1">Tanggal Bayar</th>
                                            <th className="border px-2 py-1">Penerima</th>
                                            <th className="border px-2 py-1">ID Bulan</th>
                                            <th className="border px-2 py-1">Tahun</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tagihanLunas.map((t, i) => (
                                            <tr key={t.id}>
                                                <td className="border px-2 py-1">{i + 1}</td>
                                                <td className="border px-2 py-1">{t.no_tagihan}</td>
                                                <td className="border px-2 py-1">{t.pelanggan?.nama}</td>
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
                                {tagihanLunas.map((t) => (
                                    <div
                                        key={t.id}
                                        className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-4 flex flex-col"
                                    >
                                        <h3 className="text-xl font-bold mb-2">{t.pelanggan?.nama}</h3>
                                        <div className="text-sm text-gray-200 mb-2">Bulan/Tahun: {t.id_bulan}/{t.tahun}</div>
                                        <div className="text-lg font-semibold mb-3">
                                            Rp {Number(t.jumlah_tagihan).toLocaleString("id-ID")}
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Lunas</span>
                                            <span className="text-sm">
                                                {new Date(t.tgl_bayar).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>

    );
}
