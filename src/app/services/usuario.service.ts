import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PageResult } from '../models/page-result.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly api = 'http://localhost:8080/usuarios';

  constructor(private httpClient: HttpClient) {}

  private createPaginationParams(page?: number, pageSize?: number): HttpParams {
    let params = new HttpParams();
    if (page !== undefined && pageSize !== undefined) {
      params = params.set('page', page).set('pageSize', pageSize);
    }
    return params;
  }

  findAllWithHeaders(page?: number, pageSize?: number): Observable<HttpResponse<Usuario[]>> {
    return this.httpClient.get<Usuario[]>(this.api, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findByNomeWithHeaders(nome: string, page?: number, pageSize?: number): Observable<HttpResponse<Usuario[]>> {
    return this.httpClient.get<Usuario[]>(`${this.api}/search/nome/${encodeURIComponent(nome)}`, {
      params: this.createPaginationParams(page, pageSize),
      observe: 'response'
    });
  }

  findPage(page: number, pageSize: number, termo: string): Observable<PageResult<Usuario>> {
    const request = termo?.trim()
      ? this.findByNomeWithHeaders(termo.trim(), page, pageSize)
      : this.findAllWithHeaders(page, pageSize);

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

  findById(id: number): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.api}/${id}`);
  }

  create(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.api, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      idPerfil: usuario.idPerfil
    });
  }

  update(usuario: Usuario): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.api}/${usuario.id}`, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha || undefined,
      telefone: usuario.telefone,
      cpf: usuario.cpf,
      idPerfil: usuario.idPerfil
    });
  }

  me(): Observable<Usuario> {
    return this.httpClient.get<Usuario>(`${this.api}/me`);
  }

  updatePerfil(payload: {
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
    senhaConfirmacao: string;
    enderecos: unknown[];
  }): Observable<Usuario> {
    return this.httpClient.put<Usuario>(`${this.api}/me`, payload);
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.httpClient.put<void>(`${this.api}/me/senha`, { senhaAtual, novaSenha });
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/${id}`);
  }

  listarCartoes(): Observable<import('../models/usuario.model').CartaoCreditoResponse[]> {
    return this.httpClient.get<import('../models/usuario.model').CartaoCreditoResponse[]>(`${this.api}/me/cartoes`);
  }

  adicionarCartao(cartao: import('../models/usuario.model').CartaoCredito): Observable<import('../models/usuario.model').CartaoCreditoResponse> {
    return this.httpClient.post<import('../models/usuario.model').CartaoCreditoResponse>(`${this.api}/me/cartoes`, cartao);
  }

  removerCartao(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.api}/me/cartoes/${id}`);
  }
}
