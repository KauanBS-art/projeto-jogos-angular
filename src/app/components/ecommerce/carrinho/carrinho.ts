import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { CarrinhoService } from '../../../services/carrinho.service';
import { JogoService } from '../../../services/jogo.service';
import { PedidoService } from '../../../services/pedido.service';
import { Jogo } from '../../../models/jogo.model';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css'
})
export class Carrinho {
  private readonly fb = inject(FormBuilder);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly jogoService = inject(JogoService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly itens = this.carrinhoService.items;
  readonly quantidadeTotal = this.carrinhoService.quantidadeTotal;
  readonly valorTotal = this.carrinhoService.valorTotal;
  finalizando = false;

  readonly form = this.fb.nonNullable.group({
    idModoPagamento: [1, [Validators.required]],
    cep: ['', [Validators.required]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    cidade: ['', [Validators.required]]
  });

  alterarQuantidade(jogoId: number, event: Event): void {
    const quantidade = Number((event.target as HTMLInputElement).value);
    this.carrinhoService.alterarQuantidade(jogoId, quantidade);
  }

  remover(jogoId: number): void {
    this.carrinhoService.remover(jogoId);
  }

  limpar(): void {
    this.carrinhoService.limpar();
  }

  finalizar(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirectTo: '/carrinho' } });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.finalizando = true;
    this.pedidoService.criarPedido(this.itens(), this.form.getRawValue())
      .pipe(finalize(() => this.finalizando = false))
      .subscribe({
        next: () => {
          this.carrinhoService.limpar();
          this.snackBar.open('Pedido realizado com sucesso.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: () => {
          this.snackBar.open('Nao foi possivel finalizar o pedido.', 'Fechar', { duration: 3000 });
        }
      });
  }

  getImagemUrl(jogo: Jogo): string | null {
    return this.jogoService.getImagemUrl(jogo.nomeImagem);
  }
}
