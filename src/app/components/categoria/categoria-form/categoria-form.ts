import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule, RouterLink],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css'
})
export class CategoriaForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    id: [null as number | null],
    nome: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private categoriaService: CategoriaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const categoria = this.activatedRoute.snapshot.data['categoria'] as Categoria | undefined;
    if (categoria) {
      this.form.patchValue(categoria);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, nome } = this.form.getRawValue();
    const payload = { nome: nome ?? '' } as Categoria;

    const request = id
      ? this.categoriaService.update({ ...payload, id } as Categoria)
      : this.categoriaService.create(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open('Categoria salva com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/categorias');
      },
      error: () => this.snackBar.open('Nao foi possivel salvar a categoria.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  excluir(): void {
    const id = this.form.get('id')?.value;
    if (!id || !window.confirm('Deseja excluir esta categoria?')) {
      return;
    }

    this.categoriaService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Categoria excluida com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/categorias');
      },
      error: () => this.snackBar.open('Nao foi possivel excluir a categoria.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
