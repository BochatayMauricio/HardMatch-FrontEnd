export interface ProductI{
    id:number;
    name:string;
    urlAcces: string;
    price:number;
    brand:string;
    description:string;
    category:string;
    image:string;
    stock?:number;
    offer?:string;
    caracteristics?:JSON;
    ratings?:number;
    reviews?:number;
    createdAt:Date;
    updatedAt:Date;
    storeId?:number;
    storeName?:string;
    freeShipping?: boolean;
}