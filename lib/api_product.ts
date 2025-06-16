import { api } from "./api"; // ⬅️ pakai dari global

export const getProducts = (
    page = 1,
    perPage = 10,
    search = ''
) => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });
    if (search) params.append('search', search);
    return api(`/products?${params.toString()}`);
};

export const getProduct = (id: number): Promise<any> =>
    api(`/products/${id}`);

/**
 * Create a new product
 */
export const createProduct = (product: {
    name: string;
    price: number;
    description?: string;
}): Promise<any> =>
    api('/products', 'POST', product);

/**
 * Update an existing product by ID
 */
export const updateProduct = (
    id: number,
    product: {
        name: string;
        price: number;
        description?: string;
    }
): Promise<any> =>
    api(`/products/${id}`, 'PUT', product);

/**
 * Delete a product by ID
 */
export const deleteProduct = (id: number): Promise<any> =>
    api(`/products/${id}`, 'DELETE');
