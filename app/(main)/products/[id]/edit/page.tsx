'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { getProduct, updateProduct } from '@/lib/api_product';

export default function EditProductPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Ambil parameter page dan search dari URL
    const currentPage = searchParams.get('page') || '1';
    const currentSearch = searchParams.get('search') || '';

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        getProduct(Number(id))
            .then((res) => {
                const p = res.product;
                setName(p.name);
                setPrice(p.price);
                setDescription(p.description || '');
            })
            .catch(() => {
                setError('Gagal memuat data produk.');
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // Perbarui produk
            await updateProduct(Number(id), {
                name,
                price: parseFloat(price),
                description,
            });

            // Redirect kembali ke halaman produk yang sama (page dan search tetap sama)
            const params = new URLSearchParams();
            if (currentPage !== '1') params.set('page', currentPage);  // Tetap di halaman yang sama
            if (currentSearch) params.set('search', currentSearch);  // Tetap dengan query pencarian

            // Gunakan router.push untuk mengarahkan dengan parameter yang benar
            router.push(`/products?${params.toString()}`);  // Gunakan push untuk pastikan tetap berada di halaman yang sesuai
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui produk.');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Edit Produk</h1>
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
                        Update
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()} // Tombol batal
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    );
}
