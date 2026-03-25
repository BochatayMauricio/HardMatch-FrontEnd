import { FavoriteI } from './favorite.interface';

export interface ResponseFavoriteList {
  success: boolean;
  count?: number;
  message?: string;
  data: FavoriteI[];
}

export interface ResponseFavoriteOne {
  success: boolean;
  message?: string;
  data: FavoriteI;
}

export interface ResponseFavoriteDelete {
  success: boolean;
  message?: string;
}
