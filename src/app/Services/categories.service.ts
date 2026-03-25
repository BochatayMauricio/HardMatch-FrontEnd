import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { CategoryI } from '../Interfaces/category.interface';
import { ResponseCategory } from '../Interfaces/response-category.interface';
import { BACKEND_API_URL } from '../../utils/constants';

@Injectable({
	providedIn: 'root',
})
export class CategoriesService {
	private readonly apiUrl = `${BACKEND_API_URL}/categories`;
	private readonly categoriesSubject = new BehaviorSubject<CategoryI[]>([]);
	readonly categories$ = this.categoriesSubject.asObservable();

	constructor(private http: HttpClient) {}

	getAllCategories(): Observable<CategoryI[]> {
		return this.http.get<ResponseCategory<CategoryI[]>>(this.apiUrl).pipe(
			map((response) => (response?.success && response.data ? response.data : [])),
			tap((categories) => this.categoriesSubject.next(categories)),
		);
	}

	getCategoriesState(): Observable<CategoryI[]> {
		return this.categories$;
	}

	getCategoriesSnapshot(): CategoryI[] {
		return this.categoriesSubject.value;
	}

	loadCategoriesIfNeeded(): Observable<CategoryI[]> {
		const cached = this.getCategoriesSnapshot();
		if (cached.length > 0) {
			return of(cached);
		}
		return this.getAllCategories();
	}

	getCategoryById(id: number): Observable<CategoryI | null> {
		return this.http.get<ResponseCategory<CategoryI>>(`${this.apiUrl}/${id}`).pipe(
			map((response) => (response?.success && response.data ? response.data : null)),
		);
	}

	createCategory(category: Omit<CategoryI, 'id'>): Observable<CategoryI> {
		return this.http
			.post<ResponseCategory<CategoryI>>(this.apiUrl, category)
			.pipe(
				map((response) => response.data),
				tap((newCategory) => {
					this.categoriesSubject.next([...this.categoriesSubject.value, newCategory]);
				}),
			);
	}
}
