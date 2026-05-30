export interface Part {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  description: string | null;
  image: string;
  image2: string | null;
  image3: string | null;
  image4: string | null;
  oemNumber: string;
  brand: string;
  pickup: number;
  deliver: number;
  ship: number;
  createdAt?: Date;
  updatedAt?: Date;
}
