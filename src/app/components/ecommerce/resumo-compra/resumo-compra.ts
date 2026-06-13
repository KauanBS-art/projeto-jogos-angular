import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PedidoResponse } from '../../../services/pedido.service';

import { JogoService } from '../../../services/jogo.service';

@Component({
  selector: 'app-resumo-compra',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './resumo-compra.html',
  styleUrl: './resumo-compra.css'
})
export class ResumoCompra {
  readonly pedido: PedidoResponse | null = this.readPedido();

  constructor(private jogoService: JogoService) {}

  private readPedido(): PedidoResponse | null {
    const raw = sessionStorage.getItem('ultimo-pedido');
    return raw ? JSON.parse(raw) as PedidoResponse : null;
  }

  getImagemUrl(nomeImagem: string): string | null {
    return this.jogoService.getImagemUrl(nomeImagem);
  }
}
