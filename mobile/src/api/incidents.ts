import axios from 'axios';
import { Incident, ApiResponse } from '../types';

// Use your machine's IP address for mobile device testing
// For Android emulator: use 10.0.2.2
// For iOS simulator or physical device: use your actual IP (e.g., 192.168.1.x)
const API_BASE_URL = 'http://127.0.0.1:8000';
const API = `${API_BASE_URL}/api`;

export const getIncidents = () =>
  axios.get<ApiResponse<Incident[]>>(`${API}/incidents`);

export const getIncident = (id: string) =>
  axios.get<ApiResponse<Incident>>(`${API}/incidents/${id}`);

export const createIncident = (data: Partial<Incident>) =>
  axios.post<ApiResponse<Incident>>(`${API}/incidents`, data);

export const updateIncident = (id: string, data: Partial<Incident>) =>
  axios.patch<ApiResponse<Incident>>(`${API}/incidents/${id}`, data);

export const deleteIncident = (id: string) =>
  axios.delete<ApiResponse<void>>(`${API}/incidents/${id}`);

export const verifyIncident = (id: string, verifiedBy: string) =>
  axios.post<ApiResponse<Incident>>(`${API}/incidents/${id}/verify`, { verified_by: verifiedBy });
