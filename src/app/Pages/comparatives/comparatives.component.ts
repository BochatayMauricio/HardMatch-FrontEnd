import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { ComparativesService } from '../../Services/comparatives.service';
import { ProductI } from '../../Interfaces/product.interface';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

// Interfaz para características de productos
interface ProductCharacteristics {
  [key: string]: string | number | boolean | undefined;
}

// Interfaz para puntuación de producto
interface ProductScore {
  productIndex: number;
  totalScore: number;
  priceScore: number;
  specsScore: number;
  valueScore: number;
  breakdown: { [key: string]: number };
}

@Component({
  selector: 'app-comparatives',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comparatives.component.html',
  styleUrl: './comparatives.component.css',
})
export class ComparativesComponent implements OnInit, OnDestroy, AfterViewInit {
  private comparativesService = inject(ComparativesService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  products: ProductI[] = [];
  productScores: ProductScore[] = [];
  private subscription!: Subscription;

  @ViewChild('priceChart') priceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('valueChart') valueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overallChart') overallChartRef!: ElementRef<HTMLCanvasElement>;

  private priceChart: Chart | null = null;
  private radarChart: Chart | null = null;
  private valueChart: Chart | null = null;
  private overallChart: Chart | null = null;

  // Scoring tiers para procesadores
  private processorTiers: { [key: string]: number } = {
    i3: 30,
    i5: 60,
    i7: 85,
    i9: 100,
    celeron: 15,
    pentium: 25,
    'ryzen 3': 35,
    'ryzen 5': 65,
    'ryzen 7': 90,
    'ryzen 9': 100,
    athlon: 20,
    m1: 85,
    m2: 95,
    m3: 100,
    'snapdragon 8': 90,
    'snapdragon 7': 70,
    'snapdragon 6': 50,
    mediatek: 40,
    exynos: 60,
  };

  // Mapeo de características por categoría
  characteristicsLabels: { [key: string]: { [key: string]: string } } = {
    notebook: {
      processor: 'Procesador',
      ram: 'Memoria RAM',
      storage: 'Almacenamiento',
      screen: 'Pantalla',
      graphics: 'Gráficos',
      battery: 'Batería',
      weight: 'Peso',
      os: 'Sistema Operativo',
    },
    tablet: {
      processor: 'Procesador',
      ram: 'Memoria RAM',
      storage: 'Almacenamiento',
      screen: 'Pantalla',
      battery: 'Batería',
      camera: 'Cámara',
      os: 'Sistema Operativo',
      connectivity: 'Conectividad',
    },
    mouse: {
      dpi: 'DPI Máximo',
      buttons: 'Botones',
      connectivity: 'Conectividad',
      battery: 'Batería',
      weight: 'Peso',
      rgb: 'Iluminación RGB',
      sensor: 'Tipo de Sensor',
      polling: 'Tasa de Sondeo',
    },
  };

  ngOnInit(): void {
    this.subscription = this.comparativesService
      .getProducts()
      .subscribe((products) => {
        this.products = products;
        this.calculateProductScores();
        if (isPlatformBrowser(this.platformId)) {
          setTimeout(() => this.updateCharts(), 100);
        }
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.products.length > 0) {
      this.createCharts();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroyCharts();
  }

  removeProduct(productId: number): void {
    this.comparativesService.removeProduct(productId);
  }

  clearAll(): void {
    this.comparativesService.clearProducts();
  }

  goToSearch(): void {
    this.router.navigate(['/']);
  }

  get category(): string {
    return this.products.length > 0 ? this.products[0].category : '';
  }

  get categoryLabel(): string {
    const labels: { [key: string]: string } = {
      notebook: 'Notebooks',
      tablet: 'Tablets',
      mouse: 'Mouse',
    };
    return labels[this.category] || this.category;
  }

  hasRatings(): boolean {
    return this.products.some(
      (p) => p.ratings !== undefined && p.ratings !== null,
    );
  }

  getCharacteristicKeys(): string[] {
    if (this.products.length === 0) return [];
    const cat = this.products[0].category;
    return Object.keys(this.characteristicsLabels[cat] || {});
  }

  getCharacteristicLabel(key: string): string {
    if (this.products.length === 0) return key;
    const cat = this.products[0].category;
    return this.characteristicsLabels[cat]?.[key] || key;
  }

  getCharacteristicValue(product: ProductI, key: string): string {
    const characteristics = product.caracteristics as
      | ProductCharacteristics
      | undefined;
    if (!characteristics) return '-';
    const value = characteristics[key];
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
  }

  // ============= SISTEMA DE PUNTUACIÓN =============

  private calculateProductScores(): void {
    if (this.products.length === 0) {
      this.productScores = [];
      return;
    }

    this.productScores = this.products.map((product, index) => {
      const breakdown = this.calculateSpecsBreakdown(product);
      const specsScore = this.calculateTotalSpecsScore(breakdown);
      const priceScore = this.calculatePriceScore(product.price);
      const valueScore = this.calculateValueScore(specsScore, product.price);

      return {
        productIndex: index,
        totalScore: Math.round(
          specsScore * 0.6 + priceScore * 0.2 + valueScore * 0.2,
        ),
        priceScore,
        specsScore,
        valueScore,
        breakdown,
      };
    });
  }

  private calculateSpecsBreakdown(product: ProductI): {
    [key: string]: number;
  } {
    const breakdown: { [key: string]: number } = {};
    const characteristics = product.caracteristics as
      | ProductCharacteristics
      | undefined;

    if (!characteristics) return breakdown;

    const category = product.category;

    if (category === 'notebook' || category === 'tablet') {
      breakdown['processor'] = this.scoreProcessor(
        characteristics['processor'] as string,
      );
      breakdown['ram'] = this.scoreRAM(characteristics['ram'] as string);
      breakdown['storage'] = this.scoreStorage(
        characteristics['storage'] as string,
      );
      breakdown['screen'] = this.scoreScreen(
        characteristics['screen'] as string,
      );
    }

    if (category === 'mouse') {
      breakdown['dpi'] = this.scoreDPI(characteristics['dpi'] as string);
      breakdown['buttons'] = this.scoreButtons(
        characteristics['buttons'] as string,
      );
      breakdown['weight'] = this.scoreMouseWeight(
        characteristics['weight'] as string,
      );
    }

    if (product.ratings) {
      breakdown['ratings'] = (product.ratings / 5) * 100;
    }

    return breakdown;
  }

  private scoreProcessor(processor: string | undefined): number {
    if (!processor) return 0;
    const lowerProcessor = processor.toLowerCase();

    for (const [tier, score] of Object.entries(this.processorTiers)) {
      if (lowerProcessor.includes(tier)) {
        return score;
      }
    }
    return 50;
  }

  private scoreRAM(ram: string | undefined): number {
    if (!ram) return 0;
    const match = ram.match(/(\d+)\s*GB/i);
    if (!match) return 0;

    const size = parseInt(match[1]);
    if (size >= 32) return 100;
    if (size >= 16) return 85;
    if (size >= 12) return 70;
    if (size >= 8) return 55;
    if (size >= 4) return 35;
    return 20;
  }

  private scoreStorage(storage: string | undefined): number {
    if (!storage) return 0;
    const lowerStorage = storage.toLowerCase();

    const isSSD = lowerStorage.includes('ssd') || lowerStorage.includes('nvme');

    const match = storage.match(/(\d+)\s*(GB|TB)/i);
    if (!match) return 0;

    let size = parseInt(match[1]);
    if (match[2].toUpperCase() === 'TB') size *= 1024;

    let score = 0;
    if (size >= 1024) score = 85;
    else if (size >= 512) score = 70;
    else if (size >= 256) score = 50;
    else if (size >= 128) score = 35;
    else score = 20;

    if (isSSD) score = Math.min(100, score + 15);

    return score;
  }

  private scoreScreen(screen: string | undefined): number {
    if (!screen) return 0;
    const lowerScreen = screen.toLowerCase();

    let score = 50;

    if (lowerScreen.includes('4k') || lowerScreen.includes('2160')) score += 30;
    else if (lowerScreen.includes('qhd') || lowerScreen.includes('1440'))
      score += 20;
    else if (lowerScreen.includes('fhd') || lowerScreen.includes('1080'))
      score += 10;

    if (lowerScreen.includes('oled') || lowerScreen.includes('amoled'))
      score += 15;
    else if (lowerScreen.includes('ips')) score += 10;

    if (lowerScreen.includes('144hz') || lowerScreen.includes('165hz'))
      score += 10;
    else if (lowerScreen.includes('120hz')) score += 8;

    return Math.min(100, score);
  }

  private scoreDPI(dpi: string | undefined): number {
    if (!dpi) return 0;
    const match = dpi.match(/(\d+)/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    if (value >= 25000) return 100;
    if (value >= 16000) return 85;
    if (value >= 12000) return 70;
    if (value >= 8000) return 55;
    if (value >= 4000) return 40;
    return 25;
  }

  private scoreButtons(buttons: string | undefined): number {
    if (!buttons) return 0;
    const match = buttons.match(/(\d+)/);
    if (!match) return 0;

    const count = parseInt(match[1]);
    if (count >= 10) return 100;
    if (count >= 8) return 80;
    if (count >= 6) return 65;
    if (count >= 5) return 50;
    return 35;
  }

  private scoreMouseWeight(weight: string | undefined): number {
    if (!weight) return 50;
    const match = weight.match(/(\d+)\s*g/i);
    if (!match) return 50;

    const grams = parseInt(match[1]);
    if (grams <= 60) return 100;
    if (grams <= 70) return 90;
    if (grams <= 80) return 80;
    if (grams <= 90) return 70;
    if (grams <= 100) return 60;
    return 40;
  }

  private calculateTotalSpecsScore(breakdown: {
    [key: string]: number;
  }): number {
    const values = Object.values(breakdown);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private calculatePriceScore(price: number): number {
    if (this.products.length === 0) return 0;

    const prices = this.products.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (maxPrice === minPrice) return 100;

    return Math.round(100 - ((price - minPrice) / (maxPrice - minPrice)) * 100);
  }

  private calculateValueScore(specsScore: number, price: number): number {
    if (price === 0) return 0;
    const valueRatio = specsScore / (price / 100000);
    return Math.min(100, Math.round(valueRatio * 10));
  }

  getProductScore(index: number): ProductScore | undefined {
    return this.productScores.find((s) => s.productIndex === index);
  }

  getBestValueIndex(): number {
    if (this.productScores.length === 0) return 0;
    return this.productScores.reduce((best, current) =>
      current.valueScore > best.valueScore ? current : best,
    ).productIndex;
  }

  getBestSpecsIndex(): number {
    if (this.productScores.length === 0) return 0;
    return this.productScores.reduce((best, current) =>
      current.specsScore > best.specsScore ? current : best,
    ).productIndex;
  }

  getOverallBestIndex(): number {
    if (this.productScores.length === 0) return 0;
    return this.productScores.reduce((best, current) =>
      current.totalScore > best.totalScore ? current : best,
    ).productIndex;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#3B82F6';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  }

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Muy bueno';
    if (score >= 40) return 'Bueno';
    return 'Regular';
  }

  // ============= COMPARACIÓN DE CARACTERÍSTICAS =============

  compareCharacteristics(key: string): { best: number[]; worst: number[] } {
    const result = { best: [] as number[], worst: [] as number[] };
    if (this.products.length < 2) return result;

    const scores = this.productScores
      .map((ps, i) => ({
        index: i,
        score: ps.breakdown[key] ?? null,
      }))
      .filter((s) => s.score !== null);

    if (scores.length > 1) {
      const maxScore = Math.max(...scores.map((s) => s.score!));
      const minScore = Math.min(...scores.map((s) => s.score!));

      scores.forEach((s) => {
        if (s.score === maxScore) result.best.push(s.index);
        if (s.score === minScore && maxScore !== minScore)
          result.worst.push(s.index);
      });
    }

    return result;
  }

  isCharacteristicBest(productIndex: number, key: string): boolean {
    return this.compareCharacteristics(key).best.includes(productIndex);
  }

  isCharacteristicWorst(productIndex: number, key: string): boolean {
    return this.compareCharacteristics(key).worst.includes(productIndex);
  }

  getPriceComparison(): { cheapest: number; mostExpensive: number } {
    if (this.products.length === 0) return { cheapest: -1, mostExpensive: -1 };

    let cheapestIndex = 0;
    let expensiveIndex = 0;

    this.products.forEach((p, i) => {
      if (p.price < this.products[cheapestIndex].price) cheapestIndex = i;
      if (p.price > this.products[expensiveIndex].price) expensiveIndex = i;
    });

    return { cheapest: cheapestIndex, mostExpensive: expensiveIndex };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  }

  calculateSavings(): number {
    if (this.products.length < 2) return 0;
    const prices = this.products.map((p) => p.price);
    return Math.max(...prices) - Math.min(...prices);
  }

  private createCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.destroyCharts();

    if (this.products.length > 0) {
      this.createPriceChart();
      this.createRadarChart();
      this.createValueChart();
      this.createOverallChart();
    }
  }

  private updateCharts(): void {
    this.createCharts();
  }

  private destroyCharts(): void {
    if (this.priceChart) {
      this.priceChart.destroy();
      this.priceChart = null;
    }
    if (this.radarChart) {
      this.radarChart.destroy();
      this.radarChart = null;
    }
    if (this.valueChart) {
      this.valueChart.destroy();
      this.valueChart = null;
    }
    if (this.overallChart) {
      this.overallChart.destroy();
      this.overallChart = null;
    }
  }

  private createPriceChart(): void {
    if (!this.priceChartRef?.nativeElement) return;

    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 15));
    const prices = this.products.map((p) => p.price);
    const cheapestIdx = this.getPriceComparison().cheapest;

    const backgroundColors = this.products.map((_, i) =>
      i === cheapestIdx
        ? 'rgba(16, 185, 129, 0.8)'
        : `rgba(124, 58, 237, ${0.7 - i * 0.1})`,
    );

    const borderColors = this.products.map((_, i) =>
      i === cheapestIdx ? 'rgba(16, 185, 129, 1)' : 'rgba(124, 58, 237, 1)',
    );

    this.priceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Precio',
            data: prices,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => this.products[items[0].dataIndex].name,
              label: (context) => ` ${this.formatPrice(context.raw as number)}`,
              afterLabel: (context) => {
                if (context.dataIndex === cheapestIdx)
                  return '  ✓ Mejor precio';
                return '';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: (value) =>
                '$' + ((value as number) / 1000).toFixed(0) + 'k',
              font: { size: 11 },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: 'bold' } },
          },
        },
      },
    });
  }

  private createRadarChart(): void {
    if (!this.radarChartRef?.nativeElement) return;
    if (this.productScores.length === 0) return;

    const ctx = this.radarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const dimensions = this.getRadarDimensions();

    const datasets = this.products.map((product, i) => {
      const score = this.productScores[i];
      const data = dimensions.map((d) => score?.breakdown[d.key] || 0);

      return {
        label: this.truncateLabel(product.brand, 12),
        data,
        backgroundColor: this.getRadarColor(i, 0.2),
        borderColor: this.getRadarColor(i, 1),
        borderWidth: 2,
        pointBackgroundColor: this.getRadarColor(i, 1),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      };
    });

    this.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: dimensions.map((d) => d.label),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: { size: 12 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) =>
                ` ${context.dataset.label}: ${context.raw}/100`,
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: { size: 10 },
              backdropColor: 'transparent',
            },
            pointLabels: { font: { size: 11, weight: 'bold' } },
            grid: { color: 'rgba(0, 0, 0, 0.1)' },
            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
          },
        },
      },
    });
  }

  private createValueChart(): void {
    if (!this.valueChartRef?.nativeElement) return;
    if (this.productScores.length === 0) return;

    const ctx = this.valueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 12));
    const bestValueIdx = this.getBestValueIndex();

    this.valueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Especificaciones',
            data: this.productScores.map((s) => s.specsScore),
            backgroundColor: 'rgba(124, 58, 237, 0.7)',
            borderColor: 'rgba(124, 58, 237, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'Precio',
            data: this.productScores.map((s) => s.priceScore),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
          {
            label: 'Calidad-Precio',
            data: this.productScores.map((s) => s.valueScore),
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: 'rgba(245, 158, 11, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => this.products[items[0].dataIndex].name,
              afterBody: (items) => {
                if (items[0].dataIndex === bestValueIdx)
                  return '\n🏆 Mejor calidad-precio';
                return '';
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: (value) => value + ' pts',
              font: { size: 11 },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: 'bold' } },
          },
        },
      },
    });
  }

  private createOverallChart(): void {
    if (!this.overallChartRef?.nativeElement) return;
    if (this.productScores.length === 0) return;

    const ctx = this.overallChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 12));
    const bestOverallIdx = this.getOverallBestIndex();

    // Colores degradados para cada producto
    const backgroundColors = this.products.map((_, i) => {
      if (i === bestOverallIdx) return 'rgba(16, 185, 129, 0.8)';
      const colors = [
        'rgba(124, 58, 237, 0.7)',
        'rgba(37, 99, 235, 0.7)',
        'rgba(245, 158, 11, 0.7)',
      ];
      return colors[i % colors.length];
    });

    const borderColors = this.products.map((_, i) => {
      if (i === bestOverallIdx) return 'rgba(16, 185, 129, 1)';
      const colors = [
        'rgba(124, 58, 237, 1)',
        'rgba(37, 99, 235, 1)',
        'rgba(245, 158, 11, 1)',
      ];
      return colors[i % colors.length];
    });

    this.overallChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: this.productScores.map((s) => s.totalScore),
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: { size: 11 },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const score = this.productScores[i]?.totalScore || 0;
                    const isBest = i === bestOverallIdx;
                    return {
                      text: `${label}: ${score} pts${isBest ? ' 🏆' : ''}`,
                      fillStyle: backgroundColors[i],
                      strokeStyle: borderColors[i],
                      lineWidth: 2,
                      hidden: false,
                      index: i,
                      pointStyle: 'circle',
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              title: (items) => this.products[items[0].dataIndex].name,
              label: (context) => ` Puntuación: ${context.raw} / 100 pts`,
              afterLabel: (context) => {
                const idx = context.dataIndex;
                const score = this.productScores[idx];
                let details = `\n  • Specs: ${score.specsScore} pts`;
                details += `\n  • Precio: ${score.priceScore} pts`;
                details += `\n  • Valor: ${score.valueScore} pts`;
                if (idx === bestOverallIdx)
                  details += '\n\n🏆 Mejor opción global';
                return details;
              },
            },
          },
        },
      },
    });
  }

  private getRadarDimensions(): { key: string; label: string }[] {
    const category = this.category;

    if (category === 'notebook' || category === 'tablet') {
      return [
        { key: 'processor', label: 'Procesador' },
        { key: 'ram', label: 'RAM' },
        { key: 'storage', label: 'Almacenamiento' },
        { key: 'screen', label: 'Pantalla' },
        { key: 'ratings', label: 'Valoración' },
      ];
    }

    if (category === 'mouse') {
      return [
        { key: 'dpi', label: 'DPI' },
        { key: 'buttons', label: 'Botones' },
        { key: 'weight', label: 'Peso' },
        { key: 'ratings', label: 'Valoración' },
      ];
    }

    return [{ key: 'ratings', label: 'Valoración' }];
  }

  private getRadarColor(index: number, alpha: number): string {
    const colors = [
      `rgba(124, 58, 237, ${alpha})`,
      `rgba(37, 99, 235, ${alpha})`,
      `rgba(16, 185, 129, ${alpha})`,
      `rgba(245, 158, 11, ${alpha})`,
    ];
    return colors[index % colors.length];
  }

  private truncateLabel(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
