'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';

export default function FirebaseInit() {
  useEffect(() => {
    // A inicialização do Analytics é assíncrona e segura para SSR
    if (analytics) {
      analytics.then(instance => {
        if (instance) {
          console.log('Firebase Analytics ativo');
        }
      }).catch(err => {
        console.warn('Erro ao carregar Firebase Analytics:', err);
      });
    }
  }, []);

  return null; // Este componente não renderiza nada visualmente
}
