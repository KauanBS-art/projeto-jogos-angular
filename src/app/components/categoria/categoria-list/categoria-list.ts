import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';
import { getPortuguesePaginatorIntl } from '../../../shared/portuguese-paginator';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, RouterLink],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css'
})
export class CategoriaList implements OnInit {
  readonly displayedColumns = ['numero', 'nome', 'totalJogos', 'acao'];
  items: Categoria[] = [];
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  constructor(
    private categoriaService: CategoriaService,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const request = this.termoBusca.trim()
      ? this.categoriaService.findByNomeWithHeaders(this.termoBusca.trim(), this.page, this.pageSize)
      : this.categoriaService.findAllWithHeaders(this.page, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.items = response.body ?? [];
        this.totalRecords = Number(response.headers.get('X-Total-Count') ?? 0);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.snackBar.open('Nao foi possivel carregar categorias.', 'Fechar', {
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

  excluir(item: Categoria): void {
    if (!window.confirm(`Deseja excluir a categoria "${item.nome}"?`)) {
      return;
    }

    this.categoriaService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('Categoria excluida com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.carregarDados();
      },
      error: () => this.snackBar.open('Nao foi possivel excluir a categoria.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
