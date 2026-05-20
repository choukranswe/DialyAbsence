import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarDays, MonitorCheck, UserRoundCheck } from 'lucide-react';
import type { ElementType } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchAlerts, fetchDashboardStats, fetchWeeklyAttendance } from '../api/dashboard';
import { formatDate, formatNumber } from '../lib/utils';
import { LoadingSkeleton } from '../components/shared/LoadingSkeleton';
import { StatusBadge } from '../components/shared/StatusBadge';

const colors = ['#16A34A', '#DC2626'];

export function Dashboard() {
  const statsQuery = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: fetchDashboardStats, staleTime: 30_000 });
  const weeklyQuery = useQuery({ queryKey: ['dashboard', 'weekly-attendance'], queryFn: fetchWeeklyAttendance, staleTime: 30_000 });
  const alertsQuery = useQuery({ queryKey: ['dashboard', 'alerts'], queryFn: fetchAlerts, staleTime: 30_000 });

  const stats = statsQuery.data;
  const donutData = [
    { name: 'Presence', value: Math.max(0, 100 - (stats?.taux_absence_mois ?? 0)) },
    { name: 'Absence', value: stats?.taux_absence_mois ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={UserRoundCheck} label="Patients actifs" value={stats?.patients_actifs} loading={statsQuery.isLoading} tone="blue" />
        <StatCard icon={CalendarDays} label="Seances aujourd'hui" value={stats?.seances_aujourdhui} loading={statsQuery.isLoading} tone="amber" />
        <StatCard icon={AlertTriangle} label="Absences ce mois" value={stats?.absences_ce_mois} loading={statsQuery.isLoading} tone="red" />
        <StatCard icon={MonitorCheck} label="Machines disponibles" value={stats?.machines_disponibles} loading={statsQuery.isLoading} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <section className="surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1E3A5F]">Frequentation cette semaine</h2>
          </div>
          {weeklyQuery.isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyQuery.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="jour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="effectuees" fill="#16A34A" name="Effectuees" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="planifiees" fill="#D97706" name="Planifiees" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="annulees" fill="#DC2626" name="Annulees" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="surface p-5">
          <h2 className="text-base font-bold text-[#1E3A5F]">Taux d'absence mensuel</h2>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                  {donutData.map((entry, index) => <Cell key={entry.name} fill={colors[index]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-3xl font-bold text-[#1E3A5F]">{stats?.taux_absence_mois ?? 0}%</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-[#1E3A5F]">Seances du jour</h2>
          </div>
          {statsQuery.isLoading ? (
            <div className="p-5"><LoadingSkeleton rows={4} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody>
                  {(stats?.seances_du_jour ?? []).map((seance) => (
                    <tr key={seance.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-5 py-3 text-sm font-bold text-[#1E3A5F]">{seance.patient?.nom_complet}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{seance.heure_debut} - {seance.machine?.numero}</td>
                      <td className="px-5 py-3"><StatusBadge type="seance" value={seance.statut} /></td>
                    </tr>
                  ))}
                  {(stats?.seances_du_jour ?? []).length === 0 && (
                    <tr><td className="px-5 py-8 text-sm text-slate-500">Aucune seance planifiee aujourd'hui.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="surface p-5">
          <h2 className="text-base font-bold text-[#1E3A5F]">Alertes absences</h2>
          <div className="mt-4 space-y-3">
            {alertsQuery.isLoading && <LoadingSkeleton rows={3} />}
            {(alertsQuery.data ?? []).map((alert) => (
              <div key={alert.patient_id} className="rounded-md border border-red-100 bg-red-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-[#1E3A5F]">{alert.patient}</div>
                  <span className="text-sm font-bold text-[#DC2626]">{alert.nombre_absences}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">{alert.cin} - derniere: {formatDate(alert.derniere_absence)}</div>
              </div>
            ))}
            {!alertsQuery.isLoading && (alertsQuery.data ?? []).length === 0 && <p className="text-sm text-slate-500">Aucune alerte active.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading, tone }: { icon: ElementType; label: string; value?: number; loading?: boolean; tone: 'blue' | 'amber' | 'red' | 'green' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-[#2563EB]',
    amber: 'bg-amber-50 text-[#D97706]',
    red: 'bg-red-50 text-[#DC2626]',
    green: 'bg-green-50 text-[#16A34A]',
  }[tone];

  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <div className="mt-2 text-3xl font-bold text-[#1E3A5F]">{loading ? '-' : formatNumber(value ?? 0)}</div>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </section>
  );
}
