import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

type Props = {
    maker: {
        id: number;
        business_name: string;
        city: string | null;
        verification_status: string;
    };
    rfqs: Array<{
        id: number;
        number: string;
        title: string;
        status: string;
        installation_location: string | null;
        due_at: string | null;
        published_at: string | null;
        customer_name: string;
        project: {
            code: string;
            name: string;
            business_category: string | null;
        };
        quotation: {
            id: number;
            number: string;
            status: string;
        } | null;
    }>;
};

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Belum tersedia';

export default function MakerRfqIndex({ maker, rfqs }: Props) {
    return (
        <>
            <Head title="RFQ · Panel Maker" />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <header className="flex flex-col gap-5 border-b border-[#153f32]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold text-[#c9783d]">
                                Panel maker
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                RFQ masuk
                            </h1>
                            <p className="mt-2 text-sm text-[#68736e]">
                                RFQ yang dapat dibuka oleh {maker.business_name}
                                .
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#153f32]/10 bg-white px-4 py-3">
                            <p className="text-sm font-semibold">
                                {maker.business_name}
                            </p>
                            <p className="mt-1 text-xs text-[#68736e]">
                                {maker.city ?? 'Lokasi belum diisi'} ·{' '}
                                {readable(maker.verification_status)}
                            </p>
                        </div>
                    </header>

                    {rfqs.length === 0 ? (
                        <section className="mt-7 rounded-xl border border-dashed border-[#153f32]/20 bg-white px-6 py-12 text-center">
                            <h2 className="text-lg font-semibold">
                                Belum ada RFQ aktif
                            </h2>
                            <p className="mt-2 text-sm text-[#68736e]">
                                RFQ baru akan muncul di sini ketika tersedia.
                            </p>
                        </section>
                    ) : (
                        <section className="mt-7 grid gap-4 lg:grid-cols-2">
                            {rfqs.map((rfq) => (
                                <Link
                                    key={rfq.id}
                                    href={`/maker/rfqs/${rfq.id}`}
                                    className="group rounded-xl border border-[#153f32]/10 bg-white p-5 transition hover:border-[#153f32]/20 hover:shadow-[0_10px_30px_rgba(21,63,50,0.05)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-[#c9783d]">
                                                {rfq.number}
                                            </p>
                                            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                                                {rfq.title}
                                            </h2>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[#153f32]/[0.06] px-2.5 py-1 text-xs font-medium text-[#153f32]">
                                            {readable(rfq.status)}
                                        </span>
                                    </div>

                                    <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                        <Info
                                            label="Customer"
                                            value={rfq.customer_name}
                                        />
                                        <Info
                                            label="Project"
                                            value={rfq.project.name}
                                        />
                                        <Info
                                            label="Lokasi"
                                            value={
                                                rfq.installation_location ??
                                                'Belum diisi'
                                            }
                                        />
                                        <Info
                                            label="Batas"
                                            value={
                                                rfq.due_at ?? 'Tidak ditentukan'
                                            }
                                        />
                                    </dl>

                                    <div className="mt-5 flex items-center justify-between border-t border-[#153f32]/10 pt-4 text-xs">
                                        <span className="text-[#68736e]">
                                            {rfq.quotation
                                                ? `${rfq.quotation.number} · ${readable(rfq.quotation.status)}`
                                                : 'Belum ada quotation'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-semibold text-[#153f32]">
                                            Buka RFQ
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-[#8a938f]">{label}</dt>
            <dd className="mt-1 line-clamp-1 font-medium">{value}</dd>
        </div>
    );
}
