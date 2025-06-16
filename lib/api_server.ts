import { api } from "./api"; // ⬅️ pakai dari global

export const getServers = () => api("/servers");
export const createServer = (data: any) => api("/servers", "POST", data);
export const updateServer = (id: number, data: any) => api(`/servers/${id}`, "PUT", data);
export const deleteServer = (id: number) => api(`/servers/${id}`, "DELETE");
