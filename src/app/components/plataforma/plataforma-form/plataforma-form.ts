import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Plataforma } from '../../../models/plataforma.model';
import { PlataformaService } from '../../../services/plataforma.service';

@Component({
  selector: 'app-plataforma-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule, RouterLink],
  templateUrl: './plataforma-form.html',
  styleUrl: './plataforma-form.css'
})
export class PlataformaForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    id: [null as number | null],
    nome: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private plataformaService: PlataformaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const plataforma = this.activatedRoute.snapshot.data['plataforma'] as Plataforma | undefined;
    if (plataforma) {
      this.form.patchValue(plataforma);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, nome } = this.form.getRawValue();
    const payload = { nome: nome ?? '' } as Plataforma;

    const request = id
      ? this.plataformaService.update({ ...payload, id } as Plataforma)
      : this.plataformaService.create(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open('Plataforma salva com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/plataformas');
      },
      error: () => this.snackBar.open('Nao foi possivel salvar a plataforma.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  excluir(): void {
    const id = this.form.get('id')?.value;
    if (!id || !window.confirm('Deseja excluir esta plataforma?')) {
      return;
    }

    this.plataformaService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Plataforma excluida com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/plataformas');
      },
      error: () => this.snackBar.open('Nao foi possivel excluir a plataforma.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
