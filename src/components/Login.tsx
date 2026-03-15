import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from '../firebase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico para recuperar la contraseña.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Se ha enviado un correo para restablecer tu contraseña.');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#2B5B5A]">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {msg && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{msg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-[#2B5B5A] focus:border-[#2B5B5A] outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-[#2B5B5A] focus:border-[#2B5B5A] outline-none"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-[#2B5B5A] text-white p-2 rounded hover:bg-[#1f4241] transition-colors"
          >
            {isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={handleGoogle}
            className="w-full bg-white border border-gray-300 text-gray-700 p-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="mt-6 text-sm text-center text-gray-600 flex flex-col gap-2">
          {isLogin ? (
            <>
              <button onClick={() => setIsLogin(false)} className="text-[#2B5B5A] hover:underline">
                ¿No tienes cuenta? Regístrate
              </button>
              <button onClick={handleReset} className="text-[#2B5B5A] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </>
          ) : (
            <button onClick={() => setIsLogin(true)} className="text-[#2B5B5A] hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
