import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HolidayApiResponse } from '../models/holiday';

const HOLIDAY_CACHE_KEY = `medcal_holidays_${environment.holidayApi.country}_${environment.holidayApi.year}`;

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private http = inject(HttpClient);
  private cache = new Map<string, string>();
  private fetched = this.loadFromStorage();

  getHolidays(): Observable<Map<string, string>> {
    if (this.fetched) {
      return of(this.cache);
    }

    const params = new HttpParams()
      .set('key', environment.holidayApi.key)
      .set('country', environment.holidayApi.country)
      .set('year', environment.holidayApi.year.toString());

    return this.http.get<HolidayApiResponse>(environment.holidayApi.baseUrl, { params }).pipe(
      tap((response) => {
        response.holidays.forEach((h) => {
          this.cache.set(h.date, h.name);
        });
        this.fetched = true;
        this.saveToStorage();
      }),
      map(() => this.cache),
    );
  }

  private loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(HOLIDAY_CACHE_KEY);
      if (!raw) return false;

      this.cache = new Map<string, string>(JSON.parse(raw));
      return this.cache.size > 0;
    } catch {
      return false;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify([...this.cache]));
    } catch {}
  }
}
