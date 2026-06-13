import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { JogoService } from '../services/jogo.service';
import { Jogo } from '../models/jogo.model';

export const jogoResolver: ResolveFn<Jogo> = (route) => {
  const service = inject(JogoService);
  const id = Number(route.paramMap.get('id'));
  return service.findById(id);
};