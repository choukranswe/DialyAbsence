import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Lock, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginValues = z.infer<typeof schema>;

export function Login() {
  const { login, loginLoading } = useAuth({ fetchCurrentUser: false });
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@dialyse.ma', password: 'password' },
  });

  useEffect(() => {
    clearAuth();
    setFocus('email');
  }, [clearAuth, setFocus]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFC] px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-clinic">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#1E3A5F] text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E3A5F]">Centre de Dialyse</h1>
            <p className="text-sm text-slate-500">Acces securise</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit((values) => login(values))}>
          <label className="block">
            <span className="label">Email</span>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className="input pl-9" type="email" {...register('email')} />
            </div>
            {errors.email && <span className="mt-1 block text-xs font-semibold text-[#DC2626]">{errors.email.message}</span>}
          </label>

          <label className="block">
            <span className="label">Mot de passe</span>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input className="input pl-9" type="password" {...register('password')} />
            </div>
            {errors.password && <span className="mt-1 block text-xs font-semibold text-[#DC2626]">{errors.password.message}</span>}
          </label>

          <button type="submit" disabled={loginLoading} className="btn-primary h-11 w-full">
            {loginLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          admin@dialyse.ma / password
        </div>
      </section>
    </main>
  );
}
