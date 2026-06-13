import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';
import { Empresa } from '../models/empresa.model';

export const empresaResolver: ResolveFn<Empresa> = (route) => {
  const service = inject(EmpresaService);
  const id = Number(route.paramMap.get('id'));
  return service.findById(id);
};