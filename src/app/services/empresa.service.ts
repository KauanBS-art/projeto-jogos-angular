import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { PageResult } from '../models/page-result.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly api = 'http://localhost:8080/empresas';

  constructor(private httpClient: HttpClient) {}

  private createPaginationParams(page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page).set('pageSize', pageSize);
    }
    return params;
  }

  findAllWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Empresa[]>> {
    return this.httpClient.get<Empresa[]>(this.api, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Empresa[]>> {
    return this.httpClient.get<Empresa[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPage(page: number, pageSize: number, nome: string): Observable<PageResult<Empresa>> {
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

  findAll(): Observable<PageResult<Empresa>> {
    return this.findPage(0, 1000, '');
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findById(id: number): Observable<Empresa> {
    return this.httpClient.get<Empresa>(`${this.api}/${id}`);
  }

  create(empresa: Empresa): Observable<Empresa> {
    return this.httpClient.post<Empresa>(this.api, {
      nome: empresa.nome,
      paisOrigem: empresa.paisOrigem,
      descricao: empresa.descricao
    });
  }

  update(empresa: Empresa): Observable<Empresa> {
    return this.httpClient.put<Empresa>(`${this.api}/${empresa.id}`, {
      nome: empresa.nome,
      paisOrigem: empresa.paisOrigem,
      descricao: empresa.descricao
    });
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }
}
