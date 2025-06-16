'use client';
import { useState } from 'react';
import { createProduct } from '@/lib/api_product';

interface AddProductModalProps {
    onClose: () => void;
    onCreated: () => void;
}

export default function AddProductModal({ onClose, onCreated }: AddProductModalProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await createProduct({
                name,
                price: parseFloat(price),
                description,
            });
            onCreated(); // Refresh data table
            onClose();   // Tutup modal
        } catch (err: any) {
            setError(err.message || 'Gagal menambah produk.');
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/30 z-40"></div>

            {/* Modal box */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Tambah Produk</h2>
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
                                rows={3}
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
                                onClick={onClose}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
