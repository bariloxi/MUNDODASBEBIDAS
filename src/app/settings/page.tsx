import { getSettings, getUsers, getLogs } from '@/lib/actions';
import SettingsForm from '@/components/SettingsForm';
import { Settings as SettingsIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SettingsPage = async () => {
  const [settings, users, logs] = await Promise.all([
    getSettings(),
    getUsers(),
    getLogs()
  ]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <SettingsIcon size={14} />
            <span>Configurações Globais</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Preferências do Sistema</h1>
          <p className="text-slate-400 text-sm">Gerencie parâmetros operacionais e identidade da marca.</p>
        </div>
      </header>

      <SettingsForm 
        initialSettings={settings} 
        initialUsers={users}
        initialLogs={logs}
      />
    </div>
  );
};

export default SettingsPage;
