'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = authMode === 'login' 
        ? { email, password }
        : { email, password, fullName };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        setError('Server error: Respon tidak valid. Pastikan development server berjalan.');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan');
        return;
      }

      if (authMode === 'login') {
        router.push('/quick-add');
        router.refresh();
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          setAuthMode('login');
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      {/* Top Navigation (Simplified for Login) */}
      <header className="flex items-center justify-between border-b border-solid border-b-border-dark px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">ShopRecord</h2>
        </div>
        {/* Help/Support Link (Contextual) */}
        <a className="text-text-muted hover:text-white text-sm font-medium transition-colors" href="#">Need help?</a>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
        <div className="flex w-full max-w-[1200px] flex-col overflow-hidden rounded-xl bg-surface-dark/50 border border-border-dark lg:flex-row shadow-2xl">
          {/* Left Column: Marketing Visual */}
          <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-surface-dark p-10 lg:flex lg:w-1/2">
            {/* Background abstract pattern */}
            <div 
              className="absolute inset-0 z-0 opacity-20" 
              style={{
                backgroundImage: "radial-gradient(circle at 10% 20%, rgba(83, 210, 45, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(83, 210, 45, 0.2) 0%, transparent 40%)"
              }}
            />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
                  Permudah Pelacakan Pengeluaran Anda.
                </h1>
                <p className="text-lg text-text-muted">
                  Pelacakan pengeluaran bertenaga AI yang cepat dan mudah. Cukup ketik apa yang Anda beli, dan biarkan AI kami mengurus sisanya.
                </p>
              </div>
            </div>

            {/* Mock Chat Interface Visual */}
            <div className="relative z-10 mt-10 flex flex-col gap-4">
              {/* User Message */}
              <div className="self-end rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-background-dark font-bold shadow-lg max-w-[80%]">
                &quot;Beli ayam 15 rb, beli bensin 50 rb&quot;
              </div>
              
              {/* AI Processing Indicator */}
              <div className="flex items-center gap-2 self-start text-xs text-primary font-medium pl-2 uppercase tracking-wider">
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Processing...
              </div>
              
              {/* AI Response Card */}
              <div className="self-start w-full max-w-[85%] rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#2e4328] to-[#253620] border border-[#426039] p-5 shadow-lg backdrop-blur-sm hover:shadow-primary/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">fastfood</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-bold text-lg">Ayam</div>
                        <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          Hari ini
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-black text-xl">-Rp15.000</div>
                        <div className="text-xs text-red-400 font-medium">Pengeluaran</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#426039]/50">
                      <span className="px-3 py-1.5 rounded-lg bg-[#152012] text-xs text-primary font-medium border border-primary/20">#Makanan</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-start w-full max-w-[85%] rounded-2xl rounded-tl-sm bg-gradient-to-br from-[#2e4328] to-[#253620] border border-[#426039] p-5 shadow-lg backdrop-blur-sm hover:shadow-primary/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">transportation</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-white font-bold text-lg">Bensin</div>
                        <div className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          Hari ini
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-black text-xl">-Rp50.000</div>
                        <div className="text-xs text-red-400 font-medium">Pengeluaran</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#426039]/50">
                      <span className="px-3 py-1.5 rounded-lg bg-[#152012] text-xs text-primary font-medium border border-primary/20">#Transportasi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-8">
              <div className="flex -space-x-2">
                <img 
                  alt="User avatar profile picture" 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm5r-xlFXrvizz0qYOoBU7Dp5sU53315akV3qdDd4OBj_zx4tPdbju97EE5sL2nJo-0x-6lRiHRuX6q_JDwYVTz1fOBVAfXFg3a7C0SfR8XlDsCUYFdvdRZ_Gif-dgZjOPu-XF6pkQiV18RJxMBg8So2SkE7Oy0_ZEMzCL6wO-tZ5ru-ALhsaILmwHSpm32W3j08nIFTXhXXdcYsJLnhbSMr7ulUWmh7_JzMY9H2HYTwi_4aHsTTMlJrdlOMAlmBRrCtSoHi95-h8"
                />
                <img 
                  alt="User avatar profile picture" 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOemVsJNqKtzKk7MBcu09HtjofC2QxRoVDNUNIdGM2XYWO7_Jb9VBOpgRo25LwLwHm5tESqRVkxyFoADDANOWDiZ8Oi-DgKH0giT5h8bPqMm1bHSi-EAovIiwXFs5AOu3Rscj1Iir9iZm86meZ1K7PQq4TZsQxMXWYkrSWpgyTnaUAqBsXDJOM_IIyD5KSsMnUHpuTsOnYyU0IZMlNnM9oVGlrZ040hkd1ekDZyGsuTYudWWKF3LQ-f-F8xEHUWondfVRRj7ypr0c"
                />
                <img 
                  alt="User avatar profile picture" 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-surface-dark object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7WrYHljnJhfrEpjh0_YEZKVS_K2qGbxvSROdg1JwPiWrQEsFUxUGICPEahmOah0tfZSMWw0NLXJGa4J5-F9sF0dduT8kb_wnu75c8ispzwxsu_y3Ogw2xi_s1KuN3UAxJp4H7x82GzxxevkJCQ3pR9Y1wXJzeHpFfExOSICloHf7skFv_L1UNS91znSLylyRh6CvgqJIJfzP0nhaOb5Th7fOctj6bKmB-JDWMGE4K7dKrwsVTsCmBsGnUHrH22pFm_qNNOZJgeb4"
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-2 ring-surface-dark">
                  <span className="text-[10px] font-bold text-background-dark">+2k</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-text-muted">Ayo ikuti orang-orang pintar dalam mengelola pengeluaran hari ini.</p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex w-full flex-col justify-center p-6 sm:p-10 lg:w-1/2 bg-background-dark">
            {/* Mobile Logo (Visible only on small screens) */}
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-2 text-white">
                <div className="size-6 text-primary">
                  <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd" />
                  </svg>
                </div>
                <span className="font-bold text-xl tracking-tight">ShopRecord</span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md">
              {/* Toggle Switch */}
              <div className="mb-8 flex justify-center">
                <div className="flex h-12 w-full max-w-[300px] items-center rounded-full bg-surface-dark p-1 border border-border-dark">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex flex-1 items-center justify-center rounded-full py-2 text-sm font-bold transition-all ${
                      authMode === 'login' 
                        ? 'bg-primary text-background-dark shadow-md' 
                        : 'text-text-muted'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex flex-1 items-center justify-center rounded-full py-2 text-sm font-bold transition-all ${
                      authMode === 'signup' 
                        ? 'bg-primary text-background-dark shadow-md' 
                        : 'text-text-muted'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Header */}
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                  {authMode === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
                </h2>
                <p className="text-text-muted">
                  {authMode === 'login' 
                    ? 'Silakan masukkan detail Anda untuk masuk.' 
                    : 'Daftar untuk mulai mencatat pengeluaran Anda.'}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/50 p-4">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-xl bg-green-900/30 border border-green-500/50 p-4">
                  <p className="text-sm text-green-200">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Full Name Input (Signup Only) */}
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white" htmlFor="fullName">Nama Lengkap (Opsional)</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                        <span className="material-symbols-outlined text-xl">person</span>
                      </div>
                      <input 
                        className="block w-full rounded-xl border border-border-dark bg-surface-dark py-3.5 pl-11 pr-4 text-white placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" 
                        id="fullName" 
                        placeholder="Budiono" 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="email">Email address</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <input 
                      className="block w-full rounded-xl border border-border-dark bg-surface-dark py-3.5 pl-11 pr-4 text-white placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" 
                      id="email" 
                      placeholder="name@example.com" 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white" htmlFor="password">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-text-muted">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <input 
                      className="block w-full rounded-xl border border-border-dark bg-surface-dark py-3.5 pl-11 pr-11 text-white placeholder-text-muted focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-white transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                {authMode === 'login' && (
                  <div className="flex items-center justify-end">
                    <a className="text-sm font-medium text-primary hover:text-primary-hover hover:underline" href="#">
                      Lupa Password?
                    </a>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-bold text-background-dark shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : (authMode === 'login' ? 'Log In' : 'Sign Up')}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-dark"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background-dark px-4 text-text-muted">Or continue with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button 
                  className="flex flex-1 items-center justify-center gap-3 rounded-full border border-border-dark bg-surface-dark px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-border-dark/50" 
                  type="button"
                >
                  <img 
                    alt="Google Logo" 
                    className="h-5 w-5" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1y9cYJgRrGbnbLk4qQ3g3d_raqxCxTeA5vqXTh3LVeAPLsHtistp3nfYeFqTNV5qn7sY7U5zytl_uEu6KFBmuKwbbxazI3s6vmz5aM1o9comkTsHep7J8l3147MLax6L-S5QB2I9JuicGTuw7Nn-Z3hrF-AjsjgFrqPNeQ1u78d-kr_vkBXS_oqQm0VCJ7Y1VYvKjoSiFt-EOA806eSi91Ui5RbdwzC3T_NKcF9tEIeYXcrOcs4llRcDmRX15oOmToJ2T2HvGmV4"
                  />
                  Google
                </button>
                <button 
                  className="flex flex-1 items-center justify-center gap-3 rounded-full border border-border-dark bg-surface-dark px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-border-dark/50" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-xl">ios</span>
                  Apple
                </button>
              </div>

              {/* Footer Terms */}
              <div className="mt-8 text-center text-xs text-text-muted">
                By continuing, you agree to our <a className="underline hover:text-white" href="#">Terms of Service</a> and <a className="underline hover:text-white" href="#">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
