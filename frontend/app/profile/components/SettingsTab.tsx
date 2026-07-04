import { useState } from "react";
import { changeUsername, changePassword } from "@/client";
import { User, Key, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function SettingsTab({ user, onUserUpdated }: any) {
  const [newUsername, setNewUsername] = useState(user.username);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });

  const handleSaveUsername = async () => {
    if (newUsername === user.username) return;
    setIsSavingUsername(true);
    setUsernameMessage({ type: '', text: '' });
    
    try {
      const { data } = await changeUsername({ query: { username: newUsername }, throwOnError: true });
      onUserUpdated({ ...user, username: (data as any)?.username ?? newUsername });
      setUsernameMessage({ type: 'success', text: 'Имя обновлено!' });
    } catch (e: any) {
      setUsernameMessage({ type: 'error', text: e.message || String(e) });
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-8 max-w-3xl">
      <h3 className="text-xl font-bold text-white flex items-center gap-3">
        Настройки аккаунта
      </h3>

      {/* Блок смены ника */}
      <div className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800/50 max-w-md">
        <h4 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
           Смена никнейма
        </h4>

        {usernameMessage.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            usernameMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
          }`}>
            {usernameMessage.text}
          </div>
        )}

        <div className="space-y-3">
          <input 
            type="text" 
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="block w-full px-4 py-3.5 border border-zinc-800 rounded-xl bg-zinc-900 text-white" 
          />
          <button 
            onClick={handleSaveUsername}
            disabled={isSavingUsername || newUsername === user.username}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 text-white rounded-xl"
          >
            {isSavingUsername ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            Сохранить
          </button>
        </div>
      </div>
      
      {/* Здесь блок пароля, он будет сделан аналогично */}
    </div>
  );
}