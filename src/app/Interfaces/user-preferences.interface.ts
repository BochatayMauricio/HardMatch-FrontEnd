
export type ProductCategory =
  | 'notebooks'
  | 'tablets'
  | 'smartphones'
  | 'monitores'
  | 'teclados'
  | 'mouses'
  | 'auriculares'
  | 'almacenamiento'
  | 'componentes';

export type HardwareBrand =
  | 'Apple'
  | 'Samsung'
  | 'Lenovo'
  | 'HP'
  | 'Dell'
  | 'ASUS'
  | 'Acer'
  | 'MSI'
  | 'Logitech'
  | 'Razer'
  | 'Corsair'
  | 'HyperX'
  | 'Intel'
  | 'AMD'
  | 'NVIDIA';

export type MatchingPriority =
  | 'precio'
  | 'rendimiento'
  | 'calidad'
  | 'marca'
  | 'garantia'
  | 'disponibilidad';

export type AlertFrequency = 'inmediato' | 'diario' | 'semanal' | 'nunca';

export type UsageType =
  | 'gaming'
  | 'trabajo'
  | 'estudio'
  | 'multimedia'
  | 'diseño'
  | 'programacion';

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export interface MatchingAlerts {
  priceDropAlert: boolean;
  newMatchAlert: boolean;
  stockAlert: boolean;
  dealAlert: boolean;
  alertFrequency: AlertFrequency;
}

export interface UserMatchingPreferences {
  id?: number;
  userId: number;

  selectedCategories: ProductCategory[];
  usageTypes: UsageType[];

  priceRange: PriceRange;
  flexibleBudget: boolean;

  preferredBrands: HardwareBrand[];
  excludedBrands: HardwareBrand[];
  openToNewBrands: boolean;

  priorities: MatchingPriority[];

  alerts: MatchingAlerts;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_MATCHING_PREFERENCES: Omit<
  UserMatchingPreferences,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  selectedCategories: [],
  usageTypes: [],
  priceRange: {
    minPrice: 0,
    maxPrice: 500000,
  },
  flexibleBudget: true,
  preferredBrands: [],
  excludedBrands: [],
  openToNewBrands: true,
  priorities: ['precio', 'calidad', 'rendimiento'],
  alerts: {
    priceDropAlert: true,
    newMatchAlert: true,
    stockAlert: false,
    dealAlert: true,
    alertFrequency: 'diario',
  },
};

export const MATCHING_OPTIONS = {
  categories: [
    { value: 'notebooks', label: 'Notebooks', icon: 'laptop' },
    { value: 'tablets', label: 'Tablets', icon: 'tablet' },
    { value: 'smartphones', label: 'Smartphones', icon: 'smartphone' },
    { value: 'monitores', label: 'Monitores', icon: 'monitor' },
    { value: 'teclados', label: 'Teclados', icon: 'keyboard' },
    { value: 'mouses', label: 'Mouses', icon: 'mouse' },
    { value: 'auriculares', label: 'Auriculares', icon: 'headphones' },
    { value: 'almacenamiento', label: 'Almacenamiento', icon: 'hard-drive' },
    { value: 'componentes', label: 'Componentes', icon: 'cpu' },
  ] as const,

  usageTypes: [
    {
      value: 'gaming',
      label: 'Gaming',
      description: 'Juegos y entretenimiento',
      icon: '🎮',
    },
    {
      value: 'trabajo',
      label: 'Trabajo',
      description: 'Productividad y oficina',
      icon: '💼',
    },
    {
      value: 'estudio',
      label: 'Estudio',
      description: 'Educación y aprendizaje',
      icon: '📚',
    },
    {
      value: 'multimedia',
      label: 'Multimedia',
      description: 'Videos, música y streaming',
      icon: '🎬',
    },
    {
      value: 'diseño',
      label: 'Diseño',
      description: 'Gráficos y edición',
      icon: '🎨',
    },
    {
      value: 'programacion',
      label: 'Programación',
      description: 'Desarrollo de software',
      icon: '💻',
    },
  ] as const,

  brands: [
    { value: 'Apple', logo: 'apple.svg' },
    { value: 'Samsung', logo: 'samsung.svg' },
    { value: 'Lenovo', logo: 'lenovo.svg' },
    { value: 'HP', logo: 'hp.svg' },
    { value: 'Dell', logo: 'dell.svg' },
    { value: 'ASUS', logo: 'asus.svg' },
    { value: 'Acer', logo: 'acer.svg' },
    { value: 'MSI', logo: 'msi.svg' },
    { value: 'Logitech', logo: 'logitech.svg' },
    { value: 'Razer', logo: 'razer.svg' },
    { value: 'Corsair', logo: 'corsair.svg' },
    { value: 'HyperX', logo: 'hyperx.svg' },
    { value: 'Intel', logo: 'intel.svg' },
    { value: 'AMD', logo: 'amd.svg' },
    { value: 'NVIDIA', logo: 'nvidia.svg' },
  ] as const,

  priorities: [
    {
      value: 'precio',
      label: 'Precio',
      description: 'Buscar el mejor precio posible',
      icon: '💰',
    },
    {
      value: 'rendimiento',
      label: 'Rendimiento',
      description: 'Máxima potencia y velocidad',
      icon: '⚡',
    },
    {
      value: 'calidad',
      label: 'Calidad',
      description: 'Durabilidad y materiales premium',
      icon: '✨',
    },
    {
      value: 'marca',
      label: 'Marca',
      description: 'Reconocimiento y prestigio',
      icon: '🏆',
    },
    {
      value: 'garantia',
      label: 'Garantía',
      description: 'Mejor cobertura post-venta',
      icon: '🛡️',
    },
    {
      value: 'disponibilidad',
      label: 'Disponibilidad',
      description: 'Entrega rápida y stock',
      icon: '📦',
    },
  ] as const,

  alertFrequencies: [
    {
      value: 'inmediato',
      label: 'Inmediato',
      description: 'Tan pronto como haya un match',
    },
    { value: 'diario', label: 'Diario', description: 'Un resumen cada día' },
    {
      value: 'semanal',
      label: 'Semanal',
      description: 'Un resumen cada semana',
    },
    { value: 'nunca', label: 'Nunca', description: 'No recibir alertas' },
  ] as const,
};

