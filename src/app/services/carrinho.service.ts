import { computed, effect, Injectable, signal } from '@angular/core';
import { Jogo } from '../models/jogo.model';
import { AuthService } from './auth.service';

export interface CarrinhoItem {
  jogo: Jogo;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private get storageKey(): string {
    const user = this.authService.currentUser();
    return user ? `kauan-game-store-carrinho-${user.id}` : 'kauan-game-store-carrinho-guest';
  }

  private readonly itemsSignal = signal<CarrinhoItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();
  readonly quantidadeTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.quantidade, 0)
  );
  readonly valorTotal = computed(() =>
    this.itemsSignal().reduce((total, item) => total + item.jogo.preco * item.quantidade, 0)
  );

  constructor(private authService: AuthService) {
    effect(() => {
      // Lê o usuário para acionar o efeito quando ele mudar
      this.authService.currentUser();
      this.itemsSignal.set(this.loadFromStorage());
    }, { allowSignalWrites: true });
  }

  adicionar(jogo: Jogo): void {
    const itensAtuais = this.itemsSignal();
    const itemExistente = itensAtuais.find(item => item.jogo.id === jogo.id);

    const novosItens = itemExistente
      ? itensAtuais.map(item =>
        item.jogo.id === jogo.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      )
      : [...itensAtuais, { jogo, quantidade: 1 }];

    this.save(novosItens);
  }

  alterarQuantidade(jogoId: number, quantidade: number): void {
    if (quantidade <= 0) {
      this.remover(jogoId);
      return;
    }

    const novosItens = this.itemsSignal().map(item =>
      item.jogo.id === jogoId ? { ...item, quantidade } : item
    );

    this.save(novosItens);
  }

  remover(jogoId: number): void {
    this.save(this.itemsSignal().filter(item => item.jogo.id !== jogoId));
  }

  limpar(): void {
    this.save([]);
  }

  private save(items: CarrinhoItem[]): void {
    this.itemsSignal.set(items);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  private loadFromStorage(): CarrinhoItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) as unknown : [];

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item): CarrinhoItem | null => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const candidate = item as Partial<CarrinhoItem>;
          const quantidade = Number(candidate.quantidade ?? 0);

          if (!candidate.jogo?.id || Number.isNaN(quantidade) || quantidade <= 0) {
            return null;
          }

          return { jogo: candidate.jogo, quantidade };
        })
        .filter((item): item is CarrinhoItem => item !== null);
    } catch {
      return [];
    }
  }
}
