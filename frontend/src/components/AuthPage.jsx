import { useState } from 'react';
import { Eye, EyeOff, Check, X, ArrowLeft, Github, Linkedin, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthPage({ onBack, onComplete, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'forgot'
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Toggle Mode
    const toggleMode = (newMode) => {
        setMode(newMode);
        setAgreed(false);
        setError(null);
        setResetStep(1);
        setOtp('');
        setNewPassword('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');

            localStorage.setItem('token', data.access_token);
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Google Login failed');

            localStorage.setItem('token', data.access_token);
            onComplete();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Client-side Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    is_active: true
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Signup failed');

            // Auto login after signup
            await handleLogin(e);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (resetStep === 1) {
                // Step 1: Request OTP
                const res = await fetch('/api/v1/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Request failed');

                alert(data.message); // Should say OTP sent
                setResetStep(2);
            } else {
                // Step 2: Reset Password
                const res = await fetch('/api/v1/auth/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email,
                        otp,
                        new_password: newPassword
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Reset failed');

                alert("Password reset successfully! Please login.");
                setMode('login');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-slate-200 font-sans">

            {/* LEFT PANEL (Visual) - Hidden on mobile */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
                        alt="Networking"
                        className="w-full h-full object-cover opacity-20 hover:scale-105 transition-transform duration-[20s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-[#0B1221]/80 to-sky-900/20" />
                </div>

                <div className="relative z-10 max-w-lg px-12 text-center">
                    <div className="w-16 h-16 bg-sky-500 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-sky-500/30 rotate-3 hover:rotate-6 transition-transform">
                        <div className="w-8 h-8 border-4 border-white rounded-lg" />
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Discover Chennai's Best Tech Meetups
                    </h1>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                        Join the fastest growing network of professionals. Auto-register for events, track your attendance, and grow your career.
                    </p>

                    <div className="inline-flex items-center gap-3 bg-slate-800/50 backdrop-blur-md px-5 py-3 rounded-full border border-white/10">
                        <ShieldCheck className="text-sky-400" size={20} />
                        <span className="text-sm font-semibold text-white">Trusted by 10,000+ Developers in India</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                <button onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </button>

                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {mode === 'login' && 'Welcome Back'}
                            {mode === 'signup' && 'Create/Join Account'}
                            {mode === 'forgot' && 'Reset Password'}
                        </h2>
                        <p className="text-slate-400">
                            {mode === 'login' && 'Enter your details to access your dashboard.'}
                            {mode === 'signup' && 'Start your journey with us today.'}
                            {mode === 'forgot' && (
                                resetStep === 1
                                    ? 'No worries, we\'ll send you reset instructions.'
                                    : 'Check your email for the OTP.'
                            )}
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    {mode !== 'forgot' && (
                        <div className="grid grid-cols-2 p-1 bg-slate-800/50 rounded-xl border border-white/5">
                            <button
                                onClick={() => toggleMode('login')}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => toggleMode('signup')}
                                className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={mode === 'forgot' ? handleForgotPassword : (mode === 'login' ? handleLogin : handleSignup)}>
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {/* FULL NAME - SIGNUP ONLY */}
                        {mode === 'signup' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        )}

                        {/* EMAIL ADDRESS - ALL MODES */}
                        {(mode !== 'forgot' || resetStep === 1) && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                    required={mode !== 'forgot' || resetStep === 1}
                                    disabled={mode === 'forgot' && resetStep === 2}
                                />
                            </div>
                        )}

                        {/* FORGOT PASSWORD STEP 2 - OTP & NEW PASSWORD */}
                        {mode === 'forgot' && resetStep === 2 && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Enter OTP (Sent to Email)</label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 tracking-widest text-center font-mono text-lg"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-500 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}


                        {/* PASSWORD - LOGIN/SIGNUP */}
                        {mode !== 'forgot' && (
                            <>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                                        {mode === 'login' && (
                                            <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-sky-500 hover:text-sky-400">Forgot Password?</button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-500 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                {mode === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Re-enter your password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600 pr-10 ${confirmPassword && confirmPassword !== password ? 'border-red-500/50' : 'border-slate-700'
                                                    }`}
                                                required
                                            />
                                        </div>
                                        {confirmPassword && confirmPassword !== password && (
                                            <p className="text-xs text-red-400">Passwords do not match</p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* AGREEMENT CHECKBOX */}
                        {mode === 'signup' && (
                            <div className="flex items-start gap-3 pt-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-900 checked:border-sky-500 checked:bg-sky-500 transition-all"
                                    />
                                    <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                                </div>
                                <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer select-none">
                                    I agree to the <span className="text-sky-500 font-semibold hover:underline">Terms of Service</span> and <span className="text-sky-500 font-semibold hover:underline">Privacy Policy</span>.
                                </label>
                            </div>
                        )}

                        <button
                            disabled={loading || (mode === 'signup' && (!agreed || password !== confirmPassword))}
                            type="submit"
                            className={`w-full font-bold py-3.5 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${(loading || (mode === 'signup' && (!agreed || password !== confirmPassword)))
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed hidden-spinner'
                                : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                                }`}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {mode === 'login' && 'Sign In'}
                                    {mode === 'signup' && 'Create Account'}
                                    {mode === 'forgot' && (resetStep === 1 ? 'Send Reset Link' : 'Reset Password')}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Login */}
                    {mode !== 'forgot' && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0B1221] px-2 text-slate-500">Or continue with</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError("Google Login Failed")}
                                        theme="filled_black"
                                        shape="circle"
                                        size="large"
                                        width="100%"
                                        text="continue_with"
                                    />
                                </div>
                                <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg transition-colors border border-slate-700 h-[40px] mt-[1px]">
                                    <Linkedin size={20} className="text-blue-500" />
                                    <span className="text-sm font-semibold">LinkedIn</span>
                                </button>
                            </div>
                        </>
                    )}

                    {mode === 'forgot' && (
                        <button
                            onClick={() => setMode('login')}
                            className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            Back to Log In
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
