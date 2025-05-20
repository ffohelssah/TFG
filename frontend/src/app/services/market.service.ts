import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Market } from '../models/market';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = `${environment.apiUrl}/market`;

  constructor(private http: HttpClient) { }

  getListings(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params })
      .pipe(
        tap(response => {
          console.log('Original API response:', response);
          return response;
        })
      );
  }

  getListingById(id: number): Observable<Market> {
    return this.http.get<{ listing: Market }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.listing)
      );
  }

  getUserListings(): Observable<Market[]> {
    return this.http.get<{ listings: Market[] }>(`${this.apiUrl}/user/listings`)
      .pipe(
        map(response => response.listings || [])
      );
  }

  listCard(data: { cardId: number, price: number, description?: string }): Observable<Market> {
    return this.http.post<{ listing: Market, message: string }>(this.apiUrl, data)
      .pipe(
        map(response => response.listing)
      );
  }

  updateListing(id: number, data: { price?: number, description?: string }): Observable<Market> {
    return this.http.put<{ listing: Market, message: string }>(`${this.apiUrl}/${id}`, data)
      .pipe(
        map(response => response.listing)
      );
  }

  deleteListing(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 