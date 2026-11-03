'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatIDR } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, UserCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id: string, newRole: string) => {
    setLoadingId(id);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setLoadingId(null);
    
    if (error) {
      toast.error('Gagal mengubah role');
    } else {
      toast.success('Role berhasil diubah!');
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Nama / Email</th>
              <th className="p-4">Saldo</th>
              <th className="p-4">Role</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <p className="font-bold text-slate-800">{u.full_name || 'Tanpa Nama'}</p>
                  <p className="text-xs text-slate-500">{u.phone || '-'}</p>
                </td>
                <td className="p-4 font-semibold text-slate-700">{formatIDR(u.balance)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'reseller' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.role === 'admin' ? (
                    <span className="text-xs text-slate-400">Super Admin</span>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(u.id, u.role === 'reseller' ? 'customer' : 'reseller')}
                      disabled={loadingId === u.id}
                      className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${
                        u.role === 'reseller' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {loadingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                      {u.role === 'reseller' ? 'Jadikan Customer' : 'Jadikan Reseller'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
