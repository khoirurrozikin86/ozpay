'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import { createProduct } from '@/lib/api_product';
import { useRouter, useSearchParams } from 'next/navigation';


function NewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Ambil page & search dari URL agar saat redirect kita kembalikan ke halaman sebelumnya
    const currentPage = searchParams.get('page') || '1';
    const currentSearch = searchParams.get('search') || '';

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await createProduct({ name, price: parseFloat(price), description });
            // Setelah sukses, redirect ke daftar produk dengan query yang sama
            const params = new URLSearchParams();
            if (currentPage !== '1') params.set('page', currentPage);
            if (currentSearch) params.set('search', currentSearch);
            router.push(`/products?${params.toString()}`);
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan produk');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Tambah Produk Baru</h1>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Nama Produk</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Harga</label>
                    <input
                        type="number"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Deskripsi</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows={4}
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Simpan
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}


// Bungkus komponen dengan Suspense
export default function SuspenseWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NewProductPage />
        </Suspense>
    );
}