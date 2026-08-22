import { Head, Link, router } from '@inertiajs/react';

type Props = {
    rfq: {
        id: number;
        number: string;
        title: string;
        status: string;
        installation_location: string | null;
        due_at: string | null;
        published_at: string | null;
        customer_note: string | null;
        can_publish: boolean;
    };
    project: {
        id: number;
        code: string;
        name: string;
        business_category: string | null;
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
    preferred_makers: Array<{
        id: number;
        business_name: string;
        city: string | null;
        verification_status: string;
    }>;
};

const kw = (value: number | null) => (value == null ? '—' : `${(value / 1000).toFixed(1)} kW`);
const ampere = (value: number | null) => (value == null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`);
const readable = (value: string | null) => value?.replaceAll('_', ' ') ?? '—';

export default function RfqShow({ rfq, project, technical_baseline: baseline, preferred_makers: makers }: Props) {
    const publish = () => {
        router.post(`/rfqs/${rfq.id}/publish`);
    };

    return (
        <>
            <Head title={`${rfq.number} · ${rfq.title}`} />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <Link href={`/projects/${project.id}`} className="text-xs uppercase tracking-[0.2em] text-[#766f64]">
                        ← {project.code}
                    </Link>

                    <header className="mt-6 grid overflow-hidden rounded-[2rem] bg-[#173a32] text-[#f7f3e8] lg:grid-cols-[1.25fr_0.75fr]">
                        <div className="p-7 md:p-10 lg:p-12">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">{rfq.number}</span>
                                <Status status={rfq.status} />
                            </div>
                            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] md:text-6xl">{rfq.title}</h1>
                            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#d6dfda]">
                                Technical baseline berasal dari calculation snapshot V{baseline.version} dan tidak berubah
                                mengikuti pembaruan katalog equipment berikutnya.
                            </p>
                        </div>

                        <div className="border-t border-white/15 bg-white/[0.04] p-7 lg:border-l lg:border-t-0 md:p-10">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#c8d4ce]">Procurement status</p>
                            <p className="mt-4 font-serif text-3xl capitalize">{readable(rfq.status)}</p>

                            {rfq.can_publish && (
                                <button
                                    type="button"
                                    onClick={publish}
                                    className="mt-8 w-full rounded-full bg-[#b56f3d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#9c5c32]"
                                >
                                    Publish RFQ →
                                </button>
                            )}

                            {!rfq.can_publish && (
                                <p className="mt-7 border-t border-white/15 pt-6 text-sm leading-6 text-[#d6dfda]">
                                    RFQ sudah dipublikasikan dan siap memasuki tahap quotation dari panel maker.
                                </p>
                            )}
                        </div>
                    </header>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                        <section className="rounded-[2rem] border border-[#172c26]/15 bg-[#faf8f2] p-7 md:p-9">
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

                            <div className="mt-7 border-t border-[#172c26]/10 pt-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-[#777169]">Result status</p>
                                        <p className="mt-2 font-medium capitalize">{readable(baseline.result_status)}</p>
                                    </div>
                                    <Link
                                        href={`/projects/${project.id}/engineering`}
                                        className="text-sm font-semibold text-[#9c5c32]"
                                    >
                                        Buka technical view →
                                    </Link>
                                </div>
                                <p className="mt-5 break-all font-mono text-[11px] leading-5 text-[#777169]">
                                    Input hash · {baseline.input_hash}
                                </p>
                            </div>
                        </section>

                        <aside className="space-y-5">
                            <section className="rounded-[1.7rem] border border-[#172c26]/15 p-6">
                                <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">RFQ details</p>
                                <dl className="mt-5 divide-y divide-[#172c26]/10 text-sm">
                                    <Row label="Project" value={project.name} />
                                    <Row label="Lokasi" value={rfq.installation_location ?? 'Belum diisi'} />
                                    <Row label="Due date" value={rfq.due_at ?? 'Belum diatur'} />
                                    <Row label="Published" value={rfq.published_at ? 'Sudah' : 'Belum'} />
                                </dl>
                            </section>

                            <section className="rounded-[1.7rem] bg-[#e8ddcb] p-6">
                                <p className="text-xs uppercase tracking-[0.18em] text-[#8a6344]">Customer note</p>
                                <p className="mt-4 text-sm leading-7 text-[#5f584f]">
                                    {rfq.customer_note ?? 'Tidak ada catatan tambahan.'}
                                </p>
                            </section>
                        </aside>
                    </div>

                    <section className="mt-6 rounded-[2rem] border border-[#172c26]/15 p-7 md:p-9">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Preferred panel makers</p>
                        <h2 className="mt-2 font-serif text-3xl">Shortlist procurement</h2>

                        {makers.length === 0 ? (
                            <p className="mt-5 text-sm leading-7 text-[#657069]">
                                Tidak ada preferred maker. RFQ ini dapat diperlakukan sebagai RFQ terbuka.
                            </p>
                        ) : (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {makers.map((maker) => (
                                    <div key={maker.id} className="rounded-[1.4rem] bg-[#faf8f2] p-5">
                                        <p className="font-semibold">{maker.business_name}</p>
                                        <p className="mt-2 text-sm text-[#657069]">{maker.city ?? 'Lokasi belum diisi'}</p>
                                        <p className="mt-4 text-xs font-medium capitalize text-[#8a6344]">
                                            {readable(maker.verification_status)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

function Status({ status }: { status: string }) {
    return (
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
            {readable(status)}
        </span>
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

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-3">
            <dt className="text-[#747a74]">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
        </div>
    );
}
