import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CategoriaService } from '../services/categoria.service';
import { Categoria } from '../models/categoria.model';

export const categoriaResolver: ResolveFn<Categoria> = (route) => {
  const service = inject(CategoriaService);
  const id = Number(route.paramMap.get('id'));
  return service.findById(id);
};