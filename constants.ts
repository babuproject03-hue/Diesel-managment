import type { Income, Expense, Stock, Payment } from './types';

export const DUMMY_INCOME_DATA: Income[] = [
  { "id": "inc_1001", "date": "2025-10-27", "customer": "ABC Transport", "vehicle": "KA01AB1234", "liters": 250.5, "rate_per_liter": 95.0, "amount": 23897.5, "tank": "Tank A", "payment_status": "Paid", "reference": "INV-2025-1001" },
  { "id": "inc_1002", "date": "2025-10-27", "customer": "Express Logistics", "vehicle": "TN05CD5678", "liters": 400.0, "rate_per_liter": 95.5, "amount": 38200.0, "tank": "Tank B", "payment_status": "Unpaid", "reference": "INV-2025-1002" },
  { "id": "inc_1003", "date": "2025-10-26", "customer": "City Movers", "vehicle": "MH12EF9012", "liters": 150.0, "rate_per_liter": 94.75, "amount": 14212.5, "tank": "Tank A", "payment_status": "Paid", "reference": "INV-2025-1003" },
  { "id": "inc_1004", "date": "2025-10-25", "customer": "ABC Transport", "vehicle": "KA01AB1234", "liters": 300.0, "rate_per_liter": 95.0, "amount": 28500.0, "tank": "Tank B", "payment_status": "Partial", "reference": "INV-2025-1004" },
  { "id": "inc_1005", "date": "2025-10-24", "customer": "Green Earth Farm", "vehicle": "PB08GH3456", "liters": 500.0, "rate_per_liter": 96.0, "amount": 48000.0, "tank": "Tank C", "payment_status": "Paid", "reference": "INV-2025-1005" }
];

export const DUMMY_EXPENSE_DATA: Expense[] = [
  { "id": "exp_2001", "dc_no": "DC-2025-2001", "date": "2025-10-26", "category": "Maintenance", "party": "AutoCare Pvt Ltd", "vehicle": "KA01AB1234", "amount": 5200, "liters": 0, "fillerName": "N/A", "notes": "Pump replacement", "attachment_url": null },
  { "id": "exp_2002", "dc_no": "DC-2025-2002", "date": "2025-10-25", "category": "Fuel Purchase", "party": "National Oil Corp", "vehicle": "TN05CD5678", "amount": 450000, "liters": 10000, "fillerName": "S. Kumar", "notes": "10000L Diesel", "attachment_url": "https://example.com/invoice.pdf" },
  { "id": "exp_2003", "dc_no": "DC-2025-2003", "date": "2025-10-24", "category": "Utilities", "party": "City Power", "vehicle": "MH12EF9012", "amount": 12500, "liters": 0, "fillerName": "N/A", "notes": "Electricity Bill", "attachment_url": null },
  { "id": "exp_2004", "dc_no": "DC-2025-2004", "date": "2025-10-22", "category": "Salaries", "party": "N/A", "vehicle": "N/A", "amount": 85000, "liters": 0, "fillerName": "N/A", "notes": "October Salaries", "attachment_url": null }
];

export const DUMMY_STOCK_DATA: Stock[] = [
  { "tank_id": "tank_a", "product": "Diesel", "capacity_liters": 10000, "current_liters": 4875.5, "last_refill_date": "2025-10-20" },
  { "tank_id": "tank_b", "product": "Diesel", "capacity_liters": 10000, "current_liters": 8210.0, "last_refill_date": "2025-10-22" },
  { "tank_id": "tank_c", "product": "Premium Diesel", "capacity_liters": 5000, "current_liters": 1200.0, "last_refill_date": "2025-10-18" }
];

export const DUMMY_PAYMENT_DATA: Payment[] = [
    { "payment_id": "pay_3001", "related_txn": "inc_1001", "date": "2025-10-27", "method": "Bank Transfer", "amount": 23897.5, "status": "Confirmed" },
    { "payment_id": "pay_3002", "related_txn": "inc_1003", "date": "2025-10-26", "method": "Cash", "amount": 14212.5, "status": "Confirmed" },
    { "payment_id": "pay_3003", "related_txn": "inc_1004", "date": "2025-10-25", "method": "Credit Card", "amount": 15000.0, "status": "Confirmed" },
    { "payment_id": "pay_3004", "related_txn": "inc_1005", "date": "2025-10-24", "method": "Bank Transfer", "amount": 48000.0, "status": "Confirmed" },
    { "payment_id": "pay_3005", "related_txn": "inc_1002", "date": "2025-10-28", "method": "Cheque", "amount": 38200.0, "status": "Pending" },
];

export const DUMMY_PARTIES: string[] = [
    "ABC Transport",
    "Express Logistics",
    "City Movers",
    "Green Earth Farm",
    "National Oil Corp",
    "AutoCare Pvt Ltd",
    "City Power"
];

export const DUMMY_VEHICLES: string[] = [
    "KA01AB1234",
    "TN05CD5678",
    "MH12EF9012",
    "PB08GH3456",
    "GJ03KL7890"
];

export const DUMMY_CUSTOMERS: string[] = Array.from(new Set(DUMMY_INCOME_DATA.map(i => i.customer)));
export const DUMMY_EXPENSE_PARTIES: string[] = Array.from(new Set(DUMMY_EXPENSE_DATA.map(e => e.party).filter(p => p !== 'N/A')));
export const DUMMY_EXPENSE_VEHICLES: string[] = Array.from(new Set(DUMMY_EXPENSE_DATA.map(e => e.vehicle).filter(v => v !== 'N/A')));


export const DUMMY_TANKS: string[] = DUMMY_STOCK_DATA.map(s => s.tank_id.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()));