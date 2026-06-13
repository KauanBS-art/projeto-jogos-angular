import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Plataforma } from '../models/plataforma.model';
import { PageResult } from '../models/page-result.model';

@Injectable({
  providedIn: 'root'
})
export class PlataformaService {
  private readonly api = 'http://localhost:8080/plataformas';

  constructor(private httpClient: HttpClient) {}

  private createPaginationParams(page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page).set('pageSize', pageSize);
    }
    return params;
  }

  findAllWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Plataforma[]>> {
    return this.httpClient.get<Plataforma[]>(this.api, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Plataforma[]>> {
    return this.httpClient.get<Plataforma[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPage(page: number, pageSize: number, nome: string): Observable<PageResult<Plataforma>> {
    const request = nome?.trim()
      ? this.findByNomeWithHeaders(nome.trim(), page, pageSize)
      : this.findAllWithHeaders(page, pageSize);

    return request.pipe(map((response) => ({
      items: response.body ?? [],
      total: Number(response.headers.get('X-Total-Count') ?? 0),
      page: Number(response.headers.get('X-Page') ?? page),
      pageSize: Number(response.headers.get('X-Page-Size') ?? pageSize)
    })));
  }

  findAll(): Observable<PageResult<Plataforma>> {
    return this.findPage(0, 1000, '');
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findById(id: number): Observable<Plataforma> {
    return this.httpClient.get<Plataforma>(`${this.api}/${id}`);
  }

  create(plataforma: Plataforma): Observable<Plataforma> {
    return this.httpClient.post<Plataforma>(this.api, { nome: plataforma.nome });
  }

  update(plataforma: Plataforma): Observable<Plataforma> {
    return this.httpClient.put<Plataforma>(`${this.api}/${plataforma.id}`, { nome: plataforma.nome });
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
