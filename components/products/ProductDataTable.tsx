'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable, { TableColumn } from 'react-data-table-component';
import { getProducts, deleteProduct } from '@/lib/api_product';
import Link from 'next/link';
import { FiEdit, FiDelete } from 'react-icons/fi';
import EditProductModal from '@/components/products/modal/EditProductModal'; // sesuaikan path
import AddProductModal from '@/components/products/modal/AddProductModal';
import DeleteProductModal from '@/components/products/modal/DeleteProductModal';

interface Product {
    id: number;
    name: string;
    price: string;
    description?: string;
}

interface Props {
    page: number;
    perPage: number;
    search: string;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
}

export default function ProductDataTable({
    page,
    perPage,
    search,
    onPageChange,
    onSearchChange,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<Product[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pending, setPending] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteName, setDeleteName] = useState<string>('');


    useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (search) params.set('search', search);
        router.replace(`/products?${params.toString()}`, { scroll: false });
        fetchData(page, perPage, search);
    }, [page, perPage, search]);

    const fetchData = async (page: number, per_page: number, search: string) => {
        setPending(true);
        try {
            const res = await getProducts(page, per_page, search);
            setData(res.data);
            setTotalRows(res.total);
        } finally {
            setPending(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        onPageChange(newPage);
    };

    const handlePerRowsChange = (newPerPage: number) => {
        onPageChange(1); // reset ke halaman 1 saat ubah perPage
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
        onPageChange(1);
    };

    const openDeleteModal = (id: number, name: string) => {
        setDeleteId(id);
        setDeleteName(name);
    };


    const columns: TableColumn<Product>[] = [
        {
            name: 'Nama',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Harga',
            selector: row => parseFloat(row.price).toLocaleString(),
            sortable: true,
            right: true,
        },
        {
            name: 'Aksi',
            cell: row => (
                <div className="flex space-x-2">
                    <button onClick={() => setEditId(row.id)}>
                        <FiEdit className="text-blue-500 cursor-pointer" />
                    </button>
                    <button onClick={() => openDeleteModal(row.id, row.name)}>
                        <FiDelete className="text-red-500 cursor-pointer" />
                    </button>

                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Cari produk..."
                    className="border px-4 py-2 rounded w-1/3"
                    value={search}
                    onChange={handleSearch}
                />
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    + Tambah Produk
                </button>

            </div>

            <DataTable
                columns={columns}
                data={data}
                progressPending={pending}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationDefaultPage={page}
                paginationPerPage={perPage}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                progressComponent={
                    <div className="py-20 text-center text-gray-500">
                        Loading…
                    </div>
                }
            />

            {/* Tambahkan ini di sini */}
            {editId !== null && (
                <EditProductModal
                    productId={editId}
                    onClose={() => setEditId(null)}
                    onUpdated={() => fetchData(page, perPage, search)}
                />
            )}
            {showAddModal && (
                <AddProductModal
                    onClose={() => setShowAddModal(false)}
                    onCreated={() => {
                        fetchData(page, perPage, search);
                        setShowAddModal(false);
                    }}
                />
            )}

            {deleteId !== null && (
                <DeleteProductModal
                    productId={deleteId}
                    productName={deleteName}
                    onClose={() => setDeleteId(null)}
                    onDelete={async (id) => {
                        await deleteProduct(id);
                        fetchData(page, perPage, search);
                    }}
                />
            )}


        </div>
    );
}
