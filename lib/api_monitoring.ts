import { api } from './api';  // Import your existing generic API function

// Function to get monitoring data for a specific server (id)
export const getMonitoring = (id: number) => api(`/monitoring/${id}`);