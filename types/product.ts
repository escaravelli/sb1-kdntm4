export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | null;
  images: string[];
  created_at: string;
  updated_at: string;
}