import { Perfil } from './perfil.model';

export interface Endereco {
  id?: number;
  logradouro: string;
  numero: string;
  cep: string;
  cidade: string;
  bairro?: string;
  complemento?: string;
  estado?: string;
}

export interface CartaoCredito {
  id?: number;
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
}

export interface CartaoCreditoResponse {
  id: number;
  numeroMascarado: string;
  nomeTitular: string;
  validade: string;
}

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  telefone?: string;
  cpf?: string;
  idPerfil?: number;
  perfil?: Perfil;
  enderecos?: Endereco[];
  cartoes?: CartaoCreditoResponse[];
}
