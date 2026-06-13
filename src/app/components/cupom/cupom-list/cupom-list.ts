import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Cupom, CupomService } from '../../../services/cupom.service';

@Component({
  selector: 'app-cupom-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="list-container">
      <div class="header">
        <h1>Cupons de Desconto</h1>
        <a mat-raised-button color="primary" routerLink="/adm/cupons/new">Novo Cupom</a>
      </div>

      <table mat-table [dataSource]="cupons" class="mat-elevation-z8">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef> ID </th>
          <td mat-cell *matCellDef="let c"> {{ c.id }} </td>
        </ng-container>

        <ng-container matColumnDef="descricao">
          <th mat-header-cell *matHeaderCellDef> Descrição </th>
          <td mat-cell *matCellDef="let c"> {{ c.descricao }} </td>
        </ng-container>

        <ng-container matColumnDef="codigo">
          <th mat-header-cell *matHeaderCellDef> Código </th>
          <td mat-cell *matCellDef="let c"> {{ c.codigo }} </td>
        </ng-container>

        <ng-container matColumnDef="percentual">
          <th mat-header-cell *matHeaderCellDef> Desconto </th>
          <td mat-cell *matCellDef="let c"> {{ c.percentualDesconto }}% </td>
        </ng-container>

        <ng-container matColumnDef="ativo">
          <th mat-header-cell *matHeaderCellDef> Ativo </th>
          <td mat-cell *matCellDef="let c"> {{ c.ativo ? 'Sim' : 'Não' }} </td>
        </ng-container>

        <ng-container matColumnDef="acoes">
          <th mat-header-cell *matHeaderCellDef> Ações </th>
          <td mat-cell *matCellDef="let c">
            <a mat-icon-button color="primary" [routerLink]="['/adm/cupons/edit', c.id]">
              <mat-icon>edit</mat-icon>
            </a>
            <button mat-icon-button color="warn" (click)="remover(c.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="colunas"></tr>
        <tr mat-row *matRowDef="let row; columns: colunas;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .list-container { padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    table { width: 100%; }
  `]
})
export class CupomList implements OnInit {
  private readonly cupomService = inject(CupomService);
  private readonly snackBar = inject(MatSnackBar);

  cupons: Cupom[] = [];
  colunas = ['id', 'codigo', 'descricao', 'percentual', 'ativo', 'acoes'];

  ngOnInit(): void {
    this.carregarCupons();
  }

  carregarCupons(): void {
    this.cupomService.listar().subscribe({
      next: (cupons: Cupom[]) => this.cupons = cupons,
      error: () => this.snackBar.open('Erro ao carregar cupons.', 'Fechar')
    });
  }

  remover(id: number): void {
    if (confirm('Deseja realmente remover este cupom?')) {
      this.cupomService.remover(id).subscribe({
        next: () => {
          this.snackBar.open('Cupom removido.', 'Fechar', { duration: 2500 });
          this.carregarCupons();
        },
        error: () => this.snackBar.open('Erro ao remover cupom.', 'Fechar')
      });
    }
  }
}
