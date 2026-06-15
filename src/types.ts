
export interface SalesData {
  orderId: string;
  orderDate: string;
  shipDate: string;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
}

export interface ForecastPoint {
  date: string;
  sales: number;
  confidenceLow?: number;
  confidenceHigh?: number;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  profitMargin: number;
  growthRate: number;
}

export interface Insight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}
