// Características por tipo de producto
export interface NotebookCharacteristics {
  processor: string;
  ram: string;
  storage: string;
  screen: string;
  graphics: string;
  battery: string;
  weight: string;
  os: string;
}

export interface TabletCharacteristics {
  processor: string;
  ram: string;
  storage: string;
  screen: string;
  battery: string;
  camera: string;
  os: string;
  connectivity: string;
}

export interface MouseCharacteristics {
  dpi: number;
  buttons: number;
  connectivity: string;
  battery: string;
  weight: string;
  rgb: boolean;
  sensor: string;
  polling: string;
}

export type ProductCharacteristics =
  | NotebookCharacteristics
  | TabletCharacteristics
  | MouseCharacteristics
  | Record<string, string | number | boolean>;

export interface ProductI {
  id: number;
  name: string;
  urlAcces: string;
  price: number;
  brand: string;
  description: string;
  category: string;
  image: string;
  stock?: number;
  offer?: string;
  caracteristics?: ProductCharacteristics;
  ratings?: number;
  reviews?: number;
  createdAt: Date;
  updatedAt: Date;
  storeId?: number;
  storeName?: string;
  freeShipping?: boolean;
}
