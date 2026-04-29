export type ResponseProductFeatureValue = string | number | boolean;

export interface ResponseProductApi<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ResponseProductStore {
  id?: number;
  name?: string;
  logo?: string;
  banner?: string;
  description?: string;
  location?: string;
}

export interface ResponseProductListing {
  id?: number;
  store?: ResponseProductStore;
  urlAccess?: string;
  percentOff?: number | string;
  percent_off?: number | string;
  priceTotal?: number | string;
  price_total?: number | string;
}

export interface ResponseProductFeature {
  keyword?: string;
  nombre?: string;
  value?: ResponseProductFeatureValue;
  valor?: ResponseProductFeatureValue;
}

export interface ResponseProduct {
  id: number;
  name: string;
  urlAccess?: string;
  imageUrl?: string;
  price?: number | string;
  brand?: { name?: string } | string;
  brandName?: string;
  category?: { name?: string } | string;
  categoryName?: string;
  description?: string;
  features?: ResponseProductFeature[];
  products_details?: ResponseProductFeature[];
  listings?: ResponseProductListing[];
  stock?: number;
  ratings?: number;
  reviews?: number;
  freeShipping?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
