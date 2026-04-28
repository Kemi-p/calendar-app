import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HolidayApiResponse } from '../models/holiday';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private http = inject(HttpClient);
  private cache = new Map<string, string>();
  private fetched = false;

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
      }),
      map(() => this.cache),
    );
  }
}
