import { Injectable, signal } from '@angular/core';

type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'kauan-game-store-theme';
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.themeSignal.set(nextTheme);
    localStorage.setItem(this.storageKey, nextTheme);
    this.applyTheme(nextTheme);
  }

  isDark(): boolean {
    return this.themeSignal() === 'dark';
  }

  private getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(this.storageKey);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
  }
}
