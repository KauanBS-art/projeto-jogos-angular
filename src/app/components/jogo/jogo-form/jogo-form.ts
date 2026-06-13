import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { Categoria } from '../../../models/categoria.model';
import { Empresa } from '../../../models/empresa.model';
import { Jogo } from '../../../models/jogo.model';
import { Plataforma } from '../../../models/plataforma.model';
import { CategoriaService } from '../../../services/categoria.service';
import { EmpresaService } from '../../../services/empresa.service';
import { JogoService } from '../../../services/jogo.service';
import { PlataformaService } from '../../../services/plataforma.service';

@Component({
  selector: 'app-jogo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatSnackBarModule, RouterLink],
  templateUrl: './jogo-form.html',
  styleUrl: './jogo-form.css'
})
export class JogoForm implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  empresas: Empresa[] = [];
  plataformas: Plataforma[] = [];
  categorias: Categoria[] = [];
  jogoAtual?: Jogo;
  arquivoImagem?: File;
  previewImagem?: string;

  readonly form = this.fb.group({
    id: [null as number | null],
    titulo: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
    estoque: [0, [Validators.required, Validators.min(1)]],
    percentualDesconto: [0, [Validators.min(0), Validators.max(100)]],
    dataLancamento: [null as string | null, [Validators.required]],
    idEmpresa: [null as number | null, [Validators.required]],
    idPlataformas: [[] as number[]],
    idCategorias: [[] as number[]]
  });

  constructor(
    private jogoService: JogoService,
    private empresaService: EmpresaService,
    private plataformaService: PlataformaService,
    private categoriaService: CategoriaService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const jogo = this.activatedRoute.snapshot.data['jogo'] as Jogo | undefined;
    this.jogoAtual = jogo;

    forkJoin({
      empresas: this.empresaService.findAllWithHeaders(0, 100),
      plataformas: this.plataformaService.findAllWithHeaders(0, 100),
      categorias: this.categoriaService.findAllWithHeaders(0, 100)
    }).subscribe({
      next: (response) => {
        this.empresas = response.empresas.body ?? [];
        this.plataformas = response.plataformas.body ?? [];
        this.categorias = response.categorias.body ?? [];

        if (jogo) {
          this.form.patchValue({
            id: jogo.id,
            titulo: jogo.titulo,
            descricao: jogo.descricao,
            preco: jogo.preco,
            estoque: jogo.estoque,
            percentualDesconto: jogo.percentualDesconto || 0,
            dataLancamento: Array.isArray(jogo.dataLancamento) 
              ? `${jogo.dataLancamento[0]}-${String(jogo.dataLancamento[1]).padStart(2, '0')}-${String(jogo.dataLancamento[2]).padStart(2, '0')}`
              : jogo.dataLancamento,
            idEmpresa: jogo.idEmpresa ?? null,
            idPlataformas: jogo.idPlataformas ?? [],
            idCategorias: jogo.idCategorias ?? []
          });
        }
      },
      error: () => this.snackBar.open('Nao foi possivel carregar os dados auxiliares do jogo.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  ngOnDestroy(): void {
    this.limparPreview();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {
      id,
      titulo,
      descricao,
      preco,
      estoque,
      percentualDesconto,
      dataLancamento,
      idEmpresa,
      idPlataformas,
      idCategorias
    } = this.form.getRawValue();

    const payload = {
      titulo: titulo ?? '',
      descricao: descricao ?? '',
      preco: preco ?? 0,
      estoque: estoque ?? 0,
      percentualDesconto: percentualDesconto ?? 0,
      dataLancamento: dataLancamento ?? '',
      idEmpresa: idEmpresa ?? 0,
      idPlataformas: idPlataformas ?? [],
      idCategorias: idCategorias ?? []
    } as Jogo;

    const request = id
      ? this.jogoService.update({ ...payload, id } as any as Jogo)
      : this.jogoService.create(payload as any as Jogo);

    request.pipe(
      switchMap((jogoSalvo) => {
        if (!this.arquivoImagem) {
          return of(jogoSalvo);
        }

        return this.jogoService.uploadImagem(jogoSalvo.id, this.arquivoImagem).pipe(map(() => jogoSalvo));
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Jogo salvo com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/jogos');
      },
      error: () => this.snackBar.open('Nao foi possivel salvar o jogo.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  selecionarImagem(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Selecione um arquivo de imagem valido.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      });
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('A imagem deve ter no maximo 5 MB.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      });
      input.value = '';
      return;
    }

    this.arquivoImagem = file;
    this.limparPreview();
    this.previewImagem = URL.createObjectURL(file);
  }

  imagemAtualUrl(): string | null {
    return this.previewImagem ?? this.jogoService.getImagemUrl(this.jogoAtual?.nomeImagem);
  }

  removerSelecaoImagem(input: HTMLInputElement): void {
    this.arquivoImagem = undefined;
    this.limparPreview();
    input.value = '';
  }

  excluir(): void {
    const id = this.form.get('id')?.value;
    if (!id || !window.confirm('Deseja excluir este jogo?')) {
      return;
    }

    this.jogoService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Jogo excluido com sucesso.', 'Fechar', {
          duration: 2500,
          panelClass: 'success-snackbar'
        });
        this.router.navigateByUrl('/adm/jogos');
      },
      error: () => this.snackBar.open('Nao foi possivel excluir o jogo.', 'Fechar', {
        duration: 2500,
        panelClass: 'error-snackbar'
      })
    });
  }

  private limparPreview(): void {
    if (this.previewImagem) {
      URL.revokeObjectURL(this.previewImagem);
      this.previewImagem = undefined;
    }
  }
}
