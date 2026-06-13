import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  readonly menuItems = [
    { label: 'Voltar à Loja', icon: 'storefront', route: '/' },
    { label: 'Dashboard', icon: 'dashboard', route: '/adm/dashboard' },
    { label: 'Jogos', icon: 'sports_esports', route: '/adm/jogos' },
    { label: 'Categorias', icon: 'category', route: '/adm/categorias' },
    { label: 'Empresas', icon: 'apartment', route: '/adm/empresas' },
    { label: 'Plataformas', icon: 'memory', route: '/adm/plataformas' },
    { label: 'Cupons', icon: 'local_offer', route: '/adm/cupons' },
    { label: 'Usuarios', icon: 'group', route: '/adm/usuarios' }
  ];
}
