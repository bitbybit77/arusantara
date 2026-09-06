import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

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
        current_revision_number: number | null;
        can_edit: boolean;
        can_create_revision: boolean;
    } | null;
};

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Belum tersedia';
const kw = (value: number | null) =>
    value === null ? 'Perlu verifikasi' : `${(value / 1000).toFixed(1)} kW`;
const ampere = (value: number | null) =>
    value === null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`;

export default function MakerRfqShow({
    rfq,
    project,
    customer,
    technical_baseline: baseline,
    quotation,
}: Props) {
    const createQuotation = () => {
        router.post(`/maker/rfqs/${rfq.id}/quotation`);
    };

    const createRevision = () => {
        if (quotation !== null) {
            router.post(`/maker/quotations/${quotation.id}/revisions`);
        }
    };

    return (
        <>
            <Head title={`${rfq.number} · RFQ`} />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <Link
                        href="/maker/rfqs"
                        className="text-sm font-medium text-[#68736e] hover:text-[#153f32]"
                    >
                        ← RFQ masuk
                    </Link>

                    <header className="mt-5 flex flex-col gap-6 border-b border-[#153f32]/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-[#c9783d]">
                                    {rfq.number}
                                </span>
                                <span className="text-xs text-[#8a938f]">
                                    •
                                </span>
                                <span className="text-xs text-[#68736e]">
                                    {readable(rfq.status)}
                                </span>
                            </div>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                {rfq.title}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-[#68736e]">
                                {customer.name} · {project.name} ·{' '}
                                {rfq.installation_location ??
                                    'Lokasi belum diisi'}
                            </p>
                        </div>

                        <QuotationAction
                            quotation={quotation}
                            onCreate={createQuotation}
                            onCreateRevision={createRevision}
                        />
                    </header>

                    <section className="mt-7 rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-7">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Baseline engineering
                                </h2>
                                <p className="mt-1 text-sm text-[#68736e]">
                                    Snapshot V{baseline.version} yang dibawa
                                    oleh RFQ.
                                </p>
                            </div>
                            <span className="text-xs text-[#68736e]">
                                {readable(baseline.result_status)}
                            </span>
                        </div>

                        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Metric
                                label="Connected load"
                                value={kw(baseline.connected_load_w)}
                            />
                            <Metric
                                label="Design load"
                                value={kw(baseline.design_load_w)}
                            />
                            <Metric
                                label="Design current"
                                value={ampere(baseline.design_current_a)}
                            />
                            <Metric
                                label="Supply awal"
                                value={`${baseline.recommended_supply_v ?? '—'} V · ${readable(baseline.recommended_phase)}`}
                            />
                        </dl>

                        <div className="mt-5 grid gap-4 border-t border-[#153f32]/10 pt-5 sm:grid-cols-2">
                            <Info
                                label="Batas quotation"
                                value={rfq.due_at ?? 'Tidak ditentukan'}
                            />
                            <Info
                                label="Snapshot ID"
                                value={`#${baseline.snapshot_id}`}
                            />
                        </div>

                        <p className="mt-5 rounded-lg bg-[#f7f5ef] px-3 py-2 font-mono text-[10px] leading-5 break-all text-[#68736e]">
                            Input hash · {baseline.input_hash}
                        </p>
                    </section>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <section className="rounded-xl border border-[#153f32]/10 bg-white p-6">
                            <h2 className="text-sm font-semibold">
                                Catatan customer
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#68736e]">
                                {rfq.customer_note ??
                                    'Tidak ada catatan tambahan.'}
                            </p>
                        </section>

                        <section className="rounded-xl border border-[#c9783d]/20 bg-[#c9783d]/[0.06] p-6">
                            <h2 className="text-sm font-semibold">
                                Technical deviation
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-[#68736e]">
                                Jika spesifikasi yang ditawarkan berbeda dari
                                baseline, catat perubahannya di quotation
                                beserta alasan dan dampaknya.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
}

function QuotationAction({
    quotation,
    onCreate,
    onCreateRevision,
}: {
    quotation: Props['quotation'];
    onCreate: () => void;
    onCreateRevision: () => void;
}) {
    if (quotation === null) {
        return (
            <button
                type="button"
                onClick={onCreate}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947]"
            >
                Buat quotation V1
                <ArrowRight className="h-4 w-4" />
            </button>
        );
    }

    if (quotation.can_edit) {
        return (
            <Link
                href={`/maker/quotations/${quotation.id}/edit`}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947]"
            >
                Lanjutkan draft
                <ArrowRight className="h-4 w-4" />
            </Link>
        );
    }

    if (quotation.can_create_revision) {
        return (
            <button
                type="button"
                onClick={onCreateRevision}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947]"
            >
                Buat quotation V{(quotation.current_revision_number ?? 1) + 1}
                <ArrowRight className="h-4 w-4" />
            </button>
        );
    }

    return (
        <div className="rounded-xl border border-[#153f32]/10 bg-white px-4 py-3 text-sm">
            <p className="font-semibold">{quotation.number}</p>
            <p className="mt-1 text-xs text-[#68736e]">
                {readable(quotation.status)}
            </p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-[#f7f5ef] p-4">
            <dt className="text-xs text-[#68736e]">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-[#68736e]">{label}</dt>
            <dd className="mt-1 text-sm font-medium">{value}</dd>
        </div>
    );
}
