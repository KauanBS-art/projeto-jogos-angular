import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Jogo } from '../../../models/jogo.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { AuthService } from '../../../services/auth.service';
import { JogoService } from '../../../services/jogo.service';
import { ListaDesejosService } from '../../../services/lista-desejos.service';

@Component({
  selector: 'app-promocoes',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './promocoes.html',
  styleUrl: './promocoes.css'
})
export class PromocoesComponent implements OnInit {
  allJogos: Jogo[] = [];
  jogos: Jogo[] = [];
  loading = true;
  termoBusca = '';
  categoriaSelecionada = '';
  plataformaSelecionada = '';
  precoMin: number | null = null;
  precoMax: number | null = null;

  constructor(
    private jogoService: JogoService,
    private carrinhoService: CarrinhoService,
    private listaDesejosService: ListaDesejosService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarJogos();
    if (this.authService.isLoggedIn()) {
      this.listaDesejosService.carregar().subscribe();
    }
  }

  get categorias(): string[] {
    return [...new Set(this.allJogos.flatMap(jogo => jogo.categorias ?? []))].sort();
  }

  get plataformas(): string[] {
    return [...new Set(this.allJogos.flatMap(jogo => jogo.plataformas ?? []))].sort();
  }

  carregarJogos(): void {
    this.loading = true;
    const request = this.termoBusca.trim()
      ? this.jogoService.findPromocoesByNomeWithHeaders(this.termoBusca.trim(), 0, 100)
      : this.jogoService.findPromocoesWithHeaders(0, 100);

    request.subscribe({
      next: response => {
        this.allJogos = response.body ?? [];
        this.aplicarFiltros();
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Não foi possivel carregar as promoções.', 'Fechar', { duration: 2500 });
        this.changeDetector.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    this.jogos = this.allJogos.filter(jogo => {
      const categoriaOk = !this.categoriaSelecionada || (jogo.categorias ?? []).includes(this.categoriaSelecionada);
      const plataformaOk = !this.plataformaSelecionada || (jogo.plataformas ?? []).includes(this.plataformaSelecionada);
      const precoMinOk = this.precoMin == null || (jogo.precoComDesconto ?? jogo.preco) >= this.precoMin;
      const precoMaxOk = this.precoMax == null || (jogo.precoComDesconto ?? jogo.preco) <= this.precoMax;
      return categoriaOk && plataformaOk && precoMinOk && precoMaxOk;
    });
  }

  adicionarCarrinho(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Faça login para adicionar itens ao carrinho.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/promocoes' } });
      return;
    }

    this.carrinhoService.adicionar(jogo);
    this.snackBar.open('Jogo adicionado ao carrinho.', 'Ver carrinho', { duration: 2500 })
      .onAction()
      .subscribe(() => this.router.navigate(['/carrinho']));
  }

  verDetalhe(jogo: Jogo): void {
    this.router.navigate(['/jogos', jogo.id]);
  }

  alternarDesejo(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/promocoes' } });
      return;
    }

    const request = this.listaDesejosService.contem(jogo.id)
      ? this.listaDesejosService.remover(jogo.id)
      : this.listaDesejosService.adicionar(jogo.id);

    request.subscribe();
  }

  estaNosDesejos(jogo: Jogo): boolean {
    return this.listaDesejosService.contem(jogo.id);
  }

  getImagemUrl(jogo: Jogo): string | null {
    return this.jogoService.getImagemUrl(jogo.nomeImagem);
  }
}
