import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../models/usuario.model';

export const usuarioResolver: ResolveFn<Usuario> = (route) => {
  const service = inject(UsuarioService);
  const id = Number(route.paramMap.get('id'));
  return service.findById(id);
};