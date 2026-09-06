import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type Props = {
    status?: string;
    canResetPassword?: boolean;
    canRegister?: boolean;
};

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({
    status,
    canResetPassword = true,
    canRegister = true,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/login', {
            preserveScroll: true,
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />

            <div>
                <h1 className="text-[34px] font-semibold leading-none tracking-[-0.045em] text-[#18201d]">
                    Masuk
                </h1>
                <p className="mt-2.5 max-w-[360px] text-[12px] leading-5 text-[#6f7773]">
                    Lanjutkan konfigurasi dan engineering result yang tersimpan di akun Anda.
                </p>

                {status && (
                    <div className="mt-4 rounded-lg border border-[#153f32]/15 bg-[#153f32]/[0.05] px-3 py-2.5 text-[11px] text-[#153f32]">
                        {status}
                    </div>
                )}

                <a
                    href="/auth/google"
                    className="mt-5 flex h-[43px] w-full items-center justify-center gap-2.5 rounded-lg border border-[#d9d5cc] bg-white text-[12px] font-medium text-[#28312d] transition hover:bg-[#f7f5ef]"
                >
                    <GoogleMark />
                    Lanjut dengan Google
                </a>

                <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[9px] text-[#969d99]">
                    <span className="h-px bg-[#d9d5cc]" />
                    <span>atau masuk dengan email</span>
                    <span className="h-px bg-[#d9d5cc]" />
                </div>

                <form onSubmit={submit} className="space-y-3.5">
                    <Field label="Email" error={form.errors.email}>
                        <div className="group relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#87908b] transition group-focus-within:text-[#153f32]" />
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                autoComplete="email"
                                autoFocus
                                placeholder="nama@perusahaan.com"
                                className="h-[42px] w-full rounded-lg border border-[#d9d5cc] bg-white pl-10 pr-3 text-[12px] outline-none transition placeholder:text-[#a6aca8] focus:border-[#7c9e91] focus:ring-3 focus:ring-[#153f32]/[0.05]"
                            />
                        </div>
                    </Field>

                    <Field label="Password" error={form.errors.password}>
                        <div className="group relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#87908b] transition group-focus-within:text-[#153f32]" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                autoComplete="current-password"
                                placeholder="Masukkan password"
                                className="h-[42px] w-full rounded-lg border border-[#d9d5cc] bg-white pl-10 pr-10 text-[12px] outline-none transition placeholder:text-[#a6aca8] focus:border-[#7c9e91] focus:ring-3 focus:ring-[#153f32]/[0.05]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((current) => !current)}
                                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-[#89918d] transition hover:text-[#153f32]"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-[15px] w-[15px]" />
                                ) : (
                                    <Eye className="h-[15px] w-[15px]" />
                                )}
                            </button>
                        </div>
                    </Field>

                    <div className="flex items-center justify-between gap-3 text-[10px]">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-[#6c7570]">
                            <input
                                type="checkbox"
                                checked={form.data.remember}
                                onChange={(event) => form.setData('remember', event.target.checked)}
                                className="h-3.5 w-3.5 rounded border-[#18201d]/20 accent-[#153f32]"
                            />
                            Ingat saya
                        </label>

                        {canResetPassword && (
                            <Link
                                href="/forgot-password"
                                className="font-medium text-[#153f32] hover:underline"
                            >
                                Lupa password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="h-[43px] w-full rounded-lg bg-[#153f32] text-[12px] font-semibold text-white transition hover:bg-[#10271f] disabled:pointer-events-none disabled:opacity-55"
                    >
                        {form.processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                {canRegister && (
                    <p className="mt-4 text-center text-[10px] text-[#7d8581]">
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-[#153f32] hover:underline"
                        >
                            Buat akun
                        </Link>
                    </p>
                )}
            </div>
        </>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-[#3e4742]">
                {label}
            </span>
            {children}
            {error && (
                <span className="mt-1.5 block text-[10px] text-[#a7443b]">
                    {error}
                </span>
            )}
        </label>
    );
}

function GoogleMark() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-[17px] w-[17px]"
            aria-hidden="true"
        >
            <path
                fill="#4285F4"
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
            />
            <path
                fill="#34A853"
                d="M12 22c2.7 0 4.98-.9 6.64-2.44l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.62A10 10 0 0 0 12 22Z"
            />
            <path
                fill="#FBBC05"
                d="M6.4 13.86A6.02 6.02 0 0 1 6.08 12c0-.65.11-1.28.32-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.48l3.35-2.62Z"
            />
            <path
                fill="#EA4335"
                d="M12 6.02c1.47 0 2.78.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.35 2.62c.79-2.36 3-4.12 5.6-4.12Z"
            />
        </svg>
    );
}
