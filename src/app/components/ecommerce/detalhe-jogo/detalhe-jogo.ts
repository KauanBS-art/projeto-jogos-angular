import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Jogo } from '../../../models/jogo.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { AuthService } from '../../../services/auth.service';
import { JogoService } from '../../../services/jogo.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';

@Component({
  selector: 'app-detalhe-jogo',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './detalhe-jogo.html',
  styleUrl: './detalhe-jogo.css'
})
export class DetalheJogo implements OnInit {
  jogo: Jogo | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogoService: JogoService,
    private carrinhoService: CarrinhoService,
    private listaDesejosService: ListaDesejosService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.jogoService.findById(id).subscribe({
      next: jogo => {
        this.jogo = jogo;
        this.loading = false;
        if (this.authService.isLoggedIn()) {
          this.listaDesejosService.carregar().subscribe();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Jogo nao encontrado.', 'Fechar', { duration: 2500 });
        this.router.navigate(['/']);
      }
    });
  }

  adicionarCarrinho(): void {
    if (!this.jogo) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Faça login para adicionar itens ao carrinho.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { redirectTo: `/jogos/${this.jogo.id}` } });
      return;
    }

    this.carrinhoService.adicionar(this.jogo);
    this.router.navigate(['/carrinho']);
  }

  getImagemUrl(jogo: Jogo): string | null {
    return this.jogoService.getImagemUrl(jogo.nomeImagem);
  }

  alternarDesejo(): void {
    if (!this.jogo) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: `/jogos/${this.jogo.id}` } });
      return;
    }

    const request = this.listaDesejosService.contem(this.jogo.id)
      ? this.listaDesejosService.remover(this.jogo.id)
      : this.listaDesejosService.adicionar(this.jogo.id);

    request.subscribe();
  }

  estaNosDesejos(): boolean {
    return this.jogo ? this.listaDesejosService.contem(this.jogo.id) : false;
  }
}
