export interface Income {
  id: string;
  date: string;
  customer: string;
  vehicle: string;
  liters: number;
  rate_per_liter: number;
  amount: number;
  tank: string;
  payment_status: 'Paid' | 'Partial' | 'Unpaid';
  reference: string;
}

export interface Expense {
  id: string;
  dc_no: string;
  date: string;
  category: string;
  party: string;
  vehicle: string;
  amount: number;
  liters?: number;
  fillerName?: string;
  notes: string;
  attachment_url: string | null;
}

export interface Stock {
  tank_id: string;
  product: string;
  capacity_liters: number;
  current_liters: number;
  last_refill_date: string;
}

export interface Payment {
  payment_id: string;
  related_txn: string;
  date: string;
  method: string;
  amount: number;
  status: 'Confirmed' | 'Pending';
}

export interface User {
  name: string;
  role: 'Admin' | 'Accountant' | 'Clerk' | 'Viewer';
  avatarUrl: string;
}