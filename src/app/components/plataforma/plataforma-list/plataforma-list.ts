import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Plataforma } from '../../../models/plataforma.model';
import { PlataformaService } from '../../../services/plataforma.service';
import { getPortuguesePaginatorIntl } from '../../../shared/portuguese-paginator';

@Component({
  selector: 'app-plataforma-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, RouterLink],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './plataforma-list.html',
  styleUrl: './plataforma-list.css'
})
export class PlataformaList implements OnInit {
  readonly displayedColumns = ['numero', 'nome', 'totalJogos', 'acao'];
  items: Plataforma[] = [];
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  constructor(
    private plataformaService: PlataformaService,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const request = this.termoBusca.trim()
      ? this.plataformaService.findByNomeWithHeaders(this.termoBusca.trim(), this.page, this.pageSize)
      : this.plataformaService.findAllWithHeaders(this.page, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.items = response.body ?? [];
        this.totalRecords = Number(response.headers.get('X-Total-Count') ?? 0);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.snackBar.open('Nao foi possivel carregar plataformas.', 'Fechar', {
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

  excluir(item: Plataforma): void {
    if (!window.confirm(`Deseja excluir a plataforma "${item.nome}"?`)) {
      return;
    }

    this.plataformaService.delete(item.id).subscribe({
      next: () => {
        this.snackBar.open('Plataforma excluida com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.carregarDados();
      },
      error: () => this.snackBar.open('Nao foi possivel excluir a plataforma.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
