import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Jogo } from '../models/jogo.model';

@Injectable({
  providedIn: 'root'
})
export class ListaDesejosService {
  private readonly api = 'http://localhost:8080/usuarios/me/lista-desejos';
  private readonly itemsSignal = signal<Jogo[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  constructor(private httpClient: HttpClient) {}

  carregar(): Observable<Jogo[]> {
    return this.httpClient.get<Jogo[]>(this.api).pipe(
      tap(items => this.itemsSignal.set(items ?? []))
    );
  }

  adicionar(idJogo: number): Observable<Jogo[]> {
    return this.httpClient.post<Jogo[]>(`${this.api}/${idJogo}`, {}).pipe(
      tap(items => this.itemsSignal.set(items ?? []))
    );
  }

  remover(idJogo: number): Observable<Jogo[]> {
    return this.httpClient.delete<Jogo[]>(`${this.api}/${idJogo}`).pipe(
      tap(items => this.itemsSignal.set(items ?? []))
    );
  }

  contem(idJogo: number): boolean {
    return this.itemsSignal().some(item => item.id === idJogo);
  }
}
