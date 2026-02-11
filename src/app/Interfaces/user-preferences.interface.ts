/**
 * Interfaz de Preferencias de Matching del Usuario
 *
 * Esta interfaz define las preferencias que el usuario configura para
 * recibir recomendaciones personalizadas de productos de hardware.
 *
 * Backend: Estas preferencias serán almacenadas en la tabla `user_preferences`
 * relacionada con el usuario mediante `userId`.
 */

// Categorías de productos disponibles en la plataforma
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

// Marcas de hardware disponibles
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

// Prioridades al elegir un producto
export type MatchingPriority =
  | 'precio'
  | 'rendimiento'
  | 'calidad'
  | 'marca'
  | 'garantia'
  | 'disponibilidad';

// Frecuencia de alertas de ofertas/matches
export type AlertFrequency = 'inmediato' | 'diario' | 'semanal' | 'nunca';

// Tipo de uso principal del hardware
export type UsageType =
  | 'gaming'
  | 'trabajo'
  | 'estudio'
  | 'multimedia'
  | 'diseño'
  | 'programacion';

/**
 * Configuración de rango de precios
 * @minPrice: Precio mínimo en la moneda local
 * @maxPrice: Precio máximo en la moneda local
 */
export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

/**
 * Configuración de alertas y notificaciones de matching
 */
export interface MatchingAlerts {
  priceDropAlert: boolean; // Alerta cuando baja el precio de un producto seguido
  newMatchAlert: boolean; // Alerta cuando hay un nuevo producto que hace match
  stockAlert: boolean; // Alerta cuando vuelve a haber stock
  dealAlert: boolean; // Alerta de ofertas especiales
  alertFrequency: AlertFrequency; // Con qué frecuencia recibir alertas
}

/**
 * Preferencias principales de matching del usuario
 *
 * IMPORTANTE PARA BACKEND:
 * - Cada campo tiene implicaciones en el algoritmo de recomendación
 * - Las prioridades deben estar ordenadas de mayor a menor importancia (posición en array)
 * - El rango de precios debe validarse (min < max)
 */
export interface UserMatchingPreferences {
  id?: number; // ID de la preferencia (auto-generado)
  userId: number; // Relación con el usuario

  // === CATEGORÍAS E INTERESES ===
  selectedCategories: ProductCategory[]; // Categorías de productos de interés
  usageTypes: UsageType[]; // Tipos de uso principal del hardware

  // === PRESUPUESTO ===
  priceRange: PriceRange; // Rango de precios aceptable
  flexibleBudget: boolean; // Si acepta ver productos fuera de rango ocasionalmente

  // === MARCAS ===
  preferredBrands: HardwareBrand[]; // Marcas preferidas
  excludedBrands: HardwareBrand[]; // Marcas a excluir de recomendaciones
  openToNewBrands: boolean; // Abierto a descubrir nuevas marcas

  // === PRIORIDADES DE MATCHING ===
  priorities: MatchingPriority[]; // Prioridades ordenadas (posición = importancia)

  // === ALERTAS Y NOTIFICACIONES ===
  alerts: MatchingAlerts;

  // === METADATOS ===
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Valores por defecto para nuevas preferencias
 * Útil para inicializar el formulario cuando el usuario no tiene preferencias guardadas
 */
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

/**
 * Opciones disponibles para mostrar en el formulario
 * Centralizado aquí para fácil mantenimiento y sincronización con backend
 */
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
