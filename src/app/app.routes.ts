import { Routes } from '@angular/router';
import { Dashboard } from './components/adm/dashboard/dashboard';

import { CategoriaList } from './components/categoria/categoria-list/categoria-list';
import { CategoriaForm } from './components/categoria/categoria-form/categoria-form';
import { categoriaResolver } from './resolvers/categoria-resolver';

import { PlataformaList } from './components/plataforma/plataforma-list/plataforma-list';
import { PlataformaForm } from './components/plataforma/plataforma-form/plataforma-form';
import { plataformaResolver } from './resolvers/plataforma-resolver';

import { EmpresaList } from './components/empresa/empresa-list/empresa-list';
import { EmpresaForm } from './components/empresa/empresa-form/empresa-form';
import { empresaResolver } from './resolvers/empresa-resolver';

import { JogoList } from './components/jogo/jogo-list/jogo-list';
import { JogoForm } from './components/jogo/jogo-form/jogo-form';
import { jogoResolver } from './resolvers/jogo-resolver';

import { UsuarioList } from './components/usuario/usuario-list/usuario-list';
import { UsuarioForm } from './components/usuario/usuario-form/usuario-form';
import { usuarioResolver } from './resolvers/usuario-resolver';

import { CupomList } from './components/cupom/cupom-list/cupom-list';
import { CupomForm } from './components/cupom/cupom-form/cupom-form';
import { cupomResolver } from './resolvers/cupom-resolver';

import { LoginComponent } from './components/auth/login/login';
import { TemplateAdm } from './components/template-adm/template-adm';
import { TemplateEcommerce } from './components/template-ecommerce/template-ecommerce';
import { Home } from './components/ecommerce/home/home';
import { DetalheJogo } from './components/ecommerce/detalhe-jogo/detalhe-jogo';
import { Carrinho } from './components/ecommerce/carrinho/carrinho';
import { Cadastro } from './components/ecommerce/cadastro/cadastro';
import { EsqueciSenha } from './components/ecommerce/esqueci-senha/esqueci-senha';
import { ListaDesejos } from './components/ecommerce/lista-desejos/lista-desejos';
import { PerfilUsuario } from './components/ecommerce/perfil/perfil';
import { FinalizarCompra } from './components/ecommerce/finalizar-compra/finalizar-compra';
import { ResumoCompra } from './components/ecommerce/resumo-compra/resumo-compra';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'cadastro', component: Cadastro, title: 'Cadastro' },
  { path: 'esqueci-senha', component: EsqueciSenha, title: 'Esqueci a senha' },
  {
    path: '',
    component: TemplateEcommerce,
    children: [
      { path: '', component: Home, title: 'GameXtore' },
      { path: 'promocoes', loadComponent: () => import('./components/ecommerce/promocoes/promocoes').then(m => m.PromocoesComponent), title: 'Promoções' },
      { path: 'jogos/:id', component: DetalheJogo, title: 'Detalhe do Jogo' },
      { path: 'carrinho', component: Carrinho, title: 'Carrinho' },
      { path: 'lista-desejos', component: ListaDesejos, title: 'Lista de desejos', canActivate: [authGuard] },
      { path: 'perfil', component: PerfilUsuario, title: 'Meu perfil', canActivate: [authGuard] },
      { path: 'finalizar-compra', component: FinalizarCompra, title: 'Finalizar compra', canActivate: [authGuard] },
      { path: 'resumo-compra', component: ResumoCompra, title: 'Resumo da compra', canActivate: [authGuard] }
    ]
  },
  {
    path: 'adm',
    component: TemplateAdm,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard, title: 'Dashboard' },

      { path: 'categorias', component: CategoriaList, title: 'Categorias' },
      { path: 'categorias/new', component: CategoriaForm, title: 'Nova Categoria' },
      { path: 'categorias/edit/:id', component: CategoriaForm, title: 'Editar Categoria', resolve: { categoria: categoriaResolver } },

      { path: 'plataformas', component: PlataformaList, title: 'Plataformas' },
      { path: 'plataformas/new', component: PlataformaForm, title: 'Nova Plataforma' },
      { path: 'plataformas/edit/:id', component: PlataformaForm, title: 'Editar Plataforma', resolve: { plataforma: plataformaResolver } },

      { path: 'empresas', component: EmpresaList, title: 'Empresas' },
      { path: 'empresas/new', component: EmpresaForm, title: 'Nova Empresa' },
      { path: 'empresas/edit/:id', component: EmpresaForm, title: 'Editar Empresa', resolve: { empresa: empresaResolver } },

      { path: 'jogos', component: JogoList, title: 'Jogos' },
      { path: 'jogos/new', component: JogoForm, title: 'Novo Jogo' },
      { path: 'jogos/edit/:id', component: JogoForm, title: 'Editar Jogo', resolve: { jogo: jogoResolver } },

      { path: 'usuarios', component: UsuarioList, title: 'Usuarios' },
      { path: 'usuarios/new', component: UsuarioForm, title: 'Novo Usuario' },
      { path: 'usuarios/edit/:id', component: UsuarioForm, title: 'Editar Usuario', resolve: { usuario: usuarioResolver } },

      { path: 'cupons', component: CupomList, title: 'Cupons' },
      { path: 'cupons/new', component: CupomForm, title: 'Novo Cupom' },
      { path: 'cupons/edit/:id', component: CupomForm, title: 'Editar Cupom', resolve: { cupom: cupomResolver } }
    ]
  },
  { path: '**', redirectTo: '' }
];
