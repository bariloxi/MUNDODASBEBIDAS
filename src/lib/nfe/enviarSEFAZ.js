import axios from 'axios';
import https from 'https';
import fs from 'fs';

/**
 * Envia o XML assinado para a SEFAZ via SOAP/HTTPS
 */
export async function enviarSEFAZ({ xmlAssinado, certPath, password, ambiente = 'homologacao', uf = '52' }) {
  try {
    // URLs de exemplo (Goiás - GO)
    const urls = {
      '52': {
        homologacao: 'https://homologacao.sefaz.go.gov.br/nfe/services/NFeAutorizacao4?wsdl',
        producao: 'https://nfe.sefaz.go.gov.br/nfe/services/NFeAutorizacao4?wsdl'
      }
      // Outras UFs podem ser adicionadas aqui
    };

    const url = urls[uf]?.[ambiente];
    if (!url) throw new Error(`URL da SEFAZ não configurada para UF ${uf} e ambiente ${ambiente}`);

    // Configura Agente HTTPS com Certificado Digital (MTLS)
    const agent = new https.Agent({
      pfx: fs.readFileSync(certPath),
      passphrase: password,
      rejectUnauthorized: false // Em alguns ambientes de homologação SEFAZ pode precisar de false
    });

    // Monta Envelope SOAP
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
            ${xmlAssinado}
          </nfeDadosMsg>
        </soap12:Body>
      </soap12:Envelope>`;

    // Envio POST
    const response = await axios.post(url, soapEnvelope, {
      httpsAgent: agent,
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8',
        'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote'
      }
    });

    return interpretarResposta(response.data);

  } catch (error) {
    console.error('Erro no envio para SEFAZ:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Interpreta o retorno da SEFAZ (Simplificado)
 */
function interpretarResposta(soapResponse) {
  // Extração básica via Regex (Recomenda-se um XML Parser como 'fast-xml-parser')
  const cStat = soapResponse.match(/<cStat>([^<]+)<\/cStat>/)?.[1];
  const xMotivo = soapResponse.match(/<xMotivo>([^<]+)<\/xMotivo>/)?.[1];
  const nProt = soapResponse.match(/<nProt>([^<]+)<\/nProt>/)?.[1];

  return {
    cStat,
    xMotivo,
    nProt,
    xmlRetorno: soapResponse,
    success: cStat === '100' // 100 = Autorizado
  };
}
