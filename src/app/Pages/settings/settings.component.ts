import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserMatchingPreferences,
  ProductCategory,
  HardwareBrand,
  MatchingPriority,
  UsageType,
  AlertFrequency,
  DEFAULT_MATCHING_PREFERENCES,
  MATCHING_OPTIONS,
} from '../../Interfaces/user-preferences.interface';
import { AuthService } from '../../Services/auth.service';
import { CategoryI } from '../../Interfaces/category.interface';
import { CategoriesService } from '../../Services/categories.service';

type CategoryOption = {
  value: ProductCategory;
  label: string;
  icon: string;
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  categories: CategoryOption[] = [...MATCHING_OPTIONS.categories];
  readonly usageTypes = MATCHING_OPTIONS.usageTypes;
  readonly brands = MATCHING_OPTIONS.brands;
  readonly priorities = MATCHING_OPTIONS.priorities;
  readonly alertFrequencies = MATCHING_OPTIONS.alertFrequencies;

  preferences: UserMatchingPreferences = {
    ...DEFAULT_MATCHING_PREFERENCES,
    userId: 0,
  };

  activeSection: 'categories' | 'budget' | 'brands' | 'priorities' | 'alerts' =
    'categories';
  isLoading: boolean = false;
  hasChanges: boolean = false;
  saveMessage: string = '';

  priceSliderMin: number = 0;
  priceSliderMax: number = 1000000;
  priceStep: number = 10000;

  draggedPriority: MatchingPriority | null = null;

  private readonly STORAGE_KEY = 'user_matching_preferences';

  constructor(
    private authService: AuthService,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.syncCategoriesFromBackend();
    this.loadPreferences();
  }

  private syncCategoriesFromBackend(): void {
    this.categoriesService.getCategoriesState().subscribe((backendCategories) => {
      const mapped = this.mapBackendCategoriesToOptions(backendCategories);
      if (mapped.length > 0) {
        this.categories = mapped;
      }
    });

    this.categoriesService.loadCategoriesIfNeeded().subscribe({
      error: (error) => {
        console.error('No se pudieron cargar categorias en configuracion:', error);
      },
    });
  }

  private mapBackendCategoriesToOptions(categories: CategoryI[]): CategoryOption[] {
    const iconByCategory: Record<string, string> = {
      notebooks: 'laptop',
      notebook: 'laptop',
      tablets: 'tablet',
      tablet: 'tablet',
      smartphones: 'smartphone',
      smartphone: 'smartphone',
      monitores: 'monitor',
      monitor: 'monitor',
      teclados: 'keyboard',
      teclado: 'keyboard',
      mouses: 'mouse',
      mouse: 'mouse',
      auriculares: 'headphones',
      almacenamiento: 'hard-drive',
      componentes: 'cpu',
    };

    const allowedValues: ProductCategory[] = [
      'notebooks',
      'tablets',
      'smartphones',
      'monitores',
      'teclados',
      'mouses',
      'auriculares',
      'almacenamiento',
      'componentes',
    ];

    const dedup = new Set<ProductCategory>();
    const result: CategoryOption[] = [];

    categories.forEach((category) => {
      const normalized = this.normalizeCategoryValue(category.name);
      if (!normalized || !allowedValues.includes(normalized) || dedup.has(normalized)) {
        return;
      }

      dedup.add(normalized);
      result.push({
        value: normalized,
        label: category.name,
        icon: iconByCategory[normalized] || 'cpu',
      });
    });

    return result;
  }

  private normalizeCategoryValue(name: string): ProductCategory | null {
    const key = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const map: Record<string, ProductCategory> = {
      notebook: 'notebooks',
      notebooks: 'notebooks',
      tablet: 'tablets',
      tablets: 'tablets',
      smartphone: 'smartphones',
      smartphones: 'smartphones',
      monitor: 'monitores',
      monitores: 'monitores',
      teclado: 'teclados',
      teclados: 'teclados',
      mouse: 'mouses',
      mouses: 'mouses',
      auricular: 'auriculares',
      auriculares: 'auriculares',
      almacenamiento: 'almacenamiento',
      componente: 'componentes',
      componentes: 'componentes',
    };

    return map[key] || null;
  }

  loadPreferences(): void {
    this.isLoading = true;

    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.preferences.userId = user.id;

        const savedPrefs = localStorage.getItem(
          `${this.STORAGE_KEY}_${user.id}`,
        );
        if (savedPrefs) {
          try {
            const parsed = JSON.parse(savedPrefs);
            this.preferences = { ...this.preferences, ...parsed };
          } catch (e) {
            console.warn('Error parsing saved preferences:', e);
          }
        }
      }
      this.isLoading = false;
    });
  }

  savePreferences(): void {
    this.isLoading = true;
    this.saveMessage = '';

    setTimeout(() => {
      const prefsToSave = {
        ...this.preferences,
        updatedAt: new Date(),
      };

      localStorage.setItem(
        `${this.STORAGE_KEY}_${this.preferences.userId}`,
        JSON.stringify(prefsToSave),
      );

      this.hasChanges = false;
      this.isLoading = false;
      this.saveMessage = '¡Preferencias guardadas correctamente!';

      setTimeout(() => {
        this.saveMessage = '';
      }, 3000);
    }, 500);
  }

  markAsChanged(): void {
    this.hasChanges = true;
  }

  isCategorySelected(category: ProductCategory): boolean {
    return this.preferences.selectedCategories.includes(category);
  }

  toggleCategory(category: ProductCategory): void {
    const index = this.preferences.selectedCategories.indexOf(category);
    if (index === -1) {
      this.preferences.selectedCategories.push(category);
    } else {
      this.preferences.selectedCategories.splice(index, 1);
    }
    this.markAsChanged();
  }

  isUsageTypeSelected(usage: UsageType): boolean {
    return this.preferences.usageTypes.includes(usage);
  }

  toggleUsageType(usage: UsageType): void {
    const index = this.preferences.usageTypes.indexOf(usage);
    if (index === -1) {
      this.preferences.usageTypes.push(usage);
    } else {
      this.preferences.usageTypes.splice(index, 1);
    }
    this.markAsChanged();
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  }

  updatePriceRange(type: 'min' | 'max', event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);

    if (type === 'min') {
      this.preferences.priceRange.minPrice = Math.min(
        value,
        this.preferences.priceRange.maxPrice - this.priceStep,
      );
    } else {
      this.preferences.priceRange.maxPrice = Math.max(
        value,
        this.preferences.priceRange.minPrice + this.priceStep,
      );
    }
    this.markAsChanged();
  }

  isBrandPreferred(brand: HardwareBrand): boolean {
    return this.preferences.preferredBrands.includes(brand);
  }

  isBrandExcluded(brand: HardwareBrand): boolean {
    return this.preferences.excludedBrands.includes(brand);
  }

  getBrandState(brand: HardwareBrand): 'preferred' | 'excluded' | 'neutral' {
    if (this.isBrandPreferred(brand)) return 'preferred';
    if (this.isBrandExcluded(brand)) return 'excluded';
    return 'neutral';
  }

  cycleBrandState(brand: HardwareBrand): void {
    const currentState = this.getBrandState(brand);

    this.preferences.preferredBrands = this.preferences.preferredBrands.filter(
      (b) => b !== brand,
    );
    this.preferences.excludedBrands = this.preferences.excludedBrands.filter(
      (b) => b !== brand,
    );

    if (currentState === 'neutral') {
      this.preferences.preferredBrands.push(brand);
    } else if (currentState === 'preferred') {
      this.preferences.excludedBrands.push(brand);
    }

    this.markAsChanged();
  }

  onDragStart(event: DragEvent, priority: MatchingPriority): void {
    this.draggedPriority = priority;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, targetPriority: MatchingPriority): void {
    event.preventDefault();

    if (!this.draggedPriority || this.draggedPriority === targetPriority) {
      this.draggedPriority = null;
      return;
    }

    const fromIndex = this.preferences.priorities.indexOf(this.draggedPriority);
    const toIndex = this.preferences.priorities.indexOf(targetPriority);

    this.preferences.priorities.splice(fromIndex, 1);
    this.preferences.priorities.splice(toIndex, 0, this.draggedPriority);

    this.draggedPriority = null;
    this.markAsChanged();
  }

  onDragEnd(): void {
    this.draggedPriority = null;
  }

  isPriorityInList(priority: MatchingPriority): boolean {
    return this.preferences.priorities.includes(priority);
  }

  togglePriorityInList(priority: MatchingPriority): void {
    const index = this.preferences.priorities.indexOf(priority);
    if (index === -1) {
      this.preferences.priorities.push(priority);
    } else if (this.preferences.priorities.length > 1) {
      this.preferences.priorities.splice(index, 1);
    }
    this.markAsChanged();
  }

  getPriorityLabel(priority: MatchingPriority): string {
    return this.priorities.find((p) => p.value === priority)?.label || priority;
  }

  getPriorityIcon(priority: MatchingPriority): string {
    return this.priorities.find((p) => p.value === priority)?.icon || '';
  }

  updateAlertFrequency(frequency: AlertFrequency): void {
    this.preferences.alerts.alertFrequency = frequency;
    this.markAsChanged();
  }

  toggleAlert(
    alertType: keyof Omit<typeof this.preferences.alerts, 'alertFrequency'>,
  ): void {
    this.preferences.alerts[alertType] = !this.preferences.alerts[alertType];
    this.markAsChanged();
  }

  setActiveSection(section: typeof this.activeSection): void {
    this.activeSection = section;
  }

  getProgressPercentage(): number {
    let completed = 0;
    const total = 5;

    if (this.preferences.selectedCategories.length > 0) completed++;
    if (this.preferences.usageTypes.length > 0) completed++;
    if (
      this.preferences.priceRange.maxPrice >
      this.preferences.priceRange.minPrice
    )
      completed++;
    if (this.preferences.priorities.length > 0) completed++;
    if (
      this.preferences.preferredBrands.length > 0 ||
      this.preferences.openToNewBrands
    )
      completed++;

    return Math.round((completed / total) * 100);
  }

  resetPreferences(): void {
    this.preferences = {
      ...DEFAULT_MATCHING_PREFERENCES,
      userId: this.preferences.userId,
    };
    this.markAsChanged();
  }
}

