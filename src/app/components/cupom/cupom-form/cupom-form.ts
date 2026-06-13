import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CupomService } from '../../../services/cupom.service';
import { CategoriaService } from '../../../services/categoria.service';
import { PlataformaService } from '../../../services/plataforma.service';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
  selector: 'app-cupom-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, RouterLink, MatSnackBarModule],
  template: `
    <div class="form-container">
      <h1>{{ isEditing ? 'Editar Cupom' : 'Novo Cupom' }}</h1>
      <form [formGroup]="form" (ngSubmit)="salvar()">
        <mat-form-field appearance="outline">
          <mat-label>Descrição do Cupom</mat-label>
          <input matInput formControlName="descricao" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Desconto (%)</mat-label>
          <input matInput type="number" formControlName="percentualDesconto" />
        </mat-form-field>

        <mat-checkbox formControlName="ativo">Ativo</mat-checkbox>
        <mat-checkbox formControlName="primeiraCompra" style="margin-left: 16px;">Válido apenas para 1ª compra</mat-checkbox>

        <h3>Restrições (Opcionais)</h3>
        
        <mat-form-field appearance="outline">
          <mat-label>Categoria</mat-label>
          <mat-select formControlName="restricaoCategoria">
            <mat-option [value]="null">Nenhuma</mat-option>
            @for (cat of categorias; track cat.id) {
              <mat-option [value]="cat.nome">{{ cat.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Plataforma</mat-label>
          <mat-select formControlName="restricaoPlataforma">
            <mat-option [value]="null">Nenhuma</mat-option>
            @for (plat of plataformas; track plat.id) {
              <mat-option [value]="plat.nome">{{ plat.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Empresa</mat-label>
          <mat-select formControlName="restricaoEmpresa">
            <mat-option [value]="null">Nenhuma</mat-option>
            @for (emp of empresas; track emp.id) {
              <mat-option [value]="emp.nome">{{ emp.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Preço Mínimo (R$)</mat-label>
          <input matInput type="number" formControlName="restricaoPrecoMinimo" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Preço Máximo (R$)</mat-label>
          <input matInput type="number" formControlName="restricaoPrecoMaximo" />
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Salvar</button>
          <a mat-button routerLink="/adm/cupons">Cancelar</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { padding: 24px; max-width: 600px; margin: 0 auto; }
    form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .actions { display: flex; gap: 16px; margin-top: 16px; }
  `]
})
export class CupomForm implements OnInit {
  private fb = inject(FormBuilder);
  private cupomService = inject(CupomService);
  private categoriaService = inject(CategoriaService);
  private plataformaService = inject(PlataformaService);
  private empresaService = inject(EmpresaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  isEditing = false;
  cupomId?: number;

  categorias: any[] = [];
  plataformas: any[] = [];
  empresas: any[] = [];

  form = this.fb.group({
    descricao: [''],
    codigo: ['', Validators.required],
    percentualDesconto: [0, [Validators.required, Validators.min(1)]],
    ativo: [true],
    primeiraCompra: [false],
    restricaoCategoria: [null],
    restricaoPlataforma: [null],
    restricaoEmpresa: [null],
    restricaoPrecoMinimo: [null as number | null],
    restricaoPrecoMaximo: [null as number | null]
  });

  ngOnInit(): void {
    this.carregarListas();

    this.route.data.subscribe(data => {
      if (data['cupom']) {
        this.isEditing = true;
        this.cupomId = data['cupom'].id;
        this.form.patchValue(data['cupom']);
      }
    });
  }

  carregarListas(): void {
    this.categoriaService.findAllWithHeaders(0, 100).subscribe((res: any) => this.categorias = res.body ?? []);
    this.plataformaService.findAllWithHeaders(0, 100).subscribe((res: any) => this.plataformas = res.body ?? []);
    this.empresaService.findAllWithHeaders(0, 100).subscribe((res: any) => this.empresas = res.body ?? []);
  }

  salvar(): void {
    if (this.form.invalid) return;

    const dados = this.form.value as any;
    const request = this.isEditing && this.cupomId
      ? this.cupomService.atualizar(this.cupomId, dados)
      : this.cupomService.criar(dados);

    request.subscribe({
      next: () => {
        this.snackBar.open('Cupom salvo.', 'Fechar', { duration: 2500 });
        this.router.navigate(['/adm/cupons']);
      },
      error: () => this.snackBar.open('Erro ao salvar cupom.', 'Fechar')
    });
  }
}
