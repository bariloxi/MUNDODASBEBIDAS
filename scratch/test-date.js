function formatDateTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(date));
}

const nowUTC = new Date().toISOString();
console.log('Now UTC:', nowUTC);
console.log('Formatted (Sao Paulo):', formatDateTime(nowUTC));

const sampleUTC = '2026-05-14T14:18:00Z';
console.log('Sample UTC:', sampleUTC);
console.log('Formatted (Sao Paulo):', formatDateTime(sampleUTC));
