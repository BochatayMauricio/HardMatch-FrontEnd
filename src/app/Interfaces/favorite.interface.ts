export interface FavoriteI {
  id?: number;
  quantity: number;
  idUser: number;
  idProduct: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
