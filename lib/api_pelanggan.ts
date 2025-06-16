import { api } from "./api"; // ⬅️ pakai dari global

export const getPelanggan = () => api("/pelanggan");
export const getPelangganfull = () => api("/pelanggan/indexfull");
export const createPelanggan = (data: any) => api("/pelanggan", "POST", data);
export const updatePelanggan = (id: number, data: any) => api(`/pelanggan/${id}`, "PUT", data);
export const deletePelanggan = (id: number) => api(`/pelanggan/${id}`, "DELETE");
export const getPelangganUntukTagihan = () => api("/pelanggan/untuk-tagihan");
