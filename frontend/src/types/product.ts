export type Product = {
  id: string;
  name: string;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
  price: string;
  image_url?: string | null;
  image_path?: string | null;
  original_image_path?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
