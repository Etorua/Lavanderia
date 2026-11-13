import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/admin/pos');
      } else {
        setErrorMsg('Usuario o contraseña incorrectos.');
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-['Montserrat',sans-serif]">
      {/* Fondo con imagen y overlay guinda corporativo */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/fondo-login.png')",
        }}
      />
      <div
        className="absolute inset-0 backdrop-blur-xs"
        style={{
          background: 'rgba(90, 1, 53, 0.94)',
        }}
      />

      {/* Botón superior de regreso al catálogo */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo Público</span>
        </Link>
      </div>

      {/* Contenedor central del Formulario */}
      <div className="relative z-10 w-full max-w-sm px-6 py-10 flex flex-col items-center text-center">
        {/* Icono circular de usuario (Exacto a la imagen de referencia) */}
        <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center mb-6 shadow-md">
          <User className="w-12 h-12 text-white stroke-[2.2]" />
        </div>

        {/* Título */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-widest uppercase mb-8">
          INICIAR SESIÓN
        </h1>

        {errorMsg && (
          <div className="w-full mb-6 p-2.5 bg-red-500/20 border border-red-300 text-white rounded-lg text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-6 text-left">
          {/* Campo: Usuario o Correo */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Usuario o Correo
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-white/80 text-white placeholder-white/40 text-base py-1.5 focus:outline-none focus:border-white focus:border-b-2 transition-all font-sans"
              placeholder="Ingresa tu usuario"
            />
          </div>

          {/* Campo: Contraseña con botón ojo */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-white/80 text-white placeholder-white/40 text-base py-1.5 pr-10 focus:outline-none focus:border-white focus:border-b-2 transition-all font-sans"
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-1"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Link ¿Olvidaste tu contraseña? */}
          <div className="text-right pt-1">
            <button
              type="button"
              onClick={() =>
                alert('Para restablecer tu contraseña, comunícate con el Administrador del Sistema o Mesa Directiva.')
              }
              className="text-xs text-white/80 hover:text-white transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón Iniciar Sesión (Pill blanco con texto negro) */}
          <div className="pt-4 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[220px] py-3 bg-white hover:bg-slate-100 text-black font-extrabold text-sm rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Iniciar sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
