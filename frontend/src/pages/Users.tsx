import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Search, UserX, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createUser, fetchUsers, updateUser } from '../api/users';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { DataTable, type DataColumn } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { StatusBadge } from '../components/shared/StatusBadge';
import type { Role, User, UserPayload } from '../types';

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prenom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().optional(),
  role: z.enum(['admin', 'doctor', 'receptionist']),
  telephone: z.string().optional().nullable(),
  actif: z.boolean(),
});

type UserValues = z.infer<typeof schema>;

const defaults: UserValues = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  role: 'receptionist',
  telephone: '',
  actif: true,
};

export function Users() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);

  const usersQuery = useQuery({
    queryKey: ['users', { search, role, page }],
    queryFn: () => fetchUsers({ search, role, page, per_page: 15 }),
    staleTime: 2 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: UserPayload) => (selected ? updateUser(selected.id, payload) : createUser(payload)),
    onSuccess: () => {
      toast.success(selected ? 'Utilisateur modifie' : 'Utilisateur cree');
      setFormOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (user: User) => updateUser(user.id, { ...userToPayload(user), actif: false }),
    onSuccess: () => {
      toast.success('Utilisateur desactive');
      setDeactivateTarget(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const columns: DataColumn<User>[] = [
    { key: 'name', header: 'Utilisateur', sortable: true, sortValue: (user) => user.nom_complet, render: (user) => <div><div className="font-bold text-[#1E3A5F]">{user.nom_complet}</div><div className="text-xs text-slate-500">{user.email}</div></div> },
    { key: 'role', header: 'Role', render: (user) => <span className="rounded bg-blue-50 px-2 py-1 text-xs font-bold uppercase text-[#1E3A5F]">{user.role}</span> },
    { key: 'phone', header: 'Telephone', render: (user) => user.telephone ?? '-' },
    { key: 'actif', header: 'Statut', render: (user) => <StatusBadge type="patient" value={user.actif} /> },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-[110px]',
      render: (user) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { setSelected(user); setFormOpen(true); }} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-amber-50 hover:text-[#D97706]" title="Modifier">
            <Edit className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeactivateTarget(user)} className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-red-50 hover:text-[#DC2626]" title="Desactiver">
            <UserX className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const data = usersQuery.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input className="input pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom ou email" />
          </div>
          <select className="input w-[170px]" value={role} onChange={(event) => { setRole(event.target.value as Role | ''); setPage(1); }}>
            <option value="">Tous roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>
        <button type="button" className="btn-primary" onClick={() => { setSelected(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Utilisateur
        </button>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        getRowKey={(user) => user.id}
        loading={usersQuery.isLoading}
        page={data?.meta.current_page ?? 1}
        lastPage={data?.meta.last_page ?? 1}
        total={data?.meta.total ?? 0}
        onPageChange={setPage}
        empty={<EmptyState icon={UserX} title="Aucun utilisateur" message="Aucun utilisateur ne correspond aux filtres." actionLabel="Ajouter un utilisateur" onAction={() => setFormOpen(true)} />}
      />

      <UserDialog
        open={formOpen}
        user={selected}
        loading={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
        onClose={() => { setFormOpen(false); setSelected(null); }}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Desactiver utilisateur"
        message={`${deactivateTarget?.nom_complet ?? ''} ne pourra plus se connecter.`}
        confirmLabel="Desactiver"
        danger
        onConfirm={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget)}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}

function UserDialog({ open, user, loading, onSubmit, onClose }: { open: boolean; user: User | null; loading?: boolean; onSubmit: (payload: UserPayload) => void; onClose: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  useEffect(() => {
    reset(user ? { ...userToPayload(user), password: '' } : defaults);
  }, [open, reset, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-clinic">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">{user ? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100" title="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-5 p-6" onSubmit={handleSubmit((values) => onSubmit(cleanUser(values, Boolean(user))))}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nom" error={errors.nom?.message}><input className="input" {...register('nom')} /></Field>
            <Field label="Prenom" error={errors.prenom?.message}><input className="input" {...register('prenom')} /></Field>
            <Field label="Email" error={errors.email?.message}><input type="email" className="input" {...register('email')} /></Field>
            <Field label={user ? 'Nouveau mot de passe' : 'Mot de passe'}><input type="password" className="input" {...register('password')} /></Field>
            <Field label="Role"><select className="input" {...register('role')}><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="receptionist">Receptionist</option></select></Field>
            <Field label="Telephone"><input className="input" {...register('telephone')} /></Field>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register('actif')} />
            Compte actif
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs font-semibold text-[#DC2626]">{error}</span>}
    </label>
  );
}

function userToPayload(user: User): UserPayload {
  return {
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    role: user.role,
    telephone: user.telephone ?? '',
    actif: user.actif,
  };
}

function cleanUser(values: UserValues, isUpdate: boolean): UserPayload {
  const payload: UserPayload = {
    nom: values.nom,
    prenom: values.prenom,
    email: values.email,
    role: values.role,
    telephone: values.telephone || null,
    actif: values.actif,
  };

  if (!isUpdate || values.password) {
    payload.password = values.password;
  }

  return payload;
}
