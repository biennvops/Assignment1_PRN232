export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image?: string | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}
