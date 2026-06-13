import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { PedidoResponse, PedidoService } from '../../../services/pedido.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilUsuario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly pedidoService = inject(PedidoService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  pedidos: PedidoResponse[] = [];

  readonly perfilForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    cpf: [''],
    senhaConfirmacao: ['', [Validators.required]]
  });

  enderecos: any[] = [];

  readonly enderecoForm = this.fb.nonNullable.group({
    cep: [''],
    logradouro: [''],
    numero: [''],
    bairro: [''],
    cidade: [''],
    estado: [''],
    complemento: ['']
  });

  readonly senhaForm = this.fb.nonNullable.group({
    senhaAtual: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.usuarioService.me().subscribe(usuario => {
      this.enderecos = usuario.enderecos ?? [];
      this.perfilForm.patchValue({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone ?? '',
        cpf: usuario.cpf ?? ''
      });
      this.authService.updateStoredUser(usuario);
    });

    this.pedidoService.meusPedidos().subscribe(pedidos => this.pedidos = pedidos ?? []);
    this.carregarCartoes();
  }

  salvarPerfil(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const dados = this.perfilForm.getRawValue();
    this.usuarioService.updatePerfil({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      cpf: dados.cpf,
      senhaConfirmacao: dados.senhaConfirmacao,
      enderecos: this.enderecos
    }).subscribe({
      next: usuario => {
        this.authService.updateStoredUser(usuario);
        this.perfilForm.controls.senhaConfirmacao.reset('');
        this.snackBar.open('Perfil atualizado.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Confira a senha de confirmacao.', 'Fechar', { duration: 3000 })
    });
  }

  alterarSenha(): void {
    if (this.senhaForm.invalid) {
      this.senhaForm.markAllAsTouched();
      return;
    }

    const dados = this.senhaForm.getRawValue();
    this.usuarioService.alterarSenha(dados.senhaAtual, dados.novaSenha).subscribe({
      next: () => {
        this.senhaForm.reset();
        this.snackBar.open('Senha alterada.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Nao foi possivel alterar a senha.', 'Fechar', { duration: 3000 })
    });
  }

  cartoes: import('../../../models/usuario.model').CartaoCreditoResponse[] = [];

  readonly cartaoForm = this.fb.nonNullable.group({
    numero: ['', [Validators.required, Validators.pattern('\\d{16}')]],
    nomeTitular: ['', [Validators.required]],
    validade: ['', [Validators.required, Validators.pattern('\\d{2}/\\d{2}')]],
    cvv: ['', [Validators.required, Validators.pattern('\\d{3,4}')]]
  });

  carregarCartoes(): void {
    this.usuarioService.listarCartoes().subscribe(cartoes => this.cartoes = cartoes ?? []);
  }

  adicionarCartao(): void {
    if (this.cartaoForm.invalid) {
      this.cartaoForm.markAllAsTouched();
      return;
    }

    const dados = this.cartaoForm.getRawValue();
    this.usuarioService.adicionarCartao(dados).subscribe({
      next: cartao => {
        this.cartoes.push(cartao);
        this.cartaoForm.reset();
        this.snackBar.open('Cartão adicionado.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erro ao adicionar cartão.', 'Fechar', { duration: 3000 })
    });
  }

  removerCartao(id: number): void {
    this.usuarioService.removerCartao(id).subscribe({
      next: () => {
        this.cartoes = this.cartoes.filter(c => c.id !== id);
        this.snackBar.open('Cartão removido.', 'Fechar', { duration: 2500 });
      },
      error: () => this.snackBar.open('Erro ao remover cartão.', 'Fechar', { duration: 3000 })
    });
  }

  adicionarEnderecoTemporario(): void {
    if (this.enderecoForm.invalid) {
      this.enderecoForm.markAllAsTouched();
      return;
    }
    const novoEndereco = this.enderecoForm.getRawValue();
    this.enderecos.push({ ...novoEndereco });
    this.enderecoForm.reset();
  }

  removerEnderecoTemporario(index: number): void {
    this.enderecos.splice(index, 1);
  }
}
