import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  enviando = false;

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    cpf: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.usuarioService.create({ ...this.form.getRawValue(), idPerfil: 2 }).subscribe({
      next: () => {
        this.snackBar.open('Cadastro realizado. Entre com seu email e senha.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.enviando = false;
        this.snackBar.open('Nao foi possivel criar sua conta.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
