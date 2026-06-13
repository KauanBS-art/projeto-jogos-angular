import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CarrinhoService } from '../../services/carrinho.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-template-ecommerce',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './template-ecommerce.html',
  styleUrl: './template-ecommerce.css'
})
export class TemplateEcommerce {
  private readonly carrinhoService = inject(CarrinhoService);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly quantidadeTotal = this.carrinhoService.quantidadeTotal;
  readonly currentUser = this.authService.currentUser;
  readonly isAdmin = () => this.authService.isAdmin();
  readonly isDarkTheme = () => this.themeService.isDark();
  readonly currentYear = new Date().getFullYear();

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/']);
  }
}
