import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';

const engineeringFlow = [
    ['01', 'Equipment'],
    ['02', 'Configuration'],
    ['03', 'Engineering Result'],
];

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-dvh bg-[#e9e5dc] px-4 py-4 text-[#18201d] sm:px-6 sm:py-6 lg:grid lg:h-dvh lg:min-h-0 lg:place-items-center lg:overflow-hidden">
            <section className="mx-auto grid min-h-[560px] w-full max-w-[940px] overflow-hidden rounded-[18px] border border-[#18201d]/[0.08] bg-[#fbf8f1] shadow-[0_18px_48px_rgba(13,21,18,0.10)] lg:max-h-[calc(100dvh-48px)] lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex min-w-0 flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10 lg:py-7">
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/engineering"
                            className="inline-flex items-center gap-2 text-[11px] font-medium text-[#59635e] transition hover:text-[#153f32]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Kembali
                        </Link>

                        <Link
                            href="/engineering"
                            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#18201d]"
                            aria-label="Arusantara Engineering"
                        >
                            <BrandMark />
                            Arusantara
                        </Link>
                    </div>

                    <div className="my-auto w-full max-w-[390px] self-center py-6">
                        {children}
                    </div>
                </div>

                <aside className="hidden bg-[#153f32] px-8 py-8 text-[#f6f1e7] lg:flex lg:flex-col">
                    <p className="text-[9px] text-white/45">Engineering workspace</p>

                    <div className="my-auto">
                        <h2 className="max-w-[285px] text-[30px] font-semibold leading-[1.02] tracking-[-0.04em]">
                            Masuk untuk lanjut dari konfigurasi terakhir.
                        </h2>

                        <p className="mt-3 max-w-[280px] text-[11px] leading-[1.65] text-white/55">
                            Fokus halaman ini hanya autentikasi. Setelah masuk, pengguna kembali ke alur engineering.
                        </p>

                        <div className="mt-6 border-t border-white/12">
                            {engineeringFlow.map(([number, label]) => (
                                <div
                                    key={number}
                                    className="grid grid-cols-[28px_1fr] gap-2.5 border-b border-white/10 py-3"
                                >
                                    <span className="self-center text-center text-[9px] font-semibold tabular-nums text-[#dfa06f]">
                                        {number}
                                    </span>
                                    <strong className="text-[11px] font-medium text-white/80">
                                        {label}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="border-t border-white/12 pt-4 text-[9px] leading-[1.55] text-white/40">
                        Parameter yang belum tersedia tetap ditandai untuk verifikasi.
                    </p>
                </aside>
            </section>
        </div>
    );
}

function BrandMark() {
    return (
        <span className="relative grid h-7 w-7 place-items-center rounded-[7px] bg-[#153f32] text-[11px] font-extrabold text-[#f6f1e7]">
            A
            <span className="absolute bottom-1 right-1 h-1 w-1 rounded-full bg-[#c9783d]" />
        </span>
    );
}
