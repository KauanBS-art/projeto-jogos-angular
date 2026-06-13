import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Empresa } from '../../../models/empresa.model';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule, RouterLink],
  templateUrl: './empresa-form.html',
  styleUrl: './empresa-form.css'
})
export class EmpresaForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    id: [null as number | null],
    nome: ['', [Validators.required, Validators.minLength(2)]],
    paisOrigem: ['', [Validators.required, Validators.minLength(2)]],
    descricao: ['', [Validators.maxLength(255)]]
  });

  constructor(
    private empresaService: EmpresaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const empresa = this.activatedRoute.snapshot.data['empresa'] as Empresa | undefined;
    if (empresa) {
      this.form.patchValue(empresa);
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, nome, paisOrigem, descricao } = this.form.getRawValue();
    const payload = {
      nome: nome ?? '',
      paisOrigem: paisOrigem ?? '',
      descricao: descricao ?? ''
    } as Empresa;

    const request = id
      ? this.empresaService.update({ ...payload, id } as Empresa)
      : this.empresaService.create(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open('Empresa salva com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/empresas');
      },
      error: () => this.snackBar.open('Nao foi possivel salvar a empresa.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  excluir(): void {
    const id = this.form.get('id')?.value;
    if (!id || !window.confirm('Deseja excluir esta empresa?')) {
      return;
    }

    this.empresaService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Empresa excluida com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/empresas');
      },
      error: () => this.snackBar.open('Nao foi possivel excluir a empresa.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
