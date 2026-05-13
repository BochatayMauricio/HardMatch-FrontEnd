import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { ComparativesService } from '../../Services/comparatives.service';
import { ProductI } from '../../Interfaces/product.interface';

Chart.register(...registerables);

interface ProductCharacteristics {
  [key: string]: string | number | boolean | undefined;
}

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

  // Mantenemos tu sistema de puntuación intacto
  private processorTiers: { [key: string]: number } = {
    i3: 30, i5: 60, i7: 85, i9: 100, celeron: 15, pentium: 25,
    'ryzen 3': 35, 'ryzen 5': 65, 'ryzen 7': 90, 'ryzen 9': 100, athlon: 20,
    m1: 85, m2: 95, m3: 100, 'snapdragon 8': 90, 'snapdragon 7': 70,
    'snapdragon 6': 50, mediatek: 40, exynos: 60,
  };

  constructor(
    private comparativesService: ComparativesService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.subscription = this.comparativesService
      .getProducts()
      .subscribe((products) => {
        this.products = products;
        console.log("Productos a comparar",products)
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
    if (this.subscription) this.subscription.unsubscribe();
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

  // --- GETTERS RESTAURADOS (Evita que el HTML de Angular crashee) ---
  get category(): string {
    return this.products.length > 0 ? this.products[0].category || '' : '';
  }

  get normalizedCategory(): string {
    return this.category.toLowerCase();
  }

  get categoryLabel(): string {
    return this.category;
  }

  hasRatings(): boolean {
    return this.products.some((p) => p.ratings !== undefined && p.ratings !== null);
  }

  getCharacteristicKeys(): string[] {
    if (this.products.length === 0) return [];
    const keys = new Set<string>();
    
    this.products.forEach(product => {
      if (product.caracteristics) {
        Object.keys(product.caracteristics).forEach(k => keys.add(k));
      }
    });
    
    return Array.from(keys).sort();
  }

  getCharacteristicLabel(key: string): string {
    return key.replace(/_/g, ' '); // Formato más limpio
  }

  getCharacteristicValue(product: ProductI, key: string): string {
    if (!product.caracteristics) return '-';
    const value = (product.caracteristics as any)[key];
    
    if (value === undefined || value === null || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    return String(value);
  }

  private findFeatureValue(product: ProductI, keywords: string[]): string {
    const chars = product.caracteristics as any;
    if (!chars) return '';
    
    for (const key of Object.keys(chars)) {
      const lowerKey = key.toLowerCase();
      if (keywords.some(k => lowerKey.includes(k))) {
        return String(chars[key]);
      }
    }
    return ''; 
  }

  // --- CÁLCULO DE SCORE ORIGINAL + FALLBACK PARA RAM Y OTROS ---
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
        totalScore: Math.round(specsScore * 0.6 + priceScore * 0.2 + valueScore * 0.2),
        priceScore,
        specsScore,
        valueScore,
        breakdown,
      };
    });
  }

  // Generador de Recomendación Inteligente
  getSmartRecommendation(): string {
    if (this.products.length < 2 || this.productScores.length === 0) return '';

    const bestValueIdx = this.getBestValueIndex();
    const bestSpecsIdx = this.getBestSpecsIndex();
    const cheapestIdx = this.getPriceComparison().cheapest;

    const bestValueProd = this.products[bestValueIdx];
    const bestSpecsProd = this.products[bestSpecsIdx];
    const cheapestProd = this.products[cheapestIdx];

    const priceDiff = bestSpecsProd.price - cheapestProd.price;
    const formattedDiff = this.formatPrice(priceDiff);

    // Caso 1: Un producto domina en TODO (Es el mejor y el más barato)
    if (bestSpecsIdx === cheapestIdx) {
      return `¡El veredicto es claro! Te recomendamos el "${bestSpecsProd.name}". Es un caso raro donde el producto con mejores especificaciones técnicas es también el más económico de la comparativa. Es una compra segura sin dudarlo.`;
    }

    // Caso 2: El mejor en Calidad/Precio es distinto al más potente y al más barato
    if (bestValueIdx !== bestSpecsIdx && bestValueIdx !== cheapestIdx) {
      return `La opción más inteligente y equilibrada es el "${bestValueProd.name}". Si buscas el máximo rendimiento absoluto, el "${bestSpecsProd.name}" es superior, pero requiere una inversión extra de ${formattedDiff}. Por otro lado, si tienes un presupuesto ajustado, el "${cheapestProd.name}" cumple con lo básico por menos dinero.`;
    }

    // Caso 3: El mejor en Calidad/Precio es el más potente, pero NO es el más barato
    if (bestValueIdx === bestSpecsIdx) {
      return `Te recomendamos invertir en el "${bestSpecsProd.name}". Aunque el "${cheapestProd.name}" es ${formattedDiff} más barato, la diferencia de potencia y características justifica totalmente el salto de precio, dándote la mejor relación calidad-precio a largo plazo.`;
    }

    // Caso 4: El mejor en Calidad/Precio es el más barato, pero no es el más potente
    if (bestValueIdx === cheapestIdx) {
      return `Nuestra recomendación es ir por el "${cheapestProd.name}". Es la opción con mejor relación calidad-precio. El "${bestSpecsProd.name}" es técnicamente superior, pero la diferencia de precio (${formattedDiff}) es demasiado alta y probablemente no justifique ese gasto extra para un uso cotidiano.`;
    }

    return `Basado en nuestro análisis, el "${bestValueProd.name}" ofrece el mejor equilibrio general entre lo que pagas y el rendimiento que obtienes.`;
  }

  private calculateSpecsBreakdown(product: ProductI): { [key: string]: number } {
    const breakdown: { [key: string]: number } = {};
    const cat = this.normalizedCategory;

    // Lógica Original Intacta
    if (cat.includes('notebook') || cat.includes('tablet')) {
      const cpu = this.findFeatureValue(product, ['procesador', 'cpu']) || product.name;
      const ram = this.findFeatureValue(product, ['ram', 'memoria']);
      const storage = this.findFeatureValue(product, ['almacenamiento', 'capacidad', 'disco', 'ssd', 'hdd']);
      const screen = this.findFeatureValue(product, ['pantalla', 'resolución', 'tamaño']);

      breakdown['processor'] = this.scoreProcessor(cpu);
      breakdown['ram'] = this.scoreRAM(ram);
      breakdown['storage'] = this.scoreStorage(storage);
      breakdown['screen'] = this.scoreScreen(screen);
    } 
    else if (cat.includes('mouse')) {
      const dpi = this.findFeatureValue(product, ['dpi', 'resolución', 'sensibilidad']);
      const buttons = this.findFeatureValue(product, ['botones', 'cantidad']);
      const weight = this.findFeatureValue(product, ['peso']);

      breakdown['dpi'] = this.scoreDPI(dpi);
      breakdown['buttons'] = this.scoreButtons(buttons);
      breakdown['weight'] = this.scoreMouseWeight(weight);
    } 
    else if (cat.includes('placas de video') || cat.includes('video')) {
      const vram = this.findFeatureValue(product, ['memoria', 'vram', 'tamaño']);
      breakdown['graphics'] = this.scoreVRAM(vram);
      breakdown['processor'] = this.scoreGPUGeneration(product.name);
    } 
    else if (cat.includes('procesador')) {
      const cores = this.findFeatureValue(product, ['núcleos', 'cores']);
      breakdown['processor'] = this.scoreCores(cores);
      breakdown['generation'] = this.scoreProcessor(product.name);
    }
    else {
      // 💡 NUEVO FALLBACK DINÁMICO (Para RAM, Fuentes, etc.)
      const keys = this.getCharacteristicKeys();
      keys.forEach(key => {
        const val = this.getCharacteristicValue(product, key);
        const numMatch = val.match(/[\d\.]+/);
        if (numMatch && !key.toLowerCase().includes('precio') && !key.toLowerCase().includes('id')) {
          const allValues = this.products.map(p => parseFloat(this.getCharacteristicValue(p, key).match(/[\d\.]+/)?.[0] || '0'));
          const max = Math.max(...allValues);
          breakdown[key] = max > 0 ? (parseFloat(numMatch[0]) / max) * 100 : 50;
        }
      });
    }

    if (product.ratings) {
      breakdown['ratings'] = (product.ratings / 5) * 100;
    }

    return breakdown;
  }

  // Métodos Originales de Scoring Conservados
  private scoreVRAM(vram: string): number {
    if (!vram) return 30;
    const match = vram.match(/(\d+)\s*GB/i);
    if (!match) return 30;
    const gb = parseInt(match[1]);
    if (gb >= 24) return 100;
    if (gb >= 16) return 85;
    if (gb >= 12) return 70;
    if (gb >= 8) return 50;
    return 30;
  }

  private scoreCores(coresString: string): number {
    if (!coresString) return 30;
    const match = coresString.match(/(\d+)/i); 
    if (!match) return 30;
    const cores = parseInt(match[1]);
    if (cores >= 24) return 100;
    if (cores >= 16) return 90;
    if (cores >= 12) return 80;
    if (cores >= 8) return 65;
    if (cores >= 6) return 50;
    return 35;
  }

  private scoreGPUGeneration(name: string): number {
    if (!name) return 50;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('4090')) return 100;
    if (lowerName.includes('7900 xtx') || lowerName.includes('4080')) return 95;
    if (lowerName.includes('4070') || lowerName.includes('7800')) return 85;
    if (lowerName.includes('4060') || lowerName.includes('7600')) return 70;
    return 50;
  }

  private scoreProcessor(processor: string): number {
    if (!processor) return 20;
    const lowerProcessor = processor.toLowerCase();
    for (const [tier, score] of Object.entries(this.processorTiers)) {
      if (lowerProcessor.includes(tier)) return score;
    }
    return 50;
  }

  private scoreRAM(ram: string): number {
    if (!ram) return 20;
    const match = ram.match(/(\d+)\s*GB/i);
    if (!match) return 20;
    const size = parseInt(match[1]);
    if (size >= 32) return 100;
    if (size >= 16) return 85;
    if (size >= 12) return 70;
    if (size >= 8) return 55;
    if (size >= 4) return 35;
    return 20;
  }

  private scoreStorage(storage: string): number {
    if (!storage) return 20;
    const lowerStorage = storage.toLowerCase();
    const isSSD = lowerStorage.includes('ssd') || lowerStorage.includes('nvme');
    const match = storage.match(/(\d+)\s*(GB|TB)/i);
    if (!match) return 20;

    let size = parseInt(match[1]);
    if (match[2].toUpperCase() === 'TB') size *= 1024;

    let score = 20;
    if (size >= 1024) score = 85;
    else if (size >= 512) score = 70;
    else if (size >= 256) score = 50;
    else if (size >= 128) score = 35;

    if (isSSD) score = Math.min(100, score + 15);
    return score;
  }

  private scoreScreen(screen: string): number {
    if (!screen) return 50;
    const lowerScreen = screen.toLowerCase();
    let score = 50;

    if (lowerScreen.includes('4k') || lowerScreen.includes('2160')) score += 30;
    else if (lowerScreen.includes('qhd') || lowerScreen.includes('1440')) score += 20;
    else if (lowerScreen.includes('fhd') || lowerScreen.includes('1080')) score += 10;

    if (lowerScreen.includes('oled') || lowerScreen.includes('amoled')) score += 15;
    else if (lowerScreen.includes('ips')) score += 10;

    if (lowerScreen.includes('144hz') || lowerScreen.includes('165hz')) score += 10;
    else if (lowerScreen.includes('120hz')) score += 8;

    return Math.min(100, score);
  }

  private scoreDPI(dpi: string): number {
    if (!dpi) return 25;
    const match = dpi.match(/(\d+)/);
    if (!match) return 25;
    const value = parseInt(match[1]);
    if (value >= 25000) return 100;
    if (value >= 16000) return 85;
    if (value >= 12000) return 70;
    if (value >= 8000) return 55;
    if (value >= 4000) return 40;
    return 25;
  }

  private scoreButtons(buttons: string): number {
    if (!buttons) return 35;
    const match = buttons.match(/(\d+)/);
    if (!match) return 35;
    const count = parseInt(match[1]);
    if (count >= 10) return 100;
    if (count >= 8) return 80;
    if (count >= 6) return 65;
    if (count >= 5) return 50;
    return 35;
  }

  private scoreMouseWeight(weight: string): number {
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

  private calculateTotalSpecsScore(breakdown: { [key: string]: number }): number {
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

  // --- MOTOR DE COMPARACIÓN INTELIGENTE (FILAS DE LA TABLA) ---
  compareCharacteristics(key: string): { best: number[]; worst: number[] } {
    const result = { best: [] as number[], worst: [] as number[] };
    if (this.products.length < 2) return result;

    const values = this.products.map((p, i) => ({
      index: i,
      val: this.getCharacteristicValue(p, key)
    }));

    if (values.every(v => v.val === values[0].val || v.val === '-')) return result;

    const lowerKey = key.toLowerCase();

    // A. Comparación Booleana
    const hasSi = values.some(v => ['si', 'sí', 'yes', 'true'].includes(v.val.toLowerCase()));
    const hasNo = values.some(v => ['no', 'false', '0'].includes(v.val.toLowerCase()));
    if (hasSi && hasNo) {
      values.forEach(v => {
        if (['si', 'sí', 'yes', 'true'].includes(v.val.toLowerCase())) result.best.push(v.index);
        else if (['no', 'false', '0'].includes(v.val.toLowerCase())) result.worst.push(v.index);
      });
      return result;
    }

    // B. Jerarquías Tecnológicas
    const hierarchies = [
      ['oled', 'amoled', 'ips', 'va', 'tn'],
      ['ddr5', 'ddr4', 'ddr3'],
      ['ax', 'ac', 'n'],
      ['nvme', 'pcie', 'sata', 'hdd'],
      ['rtx 5090','rtx 5080','rtx 5070','rtx 5060','rtx 5050','rtx 4090', 'rtx 4080', 'rtx 4070', 'rx 7900', 'rtx 3080', 'rtx 4060', 'rtx 3070', 'rx 7600', 'rtx 3060', 'rtx 3050', 'rtx 2050', 'gtx 1660', 'gtx 1650', 'arc', 'iris xe', 'radeon graphics', 'uhd graphics', 'integrada']
    ];

    for (const tierList of hierarchies) {
      const ranks = values.map(v => {
        const valLower = v.val.toLowerCase();
        const rank = tierList.findIndex(tier => valLower.includes(tier));
        return { index: v.index, rank: rank !== -1 ? rank : 999 };
      });

      const validRanks = ranks.filter(r => r.rank !== 999);
      if (validRanks.length > 1 && validRanks.some(r => r.rank !== validRanks[0].rank)) {
        const bestRank = Math.min(...validRanks.map(r => r.rank)); 
        const worstRank = Math.max(...validRanks.map(r => r.rank));
        
        ranks.forEach(r => {
          if (r.rank === bestRank) result.best.push(r.index);
          if (r.rank === worstRank && bestRank !== worstRank) result.worst.push(r.index);
        });
        return result; 
      }
    }

    // C. Comparación Numérica Automática
    let parsedNums = values.map(v => {
      let num = 0;
      const valLower = v.val.toLowerCase();
      
      if (lowerKey.includes('resolucion') || valLower.includes('x')) {
        const match = valLower.match(/(\d+)\s*x\s*(\d+)/);
        if (match) num = parseInt(match[1]) * parseInt(match[2]); 
      } else {
        const match = valLower.match(/[\d\.]+/);
        if (match) num = parseFloat(match[0]);
      }
      return { index: v.index, num, isValid: num > 0 };
    });

    if (parsedNums.filter(n => n.isValid).length > 1 && parsedNums.some(n => n.num !== parsedNums[0].num)) {
      const validNums = parsedNums.filter(n => n.isValid).map(n => n.num);
      const maxNum = Math.max(...validNums);
      const minNum = Math.min(...validNums);

      const lowerIsBetter = lowerKey.includes('peso') || 
                            lowerKey.includes('latencia') || 
                            lowerKey.includes('alto') || 
                            lowerKey.includes('ancho') || 
                            lowerKey.includes('profundidad') || 
                            lowerKey.includes('consumo');

      parsedNums.forEach(v => {
        if (!v.isValid) return;
        if (lowerIsBetter) {
          if (v.num === minNum) result.best.push(v.index);
          if (v.num === maxNum) result.worst.push(v.index);
        } else {
          if (v.num === maxNum) result.best.push(v.index);
          if (v.num === minNum) result.worst.push(v.index);
        }
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
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(price);
  }

  calculateSavings(): number {
    if (this.products.length < 2) return 0;
    const prices = this.products.map((p) => p.price);
    return Math.max(...prices) - Math.min(...prices);
  }

  // --- LÓGICA DE ESTILOS Y PLACAS DE VIDEO ---

  private isDedicatedGPU(value: string): boolean {
    if (!value) return false;
    const lowerVal = value.toLowerCase();
    
    if (lowerVal.includes('integrada') || lowerVal.includes('iris') || lowerVal.includes('uhd') || lowerVal.includes('radeon graphics')) {
      return false;
    }
    
    return lowerVal.includes('rtx') || lowerVal.includes('gtx') || lowerVal.match(/\brx\b/) !== null || lowerVal.includes('dedicada') || lowerVal.includes('geforce') || lowerVal.includes('radeon pro');
  }

  getGpuCssClass(productIndex: number, key: string): string {
    const lowerKey = key.toLowerCase();
    // Si no es la fila de video, no aplicamos ninguna clase extra
    if (!lowerKey.includes('video') && !lowerKey.includes('gpu') && !lowerKey.includes('gráficos')) {
      return '';
    }

    const val = this.getCharacteristicValue(this.products[productIndex], key);
    const isDedicated = this.isDedicatedGPU(val);
    const isBest = this.isCharacteristicBest(productIndex, key);

    if (isDedicated && isBest) return 'gpu-dedicated-best';
    if (isDedicated) return 'gpu-dedicated';
    return 'gpu-integrated';
  }

  // --- CHART.JS ---
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
    if (this.priceChart) { this.priceChart.destroy(); this.priceChart = null; }
    if (this.radarChart) { this.radarChart.destroy(); this.radarChart = null; }
    if (this.valueChart) { this.valueChart.destroy(); this.valueChart = null; }
    if (this.overallChart) { this.overallChart.destroy(); this.overallChart = null; }
  }

  private createPriceChart(): void {
    if (!this.priceChartRef?.nativeElement) return;
    const ctx = this.priceChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 15));
    const prices = this.products.map((p) => p.price);
    const cheapestIdx = this.getPriceComparison().cheapest;
    const backgroundColors = this.products.map((_, i) => i === cheapestIdx ? 'rgba(16, 185, 129, 0.8)' : `rgba(124, 58, 237, ${0.7 - i * 0.1})`);
    const borderColors = this.products.map((_, i) => i === cheapestIdx ? 'rgba(16, 185, 129, 1)' : 'rgba(124, 58, 237, 1)');

    this.priceChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Precio', data: prices, backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 2, borderRadius: 12, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8,
            callbacks: {
              title: (items) => this.products[items[0].dataIndex].name,
              label: (context) => ` ${this.formatPrice(context.raw as number)}`,
              afterLabel: (context) => context.dataIndex === cheapestIdx ? '  Mejor precio' : '',
            },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { callback: (value) => '$' + ((value as number) / 1000).toFixed(0) + 'k', font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' } } },
        },
      },
    });
  }

  private createRadarChart(): void {
    if (!this.radarChartRef?.nativeElement || this.productScores.length === 0) return;
    const ctx = this.radarChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const dimensions = this.getRadarDimensions();
    const datasets = this.products.map((product, i) => {
      const score = this.productScores[i];
      const data = dimensions.map((d) => score?.breakdown[d.key] || 0);
      return {
        label: this.truncateLabel(product.brand, 12), data,
        backgroundColor: this.getRadarColor(i, 0.2), borderColor: this.getRadarColor(i, 1), borderWidth: 2,
        pointBackgroundColor: this.getRadarColor(i, 1), pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7,
      };
    });

    this.radarChart = new Chart(ctx, {
      type: 'radar',
      data: { labels: dimensions.map((d) => d.label), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8,
            callbacks: { label: (context) => ` ${context.dataset.label}: ${context.raw}/100` },
          },
        },
        scales: {
          r: { beginAtZero: true, max: 100, ticks: { stepSize: 20, font: { size: 10 }, backdropColor: 'transparent' }, pointLabels: { font: { size: 11, weight: 'bold' } }, grid: { color: 'rgba(0, 0, 0, 0.1)' }, angleLines: { color: 'rgba(0, 0, 0, 0.1)' } },
        },
      },
    });
  }

  private createValueChart(): void {
    if (!this.valueChartRef?.nativeElement || this.productScores.length === 0) return;
    const ctx = this.valueChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 12));
    const bestValueIdx = this.getBestValueIndex();

    this.valueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Especificaciones', data: this.productScores.map((s) => s.specsScore), backgroundColor: 'rgba(124, 58, 237, 0.7)', borderColor: 'rgba(124, 58, 237, 1)', borderWidth: 2, borderRadius: 8 },
          { label: 'Precio', data: this.productScores.map((s) => s.priceScore), backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: 'rgba(16, 185, 129, 1)', borderWidth: 2, borderRadius: 8 },
          { label: 'Calidad-Precio', data: this.productScores.map((s) => s.valueScore), backgroundColor: 'rgba(245, 158, 11, 0.7)', borderColor: 'rgba(245, 158, 11, 1)', borderWidth: 2, borderRadius: 8 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8,
            callbacks: { title: (items) => this.products[items[0].dataIndex].name, afterBody: (items) => items[0].dataIndex === bestValueIdx ? '\nMejor calidad-precio' : '' },
          },
        },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0, 0, 0, 0.05)' }, ticks: { callback: (value) => value + ' pts', font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' } } },
        },
      },
    });
  }

  private createOverallChart(): void {
    if (!this.overallChartRef?.nativeElement || this.productScores.length === 0) return;
    const ctx = this.overallChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.products.map((p) => this.truncateLabel(p.brand, 12));
    const bestOverallIdx = this.getOverallBestIndex();
    const backgroundColors = this.products.map((_, i) => i === bestOverallIdx ? 'rgba(16, 185, 129, 0.8)' : ['rgba(124, 58, 237, 0.7)', 'rgba(37, 99, 235, 0.7)', 'rgba(245, 158, 11, 0.7)'][i % 3]);
    const borderColors = this.products.map((_, i) => i === bestOverallIdx ? 'rgba(16, 185, 129, 1)' : ['rgba(124, 58, 237, 1)', 'rgba(37, 99, 235, 1)', 'rgba(245, 158, 11, 1)'][i % 3]);

    this.overallChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: this.productScores.map((s) => s.totalScore), backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 2, hoverOffset: 10 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true, padding: 15, font: { size: 11 },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const score = this.productScores[i]?.totalScore || 0;
                    return { text: `${label}: ${score} pts${i === bestOverallIdx ? ' (TOP)' : ''}`, fillStyle: backgroundColors[i], strokeStyle: borderColors[i], lineWidth: 2, hidden: false, index: i, pointStyle: 'circle' };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 13 }, padding: 12, cornerRadius: 8,
            callbacks: {
              title: (items) => this.products[items[0].dataIndex].name,
              label: (context) => ` Puntuación: ${context.raw} / 100 pts`,
              afterLabel: (context) => {
                const idx = context.dataIndex;
                const score = this.productScores[idx];
                let details = `\n  - Specs: ${score.specsScore} pts\n  - Precio: ${score.priceScore} pts\n  - Valor: ${score.valueScore} pts`;
                if (idx === bestOverallIdx) details += '\n\nMejor opción global';
                return details;
              },
            },
          },
        },
      },
    });
  }

  // 💡 NUEVO: El radar ahora es inteligente y genera las dimensiones para componentes desconocidos
  private getRadarDimensions(): { key: string; label: string }[] {
    const cat = this.normalizedCategory;

    if (cat.includes('notebook') || cat.includes('tablet')) {
      return [{ key: 'processor', label: 'Procesador' }, { key: 'ram', label: 'RAM' }, { key: 'storage', label: 'Almacenamiento' }, { key: 'screen', label: 'Pantalla' }, { key: 'ratings', label: 'Valoración' }];
    }
    if (cat.includes('mouse')) {
      return [{ key: 'dpi', label: 'DPI' }, { key: 'buttons', label: 'Botones' }, { key: 'weight', label: 'Peso' }, { key: 'ratings', label: 'Valoración' }];
    }
    if (cat.includes('video') || cat.includes('placa')) {
      return [{ key: 'graphics', label: 'Memoria VRAM' }, { key: 'processor', label: 'Potencia de Chip' }, { key: 'ratings', label: 'Valoración' }];
    }
    if (cat.includes('procesador')) {
      return [{ key: 'processor', label: 'Multinúcleo' }, { key: 'generation', label: 'Potencia Single-Core' }, { key: 'ratings', label: 'Valoración' }];
    }
    
    // Si no es ninguno de los de arriba (Ej: Memorias RAM), busca qué claves tienen números y grafica esas
    const keys = this.getCharacteristicKeys();
    const dynamicKeys = keys.filter(k => this.productScores.some(s => s.breakdown[k] > 0)).slice(0, 5);
    
    if (dynamicKeys.length > 0) {
      return dynamicKeys.map(k => ({ key: k, label: k.replace(/_/g, ' ').toUpperCase() }));
    }

    return [{ key: 'ratings', label: 'Valoración' }];
  }

  private getRadarColor(index: number, alpha: number): string {
    const colors = [`rgba(124, 58, 237, ${alpha})`, `rgba(37, 99, 235, ${alpha})`, `rgba(16, 185, 129, ${alpha})`, `rgba(245, 158, 11, ${alpha})`];
    return colors[index % colors.length];
  }

  private truncateLabel(text: string, maxLength: number): string {
    if (!text) return 'Producto';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  seeDetails(product: ProductI): void {
    this.router.navigate(['/producto', product.id], { 
      queryParams: { store: product.storeId } 
    });
  }
}