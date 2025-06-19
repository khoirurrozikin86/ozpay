"use client";

import { useState } from "react";
import { getBelumLunasByPelanggan } from "@/lib/api_tagihan";
import { bayarTagihan } from "@/lib/api_tagihan";
import Swal from "sweetalert2";

export default function BayarTagihanPage() {
    // const [idPelanggan, setIdPelanggan] = useState("");
    const [namaPelanggan, setNamaPelanggan] = useState("");
    const [tagihanList, setTagihanList] = useState<any[]>([]);
    const [selectedNo, setSelectedNo] = useState("");
    const [loading, setLoading] = useState(false);

    // const handleCek = async () => {
    //     if (!idPelanggan) return;
    //     setLoading(true);
    //     const res = await getBelumLunasByPelanggan(idPelanggan);
    //     if (res.success) {
    //         setTagihanList(res.data);
    //         setSelectedNo(res.data.length === 1 ? res.data[0].no_tagihan : "");
    //     }
    //     setLoading(false);
    // };

    const handleCek = async () => {
        if (!namaPelanggan) return; // Ensure Nama is provided before proceeding
        setLoading(true);

        const res = await getBelumLunasByPelanggan(namaPelanggan);  // Pass 'nama' as search type
        if (res.success) {
            setTagihanList(res.data);
            setSelectedNo(res.data.length === 1 ? res.data[0].no_tagihan : "");
        }

        setLoading(false);
    };

    const handleBayar = async (no_tagihan?: string) => {
        const tagihanToBayar = no_tagihan || selectedNo;
        if (!tagihanToBayar) return;

        const confirm = await Swal.fire({
            title: "Konfirmasi Pembayaran",
            text: `Apakah kamu yakin ingin membayar tagihan ${tagihanToBayar}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Bayar!",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            const res = await bayarTagihan(tagihanToBayar);
            if (res.success) {
                Swal.fire("Berhasil!", "Tagihan berhasil dibayar.", "success");
                handleCek(); // Refresh daftar tagihan
            } else {
                Swal.fire("Gagal", res.message || "Terjadi kesalahan.", "error");
            }
        }
    };


    const selectedTagihan = tagihanList.find((t) => t.no_tagihan === selectedNo);

    return (
        <div className="p-6 bg-white rounded shadow">
            <h1 className="text-xl font-semibold mb-4">Bayar Tagihan</h1>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Masukkan ID Pelanggan"
                    className="border-2 border-gray-300 focus:border-gray-500 focus:ring-blue-500 px-3 py-2 rounded-lg w-full sm:w-auto focus:outline-none transition-all duration-300"
                    // value={idPelanggan}
                    // onChange={(e) => setIdPelanggan(e.target.value)}
                    value={namaPelanggan}  // Update state to 'namaPelanggan'

                    onChange={(e) => setNamaPelanggan(e.target.value)}  // Update input handling
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleCek(); // Trigger the same logic as clicking the button
                        }
                    }}
                />

                <button
                    onClick={handleCek}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 w-full sm:w-auto mt-4 sm:mt-0 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    Cek Tagihan
                </button>
            </div>


            {loading && <p>Memuat data...</p>}

            {/* Check if tagihan list is empty */}
            {tagihanList.length === 0 && !loading && (
                <p className="text-red-500">Tagihan tidak ditemukan</p> // Show this message when no tagihan is found
            )}


            {tagihanList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tagihanList.map((tagihan) => (
                        <div
                            key={tagihan.no_tagihan}
                            className={`p-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 ${tagihan.pelanggan?.server?.lokasi === "Bandung"
                                ? "bg-green-100"
                                : tagihan.pelanggan?.server?.lokasi === "Jakarta"
                                    ? "bg-red-100"
                                    : "bg-gray-100"
                                }`}
                        >
                            <div className="space-y-1">
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">No Tagihan:</strong>
                                    <span className="w-2/3">{tagihan.no_tagihan}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Lokasi Server:</strong>
                                    {/* Badge for Location */}
                                    <span className="w-2/3">
                                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">
                                            {tagihan.pelanggan?.server?.lokasi || "-"}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">ID :</strong>
                                    <span className="w-2/3">{tagihan.id_pelanggan}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Nama:</strong>
                                    <span className="w-2/3">{tagihan.pelanggan?.nama || "-"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Bulan:</strong>
                                    <span className="w-2/3">{tagihan.id_bulan}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Tahun:</strong>
                                    <span className="w-2/3">{tagihan.tahun}</span>
                                </div>

                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Jumlah:</strong>
                                    <span className="w-2/3">Rp {Number(tagihan.jumlah_tagihan).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2 border-b-black-300">
                                    <strong className="w-1/3">Nama Paket:</strong>
                                    <span className="w-2/3">{tagihan.pelanggan?.paket?.nama || "-"}</span>
                                </div>

                            </div>






                            <button
                                onClick={() => handleBayar(tagihan.no_tagihan)}
                                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all duration-300"
                            >
                                Bayar
                            </button>
                        </div>
                    ))}
                </div>

            )}


        </div>
    );
}
