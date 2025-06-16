import { api } from "./api"; // gunakan fungsi api global

export const getTagihan = () => api("/tagihan");
export const createTagihan = (data: any) => api("/tagihan", "POST", data);
export const updateTagihan = (id: number, data: any) => api(`/tagihan/${id}`, "PUT", data);
export const deleteTagihan = (id: number) => api(`/tagihan/${id}`, "DELETE");

export const createTagihanMassal = (data: any) => api("/tagihan/buat-massal", "POST", data);
export const getTagihanByBulanTahun = (id_bulan: string, tahun: string) =>
    api(`/tagihan/filter?id_bulan=${id_bulan}&tahun=${tahun}`);

export const getTagihanLunasByBulanTahun = (bulan: string, tahun: string) =>
    api(`/tagihan/lunas?bulan=${bulan}&tahun=${tahun}`);

export const getTagihanBelumLunas = () =>
    api("/tagihan/belum-lunas");

export const getPenghasilanByTanggal = (tanggal: string, search = "") =>
    api(`/penghasilan?tanggal=${tanggal}&search=${search}`);

// export const getBelumLunasByPelanggan = (id_pelanggan: string) =>
//     api(`/tagihan/belum-lunas/${id_pelanggan}`);


export const getBelumLunasByPelanggan = (searchValue: string) => {
    // Construct the API endpoint to search by Name only
    const endpoint = `/tagihan/belum-lunas-pelanggan?nama=${searchValue}`;  // Searching by Name

    return api(endpoint);
};


export const bayarTagihan = (no_tagihan: string) =>
    api("/tagihan/bayar", "POST", { no_tagihan });

