import { Head, Link, router } from '@inertiajs/react';

type Props = {
    rfq: {
        id: number;
        number: string;
        title: string;
        status: string;
        installation_location: string | null;
        due_at: string | null;
        customer_note: string | null;
    };
    project: {
        code: string;
        name: string;
        business_category: string | null;
    };
    customer: {
        name: string;
    };
    technical_baseline: {
        snapshot_id: number;
        version: number;
        connected_load_w: number | null;
        design_load_w: number | null;
        design_current_a: number | null;
        recommended_supply_v: number | null;
        recommended_phase: string | null;
        result_status: string;
        input_hash: string;
    };
    quotation: {
        id: number;
        number: string;
        status: string;
        can_edit: boolean;
    } | null;
};

const readable = (value: string | null) => value?.replaceAll('_', ' ') ?? '—';
const kw = (value: number | null) => (value === null ? '—' : `${(value / 1000).toFixed(1)} kW`);
const ampere = (value: number | null) => (value === null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`);

export default function MakerRfqShow({ rfq, project, customer, technical_baseline: baseline, quotation }: Props) {
    const createQuotation = () => {
        router.post(`/maker/rfqs/${rfq.id}/quotation`);
    };

    return (
        <>
            <Head title={`${rfq.number} · Maker RFQ`} />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <Link href="/maker/rfqs" className="text-xs uppercase tracking-[0.2em] text-[#766f64]">
                        ← RFQ Inbox
                    </Link>

                    <header className="mt-6 grid overflow-hidden rounded-[2rem] bg-[#173a32] text-[#f7f3e8] lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="p-7 md:p-10 lg:p-12">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">
                                {rfq.number} · {readable(rfq.status)}
                            </p>
                            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] md:text-6xl">{rfq.title}</h1>
                            <p className="mt-6 text-sm leading-7 text-[#d6dfda]">
                                {customer.name} · {project.name} · {rfq.installation_location ?? 'Lokasi belum diisi'}
                            </p>
                        </div>

                        <div className="border-t border-white/15 bg-white/[0.04] p-7 md:p-10 lg:border-l lg:border-t-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#c8d4ce]">Quotation</p>

                            {quotation === null ? (
                                <>
                                    <p className="mt-4 font-serif text-3xl">Belum ada penawaran</p>
                                    <p className="mt-4 text-sm leading-6 text-[#d6dfda]">
                                        Buat Quote V1 berdasarkan frozen engineering baseline di RFQ ini.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={createQuotation}
                                        className="mt-8 w-full rounded-full bg-[#b56f3d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#9c5c32]"
                                    >
                                        Create Quote V1 →
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4 font-serif text-3xl">{quotation.number}</p>
                                    <p className="mt-2 text-sm capitalize text-[#d6dfda]">{readable(quotation.status)}</p>
                                    {quotation.can_edit && (
                                        <Link
                                            href={`/maker/quotations/${quotation.id}/edit`}
                                            className="mt-8 inline-flex w-full justify-center rounded-full bg-[#b56f3d] px-5 py-3.5 text-sm font-semibold text-white"
                                        >
                                            Continue Quote V1 →
                                        </Link>
                                    )}
                                    {!quotation.can_edit && (
                                        <p className="mt-7 border-t border-white/15 pt-6 text-sm leading-6 text-[#d6dfda]">
                                            Quotation sudah dikirim. Customer dapat meninjau penawaran dan technical deviation.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </header>

                    <section className="mt-6 rounded-[2rem] border border-[#172c26]/15 bg-[#faf8f2] p-7 md:p-9">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Frozen engineering baseline</p>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric label="Connected load" value={kw(baseline.connected_load_w)} />
                            <Metric label="Design load" value={kw(baseline.design_load_w)} />
                            <Metric label="Design current" value={ampere(baseline.design_current_a)} />
                            <Metric
                                label="Supply"
                                value={`${baseline.recommended_supply_v ?? '—'} V · ${readable(baseline.recommended_phase)}`}
                            />
                        </div>
                        <div className="mt-7 grid gap-5 border-t border-[#172c26]/10 pt-6 md:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-[#777169]">Result status</p>
                                <p className="mt-2 font-medium capitalize">{readable(baseline.result_status)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-[#777169]">Due date</p>
                                <p className="mt-2 font-medium">{rfq.due_at ?? 'Tidak ditentukan'}</p>
                            </div>
                        </div>
                        <p className="mt-5 break-all font-mono text-[11px] leading-5 text-[#777169]">
                            Input hash · {baseline.input_hash}
                        </p>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[1.7rem] border border-[#172c26]/15 p-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Customer note</p>
                            <p className="mt-4 text-sm leading-7 text-[#5f665f]">
                                {rfq.customer_note ?? 'Tidak ada catatan tambahan.'}
                            </p>
                        </div>
                        <div className="rounded-[1.7rem] bg-[#e8ddcb] p-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#8a6344]">Technical deviation</p>
                            <p className="mt-4 text-sm leading-7 text-[#5f584f]">
                                Jika proposal berbeda dari baseline, nyatakan requested spec, proposed spec, alasan, serta
                                dampak harga dan lead time di quotation.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.4rem] border border-[#172c26]/10 bg-white p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#777169]">{label}</p>
            <p className="mt-3 font-serif text-xl">{value}</p>
        </div>
    );
}
