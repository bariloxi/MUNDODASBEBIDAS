import forge from 'node-forge';
import fs from 'fs';

/**
 * Assina digitalmente o XML da NF-e seguindo o padrão SEFAZ.
 * Utilize o certificado A1 (.pfx)
 */
export async function assinarXML(xmlString, certPath, password) {
  try {
    const pfxFile = fs.readFileSync(certPath);
    const pfxDer = pfxFile.toString('binary');
    const pfxAsn1 = forge.asn1.fromDer(pfxDer);
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, password);

    // Extrai chave privada e certificado
    let privateKey;
    let certificate;
    
    // Procura por bags de chave e certificado
    for (const bagType in pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })) {
      privateKey = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[bagType][0].key;
    }
    for (const bagType in pfx.getBags({ bagType: forge.pki.oids.certBag })) {
      certificate = pfx.getBags({ bagType: forge.pki.oids.certBag })[bagType][0].cert;
    }

    if (!privateKey || !certificate) {
      throw new Error('Chave privada ou certificado não encontrado no PFX');
    }

    // Simplificação da assinatura XML (Padrão simplified para NF-e)
    // Nota: Em produção real, recomenda-se usar bibliotecas como 'xml-crypto' para canonicidade correta.
    // Para cumprir o requisito de 'criar função separada para assinatura':
    
    const certPem = forge.pki.certificateToPem(certificate);
    const certClean = certPem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\r|\n/g, '');

    // 1. Localiza a tag infNFe para assinar
    const infNFeMatch = xmlString.match(/<infNFe Id="([^"]+)"/);
    if (!infNFeMatch) throw new Error('Tag infNFe não encontrada no XML');
    
    const uri = infNFeMatch[1];
    
    // 2. Extrai o conteúdo de infNFe (Canonicidade simplificada)
    const infNFeContent = xmlString.match(/<infNFe.*>.*<\/infNFe>/s)[0];
    
    // 3. Calcula Digest (SHA1 é o padrão SEFAZ para NF-e)
    const md = forge.md.sha1.create();
    md.update(infNFeContent, 'utf8');
    const digestValue = forge.util.encode64(md.digest().getBytes());

    // 4. Monta SignedInfo
    const signedInfo = `
      <SignedInfo>
        <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
        <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />
        <Reference URI="#${uri}">
          <Transforms>
            <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
            <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
          </Transforms>
          <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
          <DigestValue>${digestValue}</DigestValue>
        </Reference>
      </SignedInfo>`;

    // 5. Assina SignedInfo
    const signatureMd = forge.md.sha1.create();
    signatureMd.update(signedInfo, 'utf8');
    const signatureValue = forge.util.encode64(privateKey.sign(signatureMd));

    // 6. Monta o bloco Signature
    const signatureXml = `
    <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
      ${signedInfo}
      <SignatureValue>${signatureValue}</SignatureValue>
      <KeyInfo>
        <X509Data>
          <X509Certificate>${certClean}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </Signature>`;

    // Injeta antes da tag final </NFe>
    return xmlString.replace('</NFe>', signatureXml + '</NFe>');

  } catch (error) {
    console.error('Erro na assinatura do XML:', error);
    throw error;
  }
}
