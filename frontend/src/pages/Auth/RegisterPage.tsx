import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch {}
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-500 to-cyan-400 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCA0LTRzNCAxLjggNCA0LTIgNC00IDQtNC0yLTQtNHptMC0xN2MwLTIgMi00IDQtNHM0IDIgNCA0LTIgNC00IDQtNC0yLTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold">FinAI</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">Comece sua jornada financeira inteligente</h1>
          <p className="text-lg text-white/80">Crie sua conta gratuita e descubra o poder da IA aplicada às suas finanças pessoais.</p>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 mb-6 lg:hidden justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">FinAI</span>
            </div>
            <h2 className="text-2xl font-bold">Criar Conta</h2>
            <p className="text-muted-foreground mt-1">Preencha seus dados para começar</p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.name')}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                placeholder="Seu nome completo" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                placeholder="seu@email.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                  placeholder="Mínimo 6 caracteres" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50">
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.login')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
