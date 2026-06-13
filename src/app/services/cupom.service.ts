import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Cupom {
  id: number;
  descricao?: string | null;
  codigo: string;
  percentualDesconto: number;
  ativo: boolean;
  restricaoCategoria?: string;
  restricaoPlataforma?: string;
  restricaoEmpresa?: string | null;
  primeiraCompra?: boolean | null;
  restricaoPrecoMinimo?: number | null;
  restricaoPrecoMaximo?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CupomService {
  private readonly api = 'http://localhost:8080/cupons';

  constructor(private httpClient: HttpClient) {}

  listar(): Observable<Cupom[]> {
    return this.httpClient.get<Cupom[]>(this.api);
  }

  buscarPorId(id: number): Observable<Cupom> {
    return this.httpClient.get<Cupom>(`${this.api}/${id}`);
  }

  validar(codigo: string): Observable<Cupom> {
    return this.httpClient.get<Cupom>(`${this.api}/validar/${encodeURIComponent(codigo.trim())}`);
  }

  criar(cupom: Partial<Cupom>): Observable<Cupom> {
    return this.httpClient.post<Cupom>(this.api, cupom);
  }

  atualizar(id: number, cupom: Partial<Cupom>): Observable<Cupom> {
    return this.httpClient.put<Cupom>(`${this.api}/${id}`, cupom);
  }

  remover(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
