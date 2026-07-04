"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Edit2, Loader2 } from "lucide-react";
import { client } from "@/client/client.gen";

export default function ArchiveTab() {
  const [archives, setArchives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const loadArchives = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.get({ url: '/api/v1/archive', throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
      setArchives((data as any[]) ?? []);
    } catch (err) {
      // Эндпоинт архивов ещё не готов — не оставляем экран в вечной загрузке.
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  const handleEdit = (archive: any) => {
    setFormData({ ...archive, screenshots: archive.screenshots?.join('\n') || '' });
    setEditingId(archive.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Удалить архив?")) {
      try {
        await client.delete({ url: `/api/v1/admin/archive/${id}`, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
        loadArchives();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "", version: "", modLoader: "Fabric", description: "",
      files: [], screenshots: ""
    });
    setEditingId(-1); // -1 means new
  };

  const handleSave = async () => {
    const dataToSave = {
      ...formData,
      screenshots: typeof formData.screenshots === 'string'
        ? formData.screenshots.split('\n').filter(Boolean)
        : formData.screenshots
    };

    try {
      if (editingId === -1) {
        await client.post({ url: '/api/v1/admin/archive', body: dataToSave, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
      } else {
        await client.put({ url: `/api/v1/admin/archive/${editingId}`, body: dataToSave, throwOnError: true, security: [{ scheme: 'bearer', type: 'http' }] });
      }
      setEditingId(null);
      loadArchives();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFile = () => {
    setFormData({
      ...formData,
      files: [...formData.files, { id: Date.now(), name: "Новый файл", type: "modpack", size: "0 MB", url: "" }]
    });
  };

  const removeFile = (fileId: number) => {
    setFormData({
      ...formData,
      files: formData.files.filter((f: any) => f.id !== fileId)
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div>;
  }

  if (editingId !== null && formData) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white font-display">
            {editingId === -1 ? 'Новый архив' : 'Редактировать архив'}
          </h2>
          <button
            onClick={() => setEditingId(null)}
            className="text-zinc-500 hover:text-white"
          >
            Отмена
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Название</label>
            <input
              type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Версия</label>
            <input
              type="text" value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-300 mb-2">Загрузчик модов</label>
            <input
              type="text" value={formData.modLoader} onChange={e => setFormData({ ...formData, modLoader: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Описание</label>
            <textarea
              rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white resize-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-zinc-300 mb-2">Скриншоты (каждый с новой строки)</label>
            <textarea
              rows={3} value={formData.screenshots} onChange={e => setFormData({ ...formData, screenshots: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl text-white resize-none font-mono text-sm"
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-zinc-300">Файлы сервера</label>
              <button onClick={handleAddFile} className="text-sm text-blue-400 hover:text-blue-300 font-medium">+ Добавить файл</button>
            </div>
            <div className="space-y-3">
              {formData.files.map((file: any, index: number) => (
                <div key={file.id} className="flex gap-2 items-center bg-zinc-950/50 border border-zinc-800 p-3 rounded-xl flex-wrap group transition-colors focus-within:border-zinc-700">
                  <input type="text" placeholder="Название" value={file.name} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].name = e.target.value;
                    setFormData({ ...formData, files: newFiles });
                  }} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />

                  <select value={file.type} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].type = e.target.value;
                    setFormData({ ...formData, files: newFiles });
                  }} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="modpack">Сборка</option>
                    <option value="world">Мир</option>
                  </select>

                  <input type="text" placeholder="Размер" value={file.size} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].size = e.target.value;
                    setFormData({ ...formData, files: newFiles });
                  }} className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm" />

                  <input type="text" placeholder="URL" value={file.url} onChange={e => {
                    const newFiles = [...formData.files];
                    newFiles[index].url = e.target.value;
                    setFormData({ ...formData, files: newFiles });
                  }} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm font-mono mt-2" />

                  <button onClick={() => removeFile(file.id)} className="w-full mt-2 p-2 bg-red-500/10 text-red-500 rounded-lg font-medium text-sm hover:bg-red-500 hover:text-white transition-colors">Удалить файл</button>
                </div>
              ))}
              {formData.files.length === 0 && <p className="text-zinc-500 text-sm italic">Нет прикрепленных файлов</p>}
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-900/20"
          >
            <Save className="w-4 h-4" /> Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
          Управление архивами
          <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-md border border-red-500/20">{archives.length}</span>
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/80 border-b border-zinc-800/80 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Версия / Загрузчик</th>
                <th className="px-6 py-4 font-medium">Файлов</th>
                <th className="px-6 py-4 font-medium text-right shadow-[inset_1px_0_0_#27272a,inset_0_1px_0_#27272a]">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {archives.map(arch => (
                <tr key={arch.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{arch.name}</td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">{arch.version}</span> {arch.modLoader}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{arch.files?.length || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(arch)}
                      className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors inline-block mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(arch.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {archives.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Нет добавленных архивов</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
