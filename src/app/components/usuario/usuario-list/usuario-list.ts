import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';
import { getPortuguesePaginatorIntl } from '../../../shared/portuguese-paginator';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatSnackBarModule, MatTableModule, RouterLink],
  providers: [{ provide: MatPaginatorIntl, useFactory: getPortuguesePaginatorIntl }],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css'
})
export class UsuarioList implements OnInit {
  readonly displayedColumns = ['numero', 'nome', 'email', 'perfil', 'acao'];
  items: Usuario[] = [];
  totalRecords = 0;
  page = 0;
  pageSize = 8;
  termoBusca = '';

  constructor(
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    const request = this.termoBusca.trim()
      ? this.usuarioService.findByNomeWithHeaders(this.termoBusca.trim(), this.page, this.pageSize)
      : this.usuarioService.findAllWithHeaders(this.page, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.items = response.body ?? [];
        this.totalRecords = Number(response.headers.get('X-Total-Count') ?? 0);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.snackBar.open('Nao foi possivel carregar usuarios.', 'Fechar', {
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

  obterPerfil(usuario: Usuario): string {
    return usuario.perfil?.label ?? (usuario.idPerfil === 1 ? 'Adm' : 'User');
  }

  excluir(item: Usuario): void {
    if (!window.confirm(`Deseja excluir o usuario "${item.nome}"?`)) {
      return;
    }

    this.usuarioService.delete(item.id!).subscribe({
      next: () => {
        this.snackBar.open('Usuario excluido com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.carregarDados();
      },
      error: () => this.snackBar.open('Nao foi possivel excluir o usuario.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
