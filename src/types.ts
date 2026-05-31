export interface Robot {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  strategy: string;
  pairs: string[];
  timeframe: string;
  win_rate: number;
  drawdown: number;
  specs: string[];
  in_stock: boolean;
  featured: boolean;
  file_name: string;
  file_size: number;
  version: string;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  mt_account: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'completed' | 'failed' | 'cancelled';
  payment_reference: string;
  download_token: string;
  created_at: string;
  paid_at?: string;
  delivered_at?: string;
}

export interface AdminSettings {
  paymentPageUrl: string;
  webhookSecret: string;
  webhookUrl: string;
  redirectUrl: string;
  merchantName: string;
  currency: string;
  webhookServerUrl: string;
}
