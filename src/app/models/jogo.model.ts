export class Jogo {
  id!: number;
  titulo!: string;
  descricao!: string;
  preco!: number;
  estoque!: number;
  percentualDesconto?: number;
  precoComDesconto?: number;
  nomeImagem?: string;
  dataLancamento!: string;

  idEmpresa?: number;
  idPlataformas?: number[];
  idCategorias?: number[];

  nomeEmpresa?: string;
  plataformas?: string[];
  categorias?: string[];
}
