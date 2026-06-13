import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Jogo } from '../models/jogo.model';
import { PageResult } from '../models/page-result.model';

@Injectable({
  providedIn: 'root'
})
export class JogoService {
  private readonly api = 'http://localhost:8080/jogos';

  constructor(private httpClient: HttpClient) {}

  private createPaginationParams(page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page).set('pageSize', pageSize);
    }
    return params;
  }

  findAllWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Jogo[]>> {
    return this.httpClient.get<Jogo[]>(this.api, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Jogo[]>> {
    return this.httpClient.get<Jogo[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPromocoesWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Jogo[]>> {
    return this.httpClient.get<Jogo[]>(`${this.api}/promocoes`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPromocoesByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Jogo[]>> {
    return this.httpClient.get<Jogo[]>(`${this.api}/promocoes/search/nome/${encodeURIComponent(nome)}`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPage(page: number, pageSize: number, termo: string): Observable<PageResult<Jogo>> {
    const request = termo?.trim()
      ? this.findByNomeWithHeaders(termo.trim(), page, pageSize)
      : this.findAllWithHeaders(page, pageSize);

    return this.mapResponseToPage(request, page, pageSize);
  }

  findPromocoesPage(page: number, pageSize: number, termo: string): Observable<PageResult<Jogo>> {
    const request = termo?.trim()
      ? this.findPromocoesByNomeWithHeaders(termo.trim(), page, pageSize)
      : this.findPromocoesWithHeaders(page, pageSize);

    return this.mapResponseToPage(request, page, pageSize);
  }

  private mapResponseToPage(request: Observable<HttpResponse<Jogo[]>>, page: number, pageSize: number): Observable<PageResult<Jogo>> {
    return request.pipe(map((response) => ({
      items: response.body ?? [],
      total: Number(response.headers.get('X-Total-Count') ?? 0),
      page: Number(response.headers.get('X-Page') ?? page),
      pageSize: Number(response.headers.get('X-Page-Size') ?? pageSize)
    })));
  }

  count(): Observable<number> {
    return this.httpClient.get<number>(`${this.api}/count`);
  }

  findById(id: number): Observable<Jogo> {
    return this.httpClient.get<Jogo>(`${this.api}/${id}`);
  }

  create(jogo: Jogo): Observable<Jogo> {
    return this.httpClient.post<Jogo>(this.api, {
      titulo: jogo.titulo,
      descricao: jogo.descricao,
      preco: jogo.preco,
      estoque: jogo.estoque,
      percentualDesconto: jogo.percentualDesconto,
      dataLancamento: jogo.dataLancamento,
      idEmpresa: jogo.idEmpresa,
      idPlataformas: jogo.idPlataformas,
      idCategorias: jogo.idCategorias
    });
  }

  update(jogo: Jogo): Observable<Jogo> {
    return this.httpClient.put<Jogo>(`${this.api}/${jogo.id}`, {
      titulo: jogo.titulo,
      descricao: jogo.descricao,
      preco: jogo.preco,
      estoque: jogo.estoque,
      percentualDesconto: jogo.percentualDesconto,
      dataLancamento: jogo.dataLancamento,
      idEmpresa: jogo.idEmpresa,
      idPlataformas: jogo.idPlataformas,
      idCategorias: jogo.idCategorias
    });
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  uploadImagem(idJogo: number, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('idJogo', String(idJogo));
    formData.append('file', file);
    return this.httpClient.patch<void>(`${this.api}/image/upload`, formData);
  }

  getImagemUrl(nomeImagem?: string): string | null {
    if (!nomeImagem) {
      return null;
    }

    return `${this.api}/image/download/${encodeURIComponent(nomeImagem)}`;
  }
}
