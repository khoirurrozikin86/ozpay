'use client';
import { useEffect, useState } from 'react';
import { getProduct, updateProduct } from '@/lib/api_product';

interface Props {
    productId: number | null;
    onClose: () => void;
    onUpdated: () => void;
}

export default function EditProductModal({ productId, onClose, onUpdated }: Props) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!productId) return;
        getProduct(productId)
            .then((res) => {
                const p = res.product;
                setName(p.name);
                setPrice(p.price);
                setDescription(p.description || '');
            })
            .catch(() => setError('Gagal memuat data produk.'))
            .finally(() => setLoading(false));
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            setError('Harga harus lebih dari 0');
            return;
        }

        try {
            await updateProduct(productId!, {
                name,
                price: parseFloat(price),
                description,
            });
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui produk.');
        }
    };

    if (!productId) return null;

    return (
        <div className="fixed inset-0 bg-black/30 bg-opacity-100 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Produk</h2>
                {loading ? (
                    <div className="text-gray-500">Memuat data…</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500">{error}</div>}
                        <div>
                            <label className="block text-sm">Nama</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Harga</label>
                            <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm">Deskripsi</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
