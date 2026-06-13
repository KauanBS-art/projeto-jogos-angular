import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Endereco } from '../../../models/usuario.model';
import { CarrinhoService } from '../../../services/carrinho.service';
import { Cupom, CupomService } from '../../../services/cupom.service';
import { PedidoService } from '../../../services/pedido.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-finalizar-compra',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './finalizar-compra.html',
  styleUrl: './finalizar-compra.css'
})
export class FinalizarCompra implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly pedidoService = inject(PedidoService);
  private readonly cupomService = inject(CupomService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly itens = this.carrinhoService.items;
  readonly valorTotal = this.carrinhoService.valorTotal;
  enderecos: Endereco[] = [];
  cupom: Cupom | null = null;
  finalizando = false;

  cartoes: import('../../../models/usuario.model').CartaoCreditoResponse[] = [];

  readonly form = this.fb.nonNullable.group({
    idEndereco: ['novo'],
    idModoPagamento: [1, [Validators.required]],
    idCartaoCredito: [null as number | null],
    codigoCupom: [''],
    cep: ['', [Validators.required]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    bairro: [''],
    cidade: ['', [Validators.required]],
    estado: [''],
    complemento: ['']
  });

  ngOnInit(): void {
    if (!this.itens().length) {
      this.router.navigate(['/carrinho']);
      return;
    }

    this.usuarioService.me().subscribe(usuario => {
      this.enderecos = usuario.enderecos ?? [];
      if (this.enderecos.length) {
        this.form.controls.idEndereco.setValue(String(this.enderecos[0].id));
        this.aplicarEnderecoSelecionado();
      }
    });

    this.usuarioService.listarCartoes().subscribe(cartoes => {
      this.cartoes = cartoes ?? [];
    });
  }

  aplicarEnderecoSelecionado(): void {
    const value = this.form.controls.idEndereco.value;
    if (value === 'novo') {
      return;
    }

    const endereco = this.enderecos.find(item => String(item.id) === value);
    if (!endereco) {
      return;
    }

    this.form.patchValue({
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      bairro: endereco.bairro ?? '',
      cidade: endereco.cidade,
      estado: endereco.estado ?? '',
      complemento: endereco.complemento ?? ''
    });
  }

  validarCupom(): void {
    const codigo = this.form.controls.codigoCupom.value.trim();
    if (!codigo) {
      this.cupom = null;
      this.changeDetector.detectChanges();
      return;
    }

    this.cupomService.validar(codigo).subscribe({
      next: cupom => {
        this.cupom = cupom;
        this.form.controls.codigoCupom.setValue(cupom.codigo);
        this.snackBar.open(`Cupom ${cupom.codigo} aplicado.`, 'Fechar', { duration: 2500 });
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.cupom = null;
        this.snackBar.open('Cupom invalido.', 'Fechar', { duration: 2500 });
        this.changeDetector.detectChanges();
      }
    });
  }

  valorDesconto(): number {
    if (!this.cupom) {
      return 0;
    }

    const cupom = this.cupom as Cupom & {
      percentual?: number;
      desconto?: number;
      percentualdesconto?: number;
    };
    const percentual = Number(
      cupom.percentualDesconto ?? cupom.percentual ?? cupom.desconto ?? cupom.percentualdesconto ?? 0
    );

    return this.valorTotal() * (Number.isNaN(percentual) ? 0 : percentual / 100);
  }

  valorFinal(): number {
    return Math.max(0, this.valorTotal() - this.valorDesconto());
  }

  finalizar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dados = this.form.getRawValue();
    this.finalizando = true;
    if (dados.idModoPagamento === 3 && !dados.idCartaoCredito) {
      this.snackBar.open('Selecione um cartão de crédito.', 'Fechar', { duration: 3000 });
      this.finalizando = false;
      return;
    }

    this.pedidoService.criarPedido(this.itens(), {
      idModoPagamento: dados.idModoPagamento,
      idCartaoCredito: dados.idCartaoCredito ?? undefined,
      idEndereco: dados.idEndereco === 'novo' ? null : Number(dados.idEndereco),
      codigoCupom: this.cupom?.codigo ?? dados.codigoCupom.trim(),
      cep: dados.cep,
      logradouro: dados.logradouro,
      numero: dados.numero,
      bairro: dados.bairro,
      cidade: dados.cidade,
      estado: dados.estado,
      complemento: dados.complemento
    }).pipe(finalize(() => this.finalizando = false)).subscribe({
      next: pedido => {
        sessionStorage.setItem('ultimo-pedido', JSON.stringify(pedido));
        this.carrinhoService.limpar();
        this.router.navigate(['/resumo-compra']);
      },
      error: () => this.snackBar.open('Nao foi possivel finalizar a compra.', 'Fechar', { duration: 3000 })
    });
  }
}
