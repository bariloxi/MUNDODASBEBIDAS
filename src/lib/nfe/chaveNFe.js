/**
 * Gera a chave de acesso de 44 dígitos para NF-e/NFC-e
 * Padrão: UF (2) + AAMM (4) + CNPJ (14) + mod (2) + serie (3) + nNF (9) + tpEmis (1) + cNF (8) + cDV (1)
 */
export function gerarChaveNFe(params) {
  const {
    uf, // Código da UF (Ex: 52 para GO)
    ano, // Ano (Ex: 24)
    mes, // Mês (Ex: 04)
    cnpj, // Somente números (14 dígitos)
    modelo, // 55 ou 65
    serie, // 1 a 3 dígitos
    numero, // 1 a 9 dígitos
    tipoEmissao = '1', // 1 = Normal
    codigoNumerico = Math.floor(Math.random() * 90000000 + 10000000).toString() // 8 dígitos
  } = params;

  // Formatação com padding
  const cUF = uf.toString().padStart(2, '0');
  const cAAMM = ano.toString().padStart(2, '0') + mes.toString().padStart(2, '0');
  const cCNPJ = cnpj.replace(/\D/g, '').padStart(14, '0');
  const cMod = modelo.toString().padStart(2, '0');
  const cSerie = serie.toString().padStart(3, '0');
  const cnNF = numero.toString().padStart(9, '0');
  const cTpEmis = tipoEmissao.toString().substring(0, 1);
  const cCNF = codigoNumerico.toString().padStart(8, '0');

  const chaveSemDV = cUF + cAAMM + cCNPJ + cMod + cSerie + cnNF + cTpEmis + cCNF;
  const dv = calcularDV(chaveSemDV);

  return chaveSemDV + dv;
}

/**
 * Cálculo do Dígito Verificador (Módulo 11)
 */
function calcularDV(chave43) {
  let multiplicador = 2;
  let soma = 0;

  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43[i]) * multiplicador;
    multiplicador = multiplicador === 9 ? 2 : multiplicador + 1;
  }

  const resto = soma % 11;
  const dv = (resto === 0 || resto === 1) ? 0 : 11 - resto;
  return dv.toString();
}
