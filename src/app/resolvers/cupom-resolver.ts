import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Cupom, CupomService } from '../services/cupom.service';

export const cupomResolver: ResolveFn<Cupom> = (route, state) => {
  return inject(CupomService).buscarPorId(Number(route.paramMap.get('id')));
};
