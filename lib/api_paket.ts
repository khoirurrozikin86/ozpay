import { api } from "./api"; // ⬅️ pakai dari global

export const getPakets = () => api("/pakets");
export const createPaket = (data: any) => api("/pakets", "POST", data);
export const updatePaket = (id: number, data: any) => api(`/pakets/${id}`, "PUT", data);
export const deletePaket = (id: number) => api(`/pakets/${id}`, "DELETE");
