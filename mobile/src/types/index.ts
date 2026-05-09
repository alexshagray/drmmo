export interface Incident {
  id: string;
  responder_id?: number;
  title?: string;
  age?: string;
  gender?: string;
  civil_status?: string;
  contact_number?: string;
  location?: string;
  location_name?: string;
  call_information?: string;
  description?: string;
  status: 'active' | 'resolved' | 'pending' | 'cancelled';
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  latitude?: number;
  longitude?: number;
  responders?: string;
  received_by?: string;
  created_at: string;
  patients_count?: number;
  dispatches_count?: number;
  reported_at?: string;
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface InventoryItem {
  item_id: number;
  item_name: string;
  category: string;
  stock_quantity: number;
  unit_measure: string;
  reorder_level: number;
  location_bin: string;
  status: 'In Stock' | 'Out of Stock' | 'Under Maintenance';
  condition?: 'new' | 'excellent' | 'good' | 'poor';
  created_at?: string;
  updated_at?: string;
}

export interface DispatchItem {
  id?: number;
  requester_name: string;
  date_time: string;
  items: DispatchRequestItem[];
  status?: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface DispatchRequestItem {
  id?: number;
  number: string;
  qty: number;
  item: string;
  remarks: string;
}

export interface HazardZone {
  hazard_id: number;
  zone_name: string;
  risk_category: string;
  severity_score: number;
  boundary_coordinates?: Record<string, unknown>;
  identified_by_staff_id?: number;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainedPersonnel {
  personnel_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  certification_name?: string;
  license_number?: string;
  training_date?: string;
  expiry_date?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
