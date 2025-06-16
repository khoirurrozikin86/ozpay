"use client";

import { useEffect, useState } from "react";
import { getTagihanByBulanTahun, updateTagihan } from "@/lib/api_tagihan";
import Swal from "sweetalert2";
import { FaWhatsapp } from "react-icons/fa";
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
    const [selectedBulan, setSelectedBulan] = useState("");
    const [selectedTahun, setSelectedTahun] = useState("");
    const [filtered, setFiltered] = useState<Tagihan[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(false);

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
            "Jumlah Tagihan": t.jumlah_tagihan,
            Lokasi: t.lokasi || "-",
            Status: t.status === "lunas" ? "Lunas" : "Belum Bayar"
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tagihan");
        XLSX.writeFile(workbook, `Data_Tagihan_${selectedBulan}_${selectedTahun}.xlsx`);
    };

    const handleLihat = async () => {
        if (!selectedBulan || !selectedTahun) return;
        setLoading(true);
        const res = await getTagihanByBulanTahun(selectedBulan, selectedTahun);
        if (res.success) {
            setFiltered(res.data);
            if (res.data.length === 0) {
                Swal.fire("Kosong", "Tidak ada data tagihan untuk bulan dan tahun ini.", "info");
            }
        }
        setLoading(false);
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
        const res = await updateTagihan(id, { status: "lunas", tgl_bayar: new Date() });
        if (res.success) {
            Swal.fire("Berhasil", "Tagihan ditandai sebagai lunas.", "success");
            handleLihat();
        } else {
            Swal.fire("Gagal", res.message || "Terjadi kesalahan.", "error");
        }
    };

    const handleWhatsApp = (nama: string, tagihan: number, no_hp: string, bulan: string, tahun: string, no_tagihan: string, status: string, lokasi?: string) => {
        const nomor = no_hp.replace(/^0/, "62");
        const statusLabel = status === "lunas" ? "✅ *Lunas*" : "❗ *Belum Bayar*";
        const pesan = `Assalamu'alaikum, ${nama}.
\n🧾 *No. Tagihan:* ${no_tagihan}
📅 *Periode:* ${bulan} ${tahun}
📍 *Lokasi :* ${lokasi || "-"}
💰 *Jumlah Tagihan:* Rp${Number(tagihan).toLocaleString('id-ID')}
📌 *Status:* ${statusLabel}
\nSilakan melakukan pembayaran sebelum akhir bulan.\n\nTerima kasih 🙏`;
        window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(pesan.trim())}`, "_blank");
    };

    const filteredData = filtered.filter((t) =>
        t.nama.toLowerCase().includes(search.toLowerCase()) ||
        t.id_pelanggan.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="p-1">
            <div className="bg-white rounded-xl shadow p-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
                    <div>
                        <label className="text-sm block mb-1">Bulan</label>
                        <select
                            value={selectedBulan}
                            onChange={(e) => setSelectedBulan(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">-- Pilih Bulan --</option>
                            {bulanList.map((b) => (
                                <option key={b.id_bulan} value={b.id_bulan}>{b.id_bulan} - {b.bulan}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm block mb-1">Tahun</label>
                        <select
                            value={selectedTahun}
                            onChange={(e) => setSelectedTahun(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">-- Pilih Tahun --</option>
                            {tahunList.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleLihat}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded"
                            disabled={loading}
                        >
                            {loading ? "Memuat..." : "Lihat"}
                        </button>
                    </div>
                </div>
            </div>

            {paginatedData.length > 0 && (
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
                        <h3 className="text-md font-semibold text-gray-700">
                            Data Tagihan Bulan: {selectedBulan} - Tahun: {selectedTahun}
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-2 w- sm:w-auto">
                            <button
                                onClick={handleExportExcel}
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                            > Export Excel</button>
                            <input
                                type="text"
                                placeholder="Cari nama atau ID pelanggan"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border border-gray-300 p-2 rounded w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-[11px] sm:text-xs md:text-sm text-left text-gray-700 min-w-full sm:min-w-[640px]">

                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2  ">No</th>
                                    <th className="px-2 py-2  ">ID plg</th>
                                    <th className="px-2 py-2  ">Nama</th>
                                    <th className="px-2 py-2  ">Tagihan</th>
                                    <th className="px-2 py-2  ">Lokasi</th>
                                    <th className="px-2 py-2  ">Status</th>
                                    <th className="px-2 py-2  ">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((t, i) => (
                                    <tr key={t.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-1 py-1  ">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                                        <td className="px-1 py-1   whitespace-nowrap">{t.id_pelanggan}</td>
                                        <td className="px-1 py-1   truncate max-w-[120px] md:max-w-[160px]">{t.nama}</td>
                                        <td className="px-1 py-1  "> Rp {Number(t.jumlah_tagihan || 0).toLocaleString("id-ID")}</td>
                                        <td className="px-1 py-1  ">{t.lokasi || "-"}</td>
                                        <td className="px-1 py-1  ">
                                            <span className={`px-1 py-1 rounded text-white text-xs ${t.status === "lunas" ? "bg-green-500" : "bg-red-500"}`}>
                                                {t.status === "lunas" ? "LUNAS" : "BL"}
                                            </span>
                                        </td>
                                        <td className="px-1 py-1 md:px-4 md:py-2 ">

                                            <button
                                                onClick={() => handleBayar(t.id)}
                                                className="bg-sky-500 text-white px-1 py-1 rounded text-xs"
                                                disabled={t.status === "lunas"}
                                            >✔ Pay</button>
                                            <button
                                                onClick={() => handleWhatsApp(t.nama, t.jumlah_tagihan, t.no_hp, selectedBulan, selectedTahun, t.no_tagihan, t.status, t.lokasi)}
                                                className="bg-green-100 text-green-600 px-1 py-1 rounded text-xs  border-green-300 flex items-center gap-1"
                                            >
                                                <FaWhatsapp className="text-green-600" /> WA
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-2 text-sm text-gray-600">
                        <div>
                            Menampilkan {paginatedData.length} dari {filteredData.length} entri
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnya</button>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Berikutnya</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}