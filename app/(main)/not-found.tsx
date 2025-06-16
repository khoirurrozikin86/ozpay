import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-red-600">404 - Tidak Ditemukan</h1>
            <p className="mt-4 text-gray-600">Halaman yang kamu cari tidak tersedia.</p>
            <Link
                href="/"
                className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
