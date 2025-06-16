'use client';
import { Suspense } from 'react';
import { useState } from 'react';
import ProductDataTable from '@/components/products/ProductDataTable';

export default function ProductPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const perPage = 10;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Daftar Produk</h1>

            <Suspense fallback={<div>Loading...</div>}>

                <ProductDataTable
                    page={page}
                    perPage={perPage}
                    search={search}
                    onPageChange={setPage}
                    onSearchChange={setSearch}
                />
            </Suspense>
        </div >
    );
}
