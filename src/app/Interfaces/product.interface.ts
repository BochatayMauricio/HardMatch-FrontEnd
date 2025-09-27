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
    createdAt:Date;
    updatedAt:Date;
}