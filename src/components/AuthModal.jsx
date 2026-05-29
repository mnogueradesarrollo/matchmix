import React, { useState } from 'react';
import { ShieldAlert, X, User as UserIcon, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth, USE_LOCAL_MOCK } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const inputUser = username.trim().toLowerCase();
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME?.toLowerCase() || 'nmartin';
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || '12345';

    if (USE_LOCAL_MOCK) {
      // Simulación local para pruebas rápidas
      setTimeout(() => {
        if (inputUser === adminUser && password === adminPass) {
          onAuthSuccess({ email: `${adminUser}@matchmix.com` });
          onClose();
        } else {
          setError('Usuario o contraseña incorrectos.');
        }
        setIsLoading(false);
      }, 800);
    } else {
      // Autenticación real de Firebase
      try {
        // Mapear el nombre de usuario a un formato de correo de Firebase de forma transparente
        const email = `${inputUser}@matchmix.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
        onClose();
      } catch (err) {
        console.error("Error en autenticación Firebase", err);
        setError('Usuario o contraseña incorrectos.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    if (USE_LOCAL_MOCK) {
      setTimeout(() => {
        const targetEmail = import.meta.env.VITE_ADMIN_EMAIL || 'nmartin@matchmix.com';
        onAuthSuccess({ email: targetEmail });
        onClose();
        setIsLoading(false);
      }, 600);
    } else {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        onAuthSuccess(result.user);
        onClose();
      } catch (err) {
        console.error("Error en login Google", err);
        setError('No se pudo iniciar sesión con Google.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-darkBg-card border border-darkBg-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-darkBg-border pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" /> Acceso de Administrador
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          
          {error && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Botón de Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.09 3.67-5.17 3.67-8.83z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.17 0-5.85-2.14-6.81-5.03H1.24v3.1C3.21 21.24 7.29 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.19 14.22c-.24-.72-.38-1.5-.38-2.22s.14-1.5.38-2.22V6.68H1.24C.44 8.27 0 10.08 0 12s.44 3.73 1.24 5.32l3.95-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.29 0 3.21 2.76 1.24 6.68l3.95 3.1c.96-2.89 3.64-5.03 6.81-5.03z"
              />
            </svg>
            Ingresar con Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-darkBg-border/50"></div>
            <span className="mx-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">o usar contraseña</span>
            <div className="flex-grow border-t border-darkBg-border/50"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" /> Usuario
              </label>
              <input
                type="text"
                required
                placeholder="ej: nmartin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-red-400 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 pl-3 pr-10 border border-darkBg-border focus:border-red-400 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
