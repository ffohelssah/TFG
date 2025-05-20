import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Card } from '../models/card';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiUrl}/cards`;

  constructor(private http: HttpClient) { }

  getUserCards(): Observable<Card[]> {
    return this.http.get<{ cards: Card[] }>(this.apiUrl)
      .pipe(
        map(response => response.cards || [])
      );
  }

  getCardById(id: number): Observable<Card> {
    return this.http.get<{ card: Card }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.card)
      );
  }

  createCard(cardData: FormData): Observable<Card> {
    return this.http.post<{ card: Card, message: string }>(this.apiUrl, cardData)
      .pipe(
        map(response => response.card)
      );
  }

  updateCard(id: number, cardData: FormData): Observable<Card> {
    return this.http.put<{ card: Card, message: string }>(`${this.apiUrl}/${id}`, cardData)
      .pipe(
        map(response => response.card)
      );
  }

  deleteCard(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 