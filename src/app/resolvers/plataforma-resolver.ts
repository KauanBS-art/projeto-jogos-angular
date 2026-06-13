import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PlataformaService } from '../services/plataforma.service';
import { Plataforma } from '../models/plataforma.model';

export const plataformaResolver: ResolveFn<Plataforma> = (route) => {
  const service = inject(PlataformaService);
  const id = Number(route.paramMap.get('id'));
  return service.findById(id);
};