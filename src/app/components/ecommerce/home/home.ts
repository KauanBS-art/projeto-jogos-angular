import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { Cupom, CupomService } from '../../../services/cupom.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  allJogos: Jogo[] = [];
  jogos: Jogo[] = [];
  jogosEmPromocao: Jogo[] = [];
  cupons: Cupom[] = [];
  loading = true;
  termoBusca = '';
  categoriaSelecionada = '';
  plataformaSelecionada = '';
  precoMin: number | null = null;
  precoMax: number | null = null;
  heroIndex = 0;

  readonly heroSlides = [
    {
      image: '/key-arts/key-art-sea-of-thieves.jpg',
      alt: 'Arte promocional de Sea of Thieves',
      kicker: 'Aventura em alta',
      title: 'Explore mundos novos'
    },
    {
      image: '/key-arts/key-art-halo.jpg',
      alt: 'Arte promocional de Halo',
      kicker: 'Acao e ficcao cientifica',
      title: 'Grandes franquias digitais'
    },
    {
      image: '/key-arts/key-art-god-of-war-ragnarok.jpg',
      alt: 'Arte promocional de God of War Ragnarok',
      kicker: 'Campanhas marcantes',
      title: 'Historias para jogar hoje'
    },
    {
      image: '/key-arts/key-art-splatoon-3.png',
      alt: 'Arte promocional de Splatoon 3',
      kicker: 'Diversao competitiva',
      title: 'Ofertas para todos os estilos'
    },
    {
      image: '/key-arts/key-art-blades-of-fire.jpg',
      alt: 'Arte promocional de Blades of Fire',
      kicker: 'Lancamentos selecionados',
      title: 'Monte sua biblioteca'
    },
    {
      image: '/key-arts/key-art-towerborne.jpg',
      alt: 'Arte promocional de Towerborne',
      kicker: 'Cooperativo e aventura',
      title: 'Jogue do seu jeito'
    }
  ];

  private heroInterval?: ReturnType<typeof setInterval>;

  constructor(
    private jogoService: JogoService,
    private carrinhoService: CarrinhoService,
    private listaDesejosService: ListaDesejosService,
    private cupomService: CupomService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarJogos();
    this.carregarCupons();
    this.startHeroCarousel();
    if (this.authService.isLoggedIn()) {
      this.listaDesejosService.carregar().subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.heroInterval) {
      clearInterval(this.heroInterval);
    }
  }

  get categorias(): string[] {
    return [...new Set(this.allJogos.flatMap(jogo => jogo.categorias ?? []))].sort();
  }

  get plataformas(): string[] {
    return [...new Set(this.allJogos.flatMap(jogo => jogo.plataformas ?? []))].sort();
  }

  get activeHeroSlide() {
    return this.heroSlides[this.heroIndex];
  }

  nextHeroSlide(): void {
    this.heroIndex = (this.heroIndex + 1) % this.heroSlides.length;
  }

  previousHeroSlide(): void {
    this.heroIndex = (this.heroIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  setHeroSlide(index: number): void {
    this.heroIndex = index;
  }

  carregarJogos(): void {
    this.loading = true;
    const request = this.termoBusca.trim()
      ? this.jogoService.findByNomeWithHeaders(this.termoBusca.trim(), 0, 100)
      : this.jogoService.findAllWithHeaders(0, 100);

    request.subscribe({
      next: response => {
        this.allJogos = response.body ?? [];
        this.jogosEmPromocao = this.allJogos.filter(j => j.percentualDesconto && j.percentualDesconto > 0).slice(0, 4);
        this.aplicarFiltros();
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Nao foi possivel carregar os jogos.', 'Fechar', { duration: 2500 });
        this.changeDetector.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    this.jogos = this.allJogos.filter(jogo => {
      const categoriaOk = !this.categoriaSelecionada || (jogo.categorias ?? []).includes(this.categoriaSelecionada);
      const plataformaOk = !this.plataformaSelecionada || (jogo.plataformas ?? []).includes(this.plataformaSelecionada);
      const precoMinOk = this.precoMin == null || jogo.preco >= this.precoMin;
      const precoMaxOk = this.precoMax == null || jogo.preco <= this.precoMax;
      return categoriaOk && plataformaOk && precoMinOk && precoMaxOk;
    });
  }

  adicionarSomente(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Faça login para adicionar itens ao carrinho.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/' } });
      return;
    }

    this.carrinhoService.adicionar(jogo);
    this.snackBar.open('Jogo adicionado ao carrinho.', 'Fechar', { duration: 2000 });
  }

  comprarAgora(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Faça login para comprar.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/' } });
      return;
    }

    this.carrinhoService.adicionar(jogo);
    this.router.navigate(['/carrinho']);
  }

  verDetalhe(jogo: Jogo): void {
    this.router.navigate(['/jogos', jogo.id]);
  }

  alternarDesejo(jogo: Jogo): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/' } });
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

  carregarCupons(): void {
    this.cupomService.listar().subscribe(res => {
      this.cupons = res.filter(c => c.ativo);
      this.changeDetector.detectChanges();
    });
  }

  private startHeroCarousel(): void {
    this.heroInterval = setInterval(() => this.nextHeroSlide(), 5200);
  }
}
