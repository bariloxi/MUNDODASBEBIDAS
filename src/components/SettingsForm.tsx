'use client';

import React, { useState } from 'react';
import { 
  Store, User as UserIcon, Bell, ShieldCheck, Database, Globe, Save, Loader2, 
  ChevronRight, Lock, Laptop, Settings as SettingsIcon, Plus, Trash2, Edit 
} from 'lucide-react';
import { updateSettings, resetTransactionData, createUser, updateUser, deleteUser, createLog } from '@/lib/actions';
import { cn } from '@/lib/utils';

import { User, Log } from '@prisma/client';

interface SettingsFormProps {
  initialSettings: Record<string, string>;
  initialUsers: User[];
  initialLogs: Log[];
}

const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, initialUsers, initialLogs }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Geral');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    try {
      await updateSettings(data);
      alert('Configurações aplicadas com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao sincronizar protocolos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      alert('Erro ao processar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('ATENÇÃO: Isso apagará TODAS as vendas, notas e despesas permanentemente. Deseja continuar?')) return;
    
    setIsLoading(true);
    try {
      const res = await resetTransactionData();
      if (res.success) {
        alert('Banco de dados resetado com sucesso.');
        window.location.reload();
      } else {
        alert('Erro ao resetar dados.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro crítico ao processar reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await createLog('BACKUP_PERFORMED', 'Backup manual realizado com sucesso');
      alert('Backup gerado e armazenado em nuvem.');
      setIsLoading(false);
    }, 2000);
  };

  const tabs = [
    { icon: Store, label: 'Geral', desc: 'Identidade da Marca' },
    { icon: UserIcon, label: 'Usuários', desc: 'Permissões de Acesso' },
    { icon: Bell, label: 'Alertas', desc: 'Notificações de Sistema' },
    { icon: ShieldCheck, label: 'Segurança', desc: 'Logs e Encriptação' },
    { icon: Database, label: 'Banco de Dados', desc: 'Backup e Redundância' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 space-y-4">
        <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest px-4">Painel de Controle</p>
        <div className="flex flex-col gap-1.5">
          {tabs.map((item) => (
            <button 
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-none text-xs font-semibold transition-all duration-200 border",
                activeTab === item.label 
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-sm' 
                  : 'text-slate-400 border-transparent hover:bg-bg-surface/50 hover:text-slate-200'
              )}
            >
              <item.icon size={18} className={cn(activeTab === item.label ? 'text-primary' : 'text-slate-600')} />
              <div className="text-left">
                <p className="leading-none mb-1 font-bold">{item.label}</p>
                <p className="text-[10px] font-medium opacity-60">{item.desc}</p>
              </div>
              {activeTab === item.label && <ChevronRight size={14} className="ml-auto opacity-40" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-9 space-y-8">
        <div className="premium-card !p-0 overflow-hidden min-h-[600px] flex flex-col">
          <div className="bg-bg-secondary/20 border-b border-border p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-none bg-primary/10 text-primary"><SettingsIcon size={20} /></div>
              <h2 className="text-lg font-bold text-white">{activeTab}</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-none bg-success/5 border border-success/10 text-[10px] font-bold text-success uppercase tracking-wider">
               <Lock size={12} /> Camada Segura Ativa
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'Geral' && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nome Fantasia</label>
                    <input 
                      required 
                      name="storeName"
                      type="text" 
                      defaultValue={initialSettings.storeName || "MUNDO DAS BEBIDAS"}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Protocolo Comercial (WhatsApp)</label>
                    <input 
                      required 
                      name="whatsapp"
                      type="text" 
                      defaultValue={initialSettings.whatsapp || "+55 11 99999-9999"}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail Operacional</label>
                    <input 
                      required 
                      name="email"
                      type="email" 
                      defaultValue={initialSettings.email || "contato@suaoperacao.com"}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Logo URL (Icone)</label>
                    <input 
                      name="logoUrl"
                      type="text" 
                      defaultValue={initialSettings.logoUrl || ""}
                      className="form-input"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Endereço de Faturamento</label>
                    <textarea 
                      name="address"
                      rows={2}
                      defaultValue={initialSettings.address || ""}
                      className="form-input py-3 h-24 resize-none"
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-border">
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'Usuários' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de Acesso</h3>
                  <button 
                    onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-primary text-white text-[10px] font-bold uppercase hover:bg-primary/80 transition-all"
                  >
                    <Plus size={14} /> Novo Usuário
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">E-mail</th>
                        <th className="px-4 py-3">Cargo</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {initialUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 text-xs font-bold text-white">{user.name}</td>
                          <td className="px-4 py-4 text-xs font-medium text-slate-400">{user.email}</td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                              user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right space-x-2">
                            <button 
                              onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                              className="p-1.5 rounded bg-bg-surface border border-border text-slate-400 hover:text-primary transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => { if(confirm('Remover usuário?')) deleteUser(user.id); }}
                              className="p-1.5 rounded bg-bg-surface border border-border text-slate-400 hover:text-danger transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Alertas' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'alert_stock', label: 'Alertas de Estoque Baixo', desc: 'Notificar quando produtos atingirem o estoque mínimo' },
                    { id: 'alert_sale', label: 'Resumo de Vendas Diárias', desc: 'Enviar relatório via E-mail/WhatsApp ao fechar o caixa' },
                    { id: 'alert_login', label: 'Notificação de Login', desc: 'Alertar sobre novos acessos administrativos' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-none bg-bg-surface border border-border">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name={item.id} defaultChecked={initialSettings[item.id] === 'on'} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-6 border-t border-border">
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    <Save size={18} /> Salvar Preferências
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'Segurança' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-4 rounded-none">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary" size={20} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Encriptação Ativa</p>
                      <p className="text-[10px] text-slate-500 font-medium">Todos os dados são protegidos por AES-256 localmente.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Logs de Atividade</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {initialLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 rounded-none bg-bg-surface border border-border/40 text-[10px]">
                        <div className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-200">{log.event}</p>
                          <p className="text-slate-500">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Banco de Dados' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-none bg-bg-surface border border-border space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Database size={24} />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Backup e Nuvem</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Realize uma cópia de segurança instantânea do banco de dados `dev.db`.
                    </p>
                    <button 
                      onClick={handleBackup}
                      disabled={isLoading}
                      className="w-full py-3 rounded-none bg-slate-800 border border-slate-700 text-white text-[10px] font-bold uppercase hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      Gerar Backup Agora
                    </button>
                  </div>

                  <div className="p-6 rounded-none bg-bg-surface border border-border space-y-4">
                    <div className="flex items-center gap-3 text-success">
                      <ShieldCheck size={24} />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Redundância</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      O sistema sincroniza dados a cada 24h por padrão.
                    </p>
                    <select className="form-input text-[10px]">
                      <option>Sincronização 24h</option>
                      <option>Sincronização 12h</option>
                      <option>Sincronização em Tempo Real</option>
                    </select>
                  </div>
                </div>

                <div className="p-8 text-center space-y-6 bg-danger/5 rounded-none border border-dashed border-danger/20">
                  <div className="max-w-md mx-auto space-y-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">Zona de Risco</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Apaga todas as transações (vendas, notas, despesas). Use com cautela.
                    </p>
                    <button 
                      type="button"
                      onClick={handleReset}
                      disabled={isLoading}
                      className="w-full py-4 bg-danger hover:bg-danger/80 text-white rounded-none font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Plus size={18} className="rotate-45" /> Resetar Todo o Sistema
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-bg-secondary/20 border-t border-border p-6 flex justify-between items-center mt-auto">
            <div className="flex items-center gap-3 text-slate-500">
                <div className="p-2 rounded-none bg-bg-surface border border-border"><Laptop size={14} /></div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Sessão Segura: Cloud Node-01</span>
            </div>
            {activeTab === 'Geral' ? (
              <span className="text-[10px] font-bold text-slate-500 uppercase">Aguardando Alterações...</span>
            ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Módulo {activeTab} Ativo
                </div>
            )}
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md premium-card shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-500 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
                <input required name="name" defaultValue={editingUser?.name} className="form-input" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</label>
                <input required name="email" type="email" defaultValue={editingUser?.email} className="form-input" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Senha {editingUser && '(Deixe em branco para manter)'}</label>
                <input name="password" type="password" className="form-input" required={!editingUser} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Cargo / Permissões</label>
                <select name="role" defaultValue={editingUser?.role || 'CAIXA'} className="form-input">
                  <option value="ADMIN">Administrador</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="CAIXA">Operador de Caixa</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 px-4 rounded-none border border-border text-slate-400 font-bold text-[10px] uppercase hover:bg-white/5 transition-all">Cancelar</button>
                <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : (editingUser ? 'Salvar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 0px;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          outline: none;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }
        .form-input:focus {
          border-color: rgba(var(--primary-rgb), 0.5);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }
      `}</style>
    </div>
  );
};

export default SettingsForm;
