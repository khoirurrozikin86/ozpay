'use client';
import React from 'react';

interface DeleteProductModalProps {
    productId: number;
    productName: string;
    onClose: () => void;
    onDelete: (id: number) => void;
}

export default function DeleteProductModal({
    productId,
    productName,
    onClose,
    onDelete,
}: DeleteProductModalProps) {
    const handleConfirm = () => {
        onDelete(productId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">Hapus Produk</h2>
                <p className="mb-6">
                    Apakah Anda yakin ingin menghapus produk <strong>{productName}</strong>?
                    Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
}
