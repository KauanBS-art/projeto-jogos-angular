import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CategoriaService } from '../../../services/categoria.service';
import { EmpresaService } from '../../../services/empresa.service';
import { JogoService } from '../../../services/jogo.service';
import { PlataformaService } from '../../../services/plataforma.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  kpis = [
    { title: 'Jogos cadastrados', value: '0', trend: 'catalogo', icon: 'sports_esports' },
    { title: 'Categorias', value: '0', trend: 'organizacao', icon: 'category' },
    { title: 'Empresas', value: '0', trend: 'parcerias', icon: 'apartment' },
    { title: 'Usuarios', value: '0', trend: 'acessos', icon: 'group' }
  ];

  atalhos = [
    { rota: '/adm/jogos/new', icone: 'add_circle', titulo: 'Novo jogo', descricao: 'Cadastre um novo titulo no marketplace.' },
    { rota: '/adm/empresas/new', icone: 'domain_add', titulo: 'Nova empresa', descricao: 'Adicione uma desenvolvedora ou publisher.' },
    { rota: '/adm/usuarios/new', icone: 'person_add', titulo: 'Novo usuario', descricao: 'Crie uma conta administrativa ou operacional.' }
  ];

  resumoSecundario = [
    { label: 'Plataformas', value: '0' }
  ];

  constructor(
    private categoriaService: CategoriaService,
    private empresaService: EmpresaService,
    private jogoService: JogoService,
    private plataformaService: PlataformaService,
    private usuarioService: UsuarioService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      categorias: this.categoriaService.count().pipe(catchError(() => of(0))),
      empresas: this.empresaService.count().pipe(catchError(() => of(0))),
      jogos: this.jogoService.count().pipe(catchError(() => of(0))),
      plataformas: this.plataformaService.count().pipe(catchError(() => of(0))),
      usuarios: this.usuarioService.count().pipe(catchError(() => of(0)))
    }).subscribe({
      next: (resumo) => {
        this.kpis = [
          { ...this.kpis[0], value: String(resumo.jogos) },
          { ...this.kpis[1], value: String(resumo.categorias) },
          { ...this.kpis[2], value: String(resumo.empresas) },
          { ...this.kpis[3], value: String(resumo.usuarios) }
        ];
        this.resumoSecundario = [
          { label: 'Plataformas', value: String(resumo.plataformas) }
        ];
        this.changeDetector.detectChanges();
      }
    });
  }
}
