import { Injectable } from '@angular/core';

export interface StoreI {
  id: number;
  name: string;
  logo: string;
  banner: string;
  description: string;
  location: string;
  founded: string;
  websiteUrl: string;
  locationUrl:string;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private stores: StoreI[] = [
    {
      id:1,
      name: 'Frávega',
      logo: 'https://www.producteca.com/wp-content/uploads/2019/10/logo-fravega.png',
      banner: 'assets/banners/fravega-banner.jpg',
      description: 'Frávega es una cadena de electrodomésticos de Argentina.\n\nFue fundada en noviembre de 1910. La empresa inició sus actividades como cadena de artículos para el hogar pero fue migrando con el tiempo al mercado de la venta de electrodomésticos y artículos tecnológicos. En los últimos años ha incursionado en la fabricación de artículos informáticos desde su planta en Tierra del Fuego.',
      location:"Valentín Gómez 2813, Ciudad de Buenos Aires",
      founded:"1 de  noviembre de 1910",
      websiteUrl:"https://www.fravega.com",
      locationUrl:"https://maps.app.goo.gl/GfxFgSy8urCN4cYA7"
    },
    {
      id:2,
      name: 'Megatone',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSizIafuBFg-anhaMGLK9X7NQ8Wt4OGZy5eZg&s',
      banner: 'assets/banners/megatone-banner.jpg',
      description: 'Megatone es una cadena argentina de locales de venta de electrodomésticos, tecnología y bienes durables, con presencia nacional.​ Ofrece a sus clientes la posibilidad de pagar sus compras con variedad de medios de pago, especializándose particularmente en el otorgamiento del crédito propio.',
      location:"Cayetano Santi 1045, Rafaela, Santa Fe",
      founded:"27 de septiembre de 1980",
      websiteUrl:"https://www.megatone.net",
      locationUrl:"https://maps.app.goo.gl/roLf656qiFMaYaHq7"
    },
    {
      id:3,
      name: 'Naldo',
      logo: 'https://cuponesargentina.com.ar/wp-content/uploads/2025/05/logo-naldo.png',
      banner: 'assets/banners/naldo-banner.jpg',
      description: 'Naldo es una destacada cadena argentina de electrodomésticos, tecnología y artículos para el hogar, fundada en 1962 en Junín por Naldo Delfor Lombardi. Con más de 85 sucursales y un fuerte componente de comercio electrónico (premiado como mejor eCommerce en 2024), ofrece financiación, crédito personal y un servicio integral. Se especializa en productos para el hogar, tecnología, y cuenta con garantía extendida propia (Naldo Plus).',
      location:"Alberdi 206, Junín, Provincia de Buenos Aires",
      founded:"19 de noviembre de 1962",
      websiteUrl:"https://www.naldo.com.ar",
      locationUrl:"https://maps.app.goo.gl/GpxPQZMex7mdw1E36"
    },
    {
      id:4,
      name: 'On City',
      logo: 'https://migestion.oncity.com/assets/isotipo_large.png',
      banner: 'assets/banners/oncity-banner.jpg',
      description: 'On City es una cadena de tiendas y marketplace online de Argentina, especializada en la venta de electrodomésticos, artículos de tecnología y productos para el hogar. La marca fue lanzada el 21 de octubre de 2024 como resultado de una reestructuración empresarial.​',
      location:"Ruta Nacional 168 KM 473.6, Santa Fe",
      founded:"21 de octubre de 2024",
      websiteUrl:"https://www.oncity.com",
      locationUrl:"https://maps.app.goo.gl/Q4Tu3aiqCYGRPzWg6"
    },
    {
      id:5,
      name: 'Pardo',
      logo: 'https://http2.mlstatic.com/D_NQ_NP_950425-MLA74959095381_032024-O.webp',
      banner: 'assets/banners/pardo-banner.jpg',
      description: 'Pardo es una cadena argentina líder con más de 50 años en el mercado, dedicada a la venta de electrodomésticos, tecnología, muebles, herramientas y artículos para el hogar. Ofrece financiación en cuotas sin interés, envío a todo el país, y garantía oficial, con un enfoque en equipar hogares.',
      location:"Calle 47 100, Colón, Buenos Aires",
      founded:"9 de diciembre de 1970",
      websiteUrl:"https://www.pardo.com.ar",
      locationUrl:"https://maps.app.goo.gl/W1yWfe8Vzc3YPAZr5"
    }
  ];
  
  constructor() { }

  getStores() {
    return this.stores;
  }

  getStoreByName(name: string): StoreI | undefined {
    return this.stores.find(s => s.name.toLowerCase() === name.toLowerCase());
  }
  
  getStoreById(id: number): StoreI | undefined {
    return this.stores.find(store => store.id === id);
  }
}