import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Jogo } from '../../../models/jogo.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { JogoService } from '../../../services/jogo.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista-desejos',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './lista-desejos.html',
  styleUrl: './lista-desejos.css'
})
export class ListaDesejos implements OnInit {
  private readonly listaDesejosService = inject(ListaDesejosService);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly jogoService = inject(JogoService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly itens = this.listaDesejosService.items;
  loading = true;

  ngOnInit(): void {
    this.listaDesejosService.carregar().subscribe({ complete: () => this.loading = false });
  }

  remover(idJogo: number): void {
    this.listaDesejosService.remover(idJogo).subscribe();
  }

  comprar(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Faça login para adicionar itens ao carrinho.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/lista-desejos' } });
      return;
    }

    this.carrinhoService.adicionar(jogo);
    this.router.navigate(['/carrinho']);
  }

  getImagemUrl(jogo: Jogo): string | null {
    return this.jogoService.getImagemUrl(jogo.nomeImagem);
  }
}
