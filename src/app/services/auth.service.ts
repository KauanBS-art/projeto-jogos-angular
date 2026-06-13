import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { Login } from '../models/login.model';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = 'http://localhost:8080/auth';
  private readonly tokenKey = 'kauan-game-store-token';
  private readonly userKey = 'kauan-game-store-user';
  private readonly currentUserSignal = signal<Usuario | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) {}

  login(dados: Login): Observable<Usuario> {
    return this.httpClient.post<Usuario>(this.api, dados, {
      observe: 'response'
    }).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.body as Usuario)
    );
  }

  esqueciSenha(email: string): Observable<void> {
    return this.httpClient.post<void>(`${this.api}/esqueci-senha`, { email });
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUser()?.perfil?.label === 'Adm';
  }

  updateStoredUser(usuario: Usuario): void {
    sessionStorage.setItem(this.userKey, JSON.stringify(usuario));
    this.currentUserSignal.set(usuario);
  }

  private persistSession(response: HttpResponse<Usuario>): void {
    const tokenHeader = response.headers.get('Authorization');
    const user = response.body;

    if (!tokenHeader || !user) {
      return;
    }

    const normalizedToken = tokenHeader.startsWith('Bearer ')
      ? tokenHeader
      : `Bearer ${tokenHeader}`;

    sessionStorage.setItem(this.tokenKey, normalizedToken);
    sessionStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readStoredUser(): Usuario | null {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    const value = sessionStorage.getItem(this.userKey);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as Usuario;
    } catch {
      return null;
    }
  }
}
