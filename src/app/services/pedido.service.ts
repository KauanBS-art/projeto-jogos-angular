import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CarrinhoItem } from './carrinho.service';
import { Endereco } from '../models/usuario.model';

export interface PedidoPayload {
  itens: Array<{
    idJogo: number;
    quantidade: number;
  }>;
  idModoPagamento: number;
  idCartaoCredito?: number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  cidade?: string;
  bairro?: string;
  complemento?: string;
  estado?: string;
  idEndereco?: number | null;
  codigoCupom?: string;
}

export interface PedidoResponse {
  id: number;
  dataPedido: string;
  valorOriginal: number;
  valorDesconto: number;
  valorTotal: number;
  codigoCupom?: string;
  modoPagamento: string;
  status: string;
  itens: {
    idJogo: number;
    tituloJogo: string;
    precoUnitario: number;
    quantidade: number;
    nomeImagem?: string;
  }[];
}

export interface PedidoRequest {
  idModoPagamento: number;
  idCartaoCredito?: number;
  codigoCupom?: string;
  idEndereco?: number | null;
  cep?: string;
  logradouro?: string;
  numero?: string;
  cidade?: string;
  bairro?: string;
  complemento?: string;
  estado?: string;
  itens: Array<{
    idJogo: number;
    quantidade: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly api = 'http://localhost:8080/pedidos';

  constructor(private httpClient: HttpClient) {}

  criarPedido(
    itens: CarrinhoItem[],
    dadosEntrega: Omit<PedidoPayload, 'itens'>
  ): Observable<PedidoResponse> {
    const payload: PedidoPayload = {
      ...dadosEntrega,
      itens: itens.map(item => ({
        idJogo: item.jogo.id,
        quantidade: item.quantidade
      }))
    };

    return this.httpClient.post<PedidoResponse>(this.api, payload);
  }

  meusPedidos(): Observable<PedidoResponse[]> {
    return this.httpClient.get<PedidoResponse[]>(`${this.api}/meus-pedidos`);
  }
}
