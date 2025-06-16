'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, deleteProduct } from '@/lib/api_product';
import Link from 'next/link';
import { FiEdit, FiDelete } from 'react-icons/fi';

export default function ProductListx() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Baca page & search dari URL pada mount
    const initialPage = parseInt(searchParams.get('page') || '1', 10);
    const initialSearch = searchParams.get('search') || '';

    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState(initialSearch);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    // Efek: setiap page/search berubah → update URL + fetch data
    useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (search) params.set('search', search);
        router.replace(`/products?${params.toString()}`);
        fetchProducts();
    }, [page, search]);

    const fetchProducts = async () => {
        try {
            const data = await getProducts(page, perPage, search);
            setProducts(data.data);
            setTotalPages(data.last_page);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        await deleteProduct(id);
        fetchProducts();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Daftar Produk</h1>

            {/* Search & Add */}
            <div className="flex mb-4 space-x-4">
                <input
                    type="text"
                    placeholder="Cari produk..."
                    className="border px-4 py-2 rounded w-full max-w-md"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                <Link href="/products/new" className="bg-blue-500 text-white px-4 py-2 rounded">
                    + Tambah Produk
                </Link>
            </div>

            {/* Table */}
            <table className="w-full table-auto bg-white rounded shadow">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-2">Nama</th>
                        <th className="px-4 py-2">Harga</th>
                        <th className="px-4 py-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-2">{p.name}</td>
                            <td className="px-4 py-2">Rp {parseFloat(p.price).toLocaleString()}</td>
                            <td className="px-4 py-2 flex space-x-2">
                                <Link href={`/products/${p.id}/edit`} className="text-blue-500">
                                    <FiEdit />
                                </Link>
                                <button onClick={() => handleDelete(p.id)} className="text-red-500">
                                    <FiDelete />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>

                <span>
                    Halaman {page} dari {totalPages}
                </span>

                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
