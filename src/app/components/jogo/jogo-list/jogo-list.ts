import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Jogo } from '../../../models/jogo.model';
import { JogoService } from '../../../services/jogo.service';
import { getPortuguesePaginatorIntl } from '../../../shared/portuguese-paginator';

@Component({
  selector: 'app-jogo-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatPaginatorModule, MatSnackBarModule, RouterLink],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './jogo-list.html',
  styleUrl: './jogo-list.css'
})
export class JogoList implements OnInit {
  items: Jogo[] = [];
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  constructor(
    private jogoService: JogoService,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const request = this.termoBusca.trim()
      ? this.jogoService.findByNomeWithHeaders(this.termoBusca.trim(), this.page, this.pageSize)
      : this.jogoService.findAllWithHeaders(this.page, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.items = response.body ?? [];
        this.totalRecords = Number(response.headers.get('X-Total-Count') ?? 0);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.snackBar.open('Nao foi possivel carregar jogos.', 'Fechar', {
          duration: 2500,
          panelClass: 'error-snackbar'
        });
        this.changeDetector.detectChanges();
      }
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarDados();
  }

  aplicarBusca(event: Event): void {
    this.termoBusca = (event.target as HTMLInputElement).value;
    this.page = 0;
    this.carregarDados();
  }

  excluir(item: Jogo): void {
    if (!window.confirm(`Deseja excluir o jogo "${item.titulo}"?`)) {
      return;
    }

    this.jogoService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('Jogo excluido com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.carregarDados();
      },
      error: () => this.snackBar.open('Nao foi possivel excluir o jogo.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  getImagemUrl(item: Jogo): string | null {
    return this.jogoService.getImagemUrl(item.nomeImagem);
  }

  ocultarImagem(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
