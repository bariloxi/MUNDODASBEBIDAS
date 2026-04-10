'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteClient } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface ClientActionsProps {
  clientId: number;
  clientName: string;
}

const ClientActions: React.FC<ClientActionsProps> = ({ clientId, clientName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClient(clientId);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-bg-surface rounded-none text-slate-500 hover:text-white transition-all border border-transparent hover:border-border"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 premium-card !p-0 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {!showConfirm ? (
            <div className="py-1.5">
              <Link 
                href={`/clients/edit/${clientId}`}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-bg-surface transition-all"
              >
                <Edit2 size={14} className="text-primary" />
                Editar Perfil
              </Link>
              <div className="mx-2 my-1 border-t border-border" />
              <button 
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-danger/70 hover:text-danger hover:bg-danger/5 transition-all"
              >
                <Trash2 size={14} />
                Remover Acesso
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Confirmar Remoção?</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Deseja remover o registro de <span className="text-white font-bold">{clientName}</span>?
              </p>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-none bg-bg-surface text-slate-400 text-[10px] font-bold uppercase hover:text-white transition-all border border-border"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-none bg-danger text-white text-[10px] font-bold uppercase hover:bg-danger/80 transition-all flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 size={12} className="animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientActions;
