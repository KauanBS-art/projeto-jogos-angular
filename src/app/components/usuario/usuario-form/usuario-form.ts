import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Usuario } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, RouterLink],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css'
})
export class UsuarioForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly perfis = [
    { id: 1, label: 'Adm' },
    { id: 2, label: 'User' }
  ];

  readonly form = this.fb.group({
    id: [null as number | null],
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.minLength(6)]],
    idPerfil: [2, [Validators.required]]
  });

  constructor(
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const usuario = this.activatedRoute.snapshot.data['usuario'] as Usuario | undefined;
    if (usuario) {
      this.form.patchValue({
        id: usuario.id ?? null,
        nome: usuario.nome,
        email: usuario.email,
        senha: '',
        idPerfil: usuario.perfil?.id ?? usuario.idPerfil ?? 2
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, nome, email, senha, idPerfil } = this.form.getRawValue();

    if (!id && !senha) {
      this.form.get('senha')?.setErrors({ required: true });
      this.form.get('senha')?.markAsTouched();
      return;
    }

    const payload = {
      nome: nome ?? '',
      email: email ?? '',
      senha: senha ?? '',
      idPerfil: idPerfil ?? 2
    } as Usuario;

    const request = id
      ? this.usuarioService.update({ id, ...payload } as Usuario)
      : this.usuarioService.create(payload);

    request.subscribe({
      next: () => {
        this.snackBar.open('Usuario salvo com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/usuarios');
      },
      error: () => this.snackBar.open('Nao foi possivel salvar o usuario.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  excluir(): void {
    const id = this.form.get('id')?.value;
    if (!id || !window.confirm('Deseja excluir este usuario?')) {
      return;
    }

    this.usuarioService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Usuario excluido com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/usuarios');
      },
      error: () => this.snackBar.open('Nao foi possivel excluir o usuario.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }
}
