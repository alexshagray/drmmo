import axios from 'axios';
import { ApiResponse } from '../types';

// Use your machine's IP address for mobile device testing
// For Android emulator: use 10.0.2.2
// For iOS simulator or physical device: use your actual IP (e.g., 192.168.1.x)
const API_BASE_URL = 'http://127.0.0.1:8000';
const API = `${API_BASE_URL}/api`;

export const submitDispatchRequest = (data: {
  requester_name: string;
  date_time: string;
  category?: string;
  items: { number: string; qty: string; item: string; remarks: string }[];
}) =>
  axios.post<ApiResponse<any>>(`${API}/dispatch-request`, data);

export const getDispatchRequests = () =>
  axios.get<ApiResponse<any>>(`${API}/dispatch-request`);

export const deleteDispatchRequest = (id: number) =>
  axios.delete<ApiResponse<any>>(`${API}/dispatch-request/${id}`);

export const getInventoryItems = () =>
  axios.get<ApiResponse<any>>(`${API}/inventory`);

export const getInventory = () =>
  axios.get<ApiResponse<any>>(`${API}/inventory`);

export const updateInventoryItem = (id: number, data: {
  item_name?: string;
  category?: string;
  stock_quantity?: number;
  reorder_level?: number;
  location_bin?: string;
  condition?: string;
}) =>
  axios.put<ApiResponse<any>>(`${API}/inventory/${id}`, data);

export const createInventoryItem = (data: {
  item_name: string;
  category: string;
  stock_quantity: number;
  reorder_level: number;
  location_bin?: string;
  condition?: string;
}) =>
  axios.post<ApiResponse<any>>(`${API}/inventory`, data);

export const getNotifications = () =>
  axios.get<ApiResponse<any>>(`${API}/notifications`);

export const createNotification = (data: {
  type: 'stock_alert' | 'return_item';
  title: string;
  message: string;
  user_id?: number | string;
  data?: any;
}) =>
  axios.post<ApiResponse<any>>(`${API}/notifications`, data);
