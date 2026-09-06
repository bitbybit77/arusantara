import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    Clock3,
    FileCheck2,
    Fingerprint,
    LockKeyhole,
    MapPin,
    Send,
    ShieldAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';

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
    quotations: Array<{
        id: number;
        number: string;
        status: string;
        maker: {
            business_name: string;
            city: string | null;
        };
        revision: {
            revision_number: number;
            grand_total: number;
            lead_time_days: number | null;
        } | null;
    }>;
};

const kw = (value: number | null) =>
    value == null ? 'Belum dapat dihitung' : `${(value / 1000).toFixed(1)} kW`;

const ampere = (value: number | null) =>
    value == null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`;

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Belum tersedia';

const money = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string | null) => {
    if (!value) {
        return 'Belum diatur';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

export default function RfqShow({
    rfq,
    project,
    technical_baseline: baseline,
    preferred_makers: makers,
    quotations,
}: Props) {
    const needsVerification =
        baseline.result_status === 'requires_verification';

    const publish = () => {
        router.post(`/rfqs/${rfq.id}/publish`);
    };

    const supply =
        baseline.recommended_phase !== null
            ? `${baseline.recommended_supply_v ?? '—'} V · ${readable(
                  baseline.recommended_phase,
              )}`
            : 'Perlu verifikasi';

    return (
        <>
            <Head title={`${rfq.number} · ${rfq.title}`} />

            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d] dark:bg-[#0d1512] dark:text-[#edf0eb]">
                <div className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
                    <RfqHeader
                        rfq={rfq}
                        project={project}
                        baseline={baseline}
                        onPublish={publish}
                    />

                    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_330px]">
                        <div className="min-w-0">
                            <TechnicalBaseline
                                projectId={project.id}
                                baseline={baseline}
                                supply={supply}
                                needsVerification={needsVerification}
                            />

                            <QuotationSection quotations={quotations} />

                            <MakerSection makers={makers} />
                        </div>

                        <aside className="h-fit space-y-5 xl:sticky xl:top-6">
                            <RfqDetails rfq={rfq} project={project} />
                            <CustomerNote note={rfq.customer_note} />
                            <BaselineIntegrity
                                baseline={baseline}
                                projectId={project.id}
                            />
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function RfqHeader({
    rfq,
    project,
    baseline,
    onPublish,
}: {
    rfq: Props['rfq'];
    project: Props['project'];
    baseline: Props['technical_baseline'];
    onPublish: () => void;
}) {
    return (
        <header className="border-b border-[#18201d]/12 pb-8 dark:border-white/12">
            <Link
                href={`/projects/${project.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#68736e] transition hover:text-[#153f32] dark:text-[#a8b0aa] dark:hover:text-white"
            >
                ← {project.code}
            </Link>

            <div className="mt-6 grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#c9783d] uppercase">
                            {rfq.number}
                        </span>
                        <StatusBadge status={rfq.status} />
                    </div>

                    <h1 className="mt-4 max-w-4xl font-sans text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
                        {rfq.title}
                    </h1>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-[#68736e] dark:text-[#a8b0aa]">
                        RFQ ini memakai snapshot engineering V{baseline.version}{' '}
                        sebagai baseline teknis.
                    </p>
                </div>

                <div className="border-l border-[#18201d]/12 pl-0 xl:pl-6 dark:border-white/12">
                    <p className="font-mono text-[9px] tracking-[0.13em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                        Status RFQ
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                        {readable(rfq.status)}
                    </p>

                    {rfq.can_publish ? (
                        <button
                            type="button"
                            onClick={onPublish}
                            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#153f32] px-4 text-xs font-semibold text-white transition hover:bg-[#102e27] dark:bg-[#1d5442] dark:hover:bg-[#25654f]"
                        >
                            <Send className="h-4 w-4" />
                            Publikasikan RFQ
                        </button>
                    ) : (
                        <div className="mt-5 flex items-start gap-3 border-t border-[#18201d]/10 pt-4 dark:border-white/10">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7a52]" />
                            <p className="text-[11px] leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                                RFQ sudah dipublikasikan dan dapat menerima
                                quotation.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function TechnicalBaseline({
    projectId,
    baseline,
    supply,
    needsVerification,
}: {
    projectId: number;
    baseline: Props['technical_baseline'];
    supply: string;
    needsVerification: boolean;
}) {
    return (
        <section>
            <div className="flex flex-col gap-5 border-b border-[#18201d]/12 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/12">
                <div>
                    <Eyebrow>Baseline engineering</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Snapshot engineering
                    </h2>
                </div>

                <Link
                    href={`/projects/${projectId}/engineering`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#153f32] transition hover:text-[#c9783d] dark:text-[#7fb49e]"
                >
                    Lihat hasil engineering
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid border-b border-[#18201d]/12 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/12">
                <Metric
                    label="Connected Load"
                    value={kw(baseline.connected_load_w)}
                />
                <Metric
                    label="Design Load"
                    value={kw(baseline.design_load_w)}
                />
                <Metric
                    label="Design Current"
                    value={ampere(baseline.design_current_a)}
                />
                <Metric label="Supply awal" value={supply} />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div
                    className={`border p-5 ${
                        needsVerification
                            ? 'border-[#c9783d]/35 bg-[#c9783d]/7 dark:bg-[#c9783d]/10'
                            : 'border-[#2f7a52]/30 bg-[#2f7a52]/6 dark:bg-[#2f7a52]/10'
                    }`}
                >
                    <div className="grid gap-4 sm:grid-cols-[28px_1fr]">
                        {needsVerification ? (
                            <ShieldAlert className="h-5 w-5 text-[#c9783d]" />
                        ) : (
                            <FileCheck2 className="h-5 w-5 text-[#2f7a52]" />
                        )}

                        <div>
                            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] uppercase opacity-60">
                                Status engineering
                            </p>
                            <h3 className="mt-1 font-sans text-2xl tracking-[-0.03em]">
                                {needsVerification
                                    ? 'Perlu verifikasi'
                                    : 'Hasil tersedia'}
                            </h3>
                            <p className="mt-2 max-w-3xl text-xs leading-6 text-[#68736e] dark:text-[#b6c0ba]">
                                {needsVerification
                                    ? 'Ada parameter yang masih perlu diverifikasi. Buka hasil engineering untuk melihat detailnya.'
                                    : 'Parameter utama pada snapshot tersedia. Verifikasi akhir tetap dilakukan oleh panel maker atau engineer yang bertanggung jawab.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border border-[#18201d]/12 p-5 dark:border-white/12">
                    <p className="font-mono text-[9px] tracking-[0.11em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                        Snapshot
                    </p>
                    <p className="mt-2 font-mono text-sm font-medium">
                        #{baseline.snapshot_id}
                    </p>
                    <p className="mt-4 font-mono text-[9px] tracking-[0.11em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                        Version
                    </p>
                    <p className="mt-2 font-mono text-sm font-medium">
                        V{baseline.version}
                    </p>
                </div>
            </div>
        </section>
    );
}

function QuotationSection({ quotations }: { quotations: Props['quotations'] }) {
    return (
        <section className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#18201d]/12 pb-5 dark:border-white/12">
                <div>
                    <Eyebrow>Quotation</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Penawaran maker
                    </h2>
                </div>

                <p className="font-mono text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                    {quotations.length} quotation
                    {quotations.length === 1 ? '' : 's'}
                </p>
            </div>

            {quotations.length === 0 ? (
                <div className="py-10">
                    <div className="max-w-xl border-l border-[#c9783d] pl-5">
                        <p className="text-sm font-medium">
                            Belum ada quotation yang disubmit.
                        </p>
                        <p className="mt-2 text-xs leading-6 text-[#68736e] dark:text-[#a8b0aa]">
                            Quotation dari maker akan muncul di sini. Baseline
                            RFQ tetap menggunakan snapshot yang sama.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-[#18201d]/10 dark:divide-white/10">
                    {quotations.map((quotation) => (
                        <QuotationRow
                            key={quotation.id}
                            quotation={quotation}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function QuotationRow({
    quotation,
}: {
    quotation: Props['quotations'][number];
}) {
    return (
        <Link
            href={`/quotations/${quotation.id}`}
            className="group grid gap-5 py-6 transition sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
        >
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold">
                        {quotation.maker.business_name}
                    </p>
                    <span className="font-mono text-[9px] text-[#c9783d]">
                        {quotation.number}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                    <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {quotation.maker.city ?? 'Lokasi belum diisi'}
                    </span>
                    <span>{readable(quotation.status)}</span>
                </div>
            </div>

            <div className="sm:min-w-[170px] sm:text-right">
                {quotation.revision ? (
                    <>
                        <p className="font-mono text-[9px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                            Quotation V{quotation.revision.revision_number}
                        </p>
                        <p className="mt-1 font-mono text-sm font-medium">
                            {money(quotation.revision.grand_total)}
                        </p>
                    </>
                ) : (
                    <p className="text-xs text-[#68736e] dark:text-[#a8b0aa]">
                        Revisi belum tersedia
                    </p>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 sm:min-w-[115px] sm:justify-end">
                {quotation.revision && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                        <Clock3 className="h-3 w-3" />
                        {quotation.revision.lead_time_days ?? '—'} hari
                    </span>
                )}
                <ArrowRight className="h-4 w-4 text-[#c9783d] transition group-hover:translate-x-1" />
            </div>
        </Link>
    );
}

function MakerSection({ makers }: { makers: Props['preferred_makers'] }) {
    return (
        <section className="mt-14 border-t border-[#18201d]/12 pt-7 dark:border-white/12">
            <Eyebrow>Akses maker</Eyebrow>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                    Maker yang dipilih
                </h2>
                <span className="font-mono text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                    {makers.length} maker{makers.length === 1 ? '' : 's'}
                </span>
            </div>

            {makers.length === 0 ? (
                <p className="mt-5 max-w-2xl text-xs leading-6 text-[#68736e] dark:text-[#a8b0aa]">
                    Tidak ada preferred maker pada RFQ ini. Current RFQ dapat
                    diperlakukan sebagai RFQ terbuka sesuai aturan akses backend
                    yang berlaku.
                </p>
            ) : (
                <div className="mt-6 grid gap-px border border-[#18201d]/10 bg-[#18201d]/10 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
                    {makers.map((maker) => (
                        <div
                            key={maker.id}
                            className="bg-[#fbfaf6] p-5 dark:bg-[#121c18]"
                        >
                            <Building2 className="h-4 w-4 text-[#c9783d]" />
                            <p className="mt-5 text-sm font-semibold">
                                {maker.business_name}
                            </p>
                            <p className="mt-1 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                                {maker.city ?? 'Lokasi belum diisi'}
                            </p>

                            <div className="mt-5 border-t border-[#18201d]/10 pt-3 dark:border-white/10">
                                <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                                    Maker verification
                                </p>
                                <p className="mt-1 text-[10px] font-medium">
                                    {readable(maker.verification_status)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function RfqDetails({
    rfq,
    project,
}: {
    rfq: Props['rfq'];
    project: Props['project'];
}) {
    return (
        <section className="border border-[#18201d]/12 bg-[#fbfaf6] p-5 dark:border-white/12 dark:bg-[#121c18]">
            <Eyebrow>RFQ details</Eyebrow>

            <dl className="mt-4 divide-y divide-[#18201d]/10 dark:divide-white/10">
                <DetailRow label="Project" value={project.name} />
                <DetailRow
                    label="Business"
                    value={project.business_category ?? 'Belum ditentukan'}
                />
                <DetailRow
                    label="Location"
                    value={rfq.installation_location ?? 'Belum diisi'}
                />
                <DetailRow label="Due" value={formatDate(rfq.due_at)} />
                <DetailRow
                    label="Published"
                    value={
                        rfq.published_at
                            ? formatDate(rfq.published_at)
                            : 'Belum dipublikasikan'
                    }
                />
            </dl>
        </section>
    );
}

function CustomerNote({ note }: { note: string | null }) {
    return (
        <section className="border border-[#18201d]/12 p-5 dark:border-white/12">
            <Eyebrow>Catatan customer</Eyebrow>
            <p className="mt-4 text-xs leading-6 text-[#59665f] dark:text-[#b6c0ba]">
                {note ?? 'Tidak ada catatan tambahan dari customer.'}
            </p>
        </section>
    );
}

function BaselineIntegrity({
    baseline,
    projectId,
}: {
    baseline: Props['technical_baseline'];
    projectId: number;
}) {
    return (
        <section className="bg-[#153f32] p-5 text-white dark:bg-[#173c31]">
            <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#d99a68]" />
                <div>
                    <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#d5e0da] uppercase">
                        Baseline engineering
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-[#d5e0da]">
                        RFQ ini menggunakan snapshot #{baseline.snapshot_id}.
                        Perubahan data setelah RFQ dibuat tidak mengubah
                        baseline ini.
                    </p>
                </div>
            </div>

            <div className="mt-5 border-t border-white/15 pt-4">
                <div className="flex items-start gap-3">
                    <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-[#d99a68]" />
                    <div className="min-w-0">
                        <p className="font-mono text-[8px] tracking-[0.1em] text-[#bfcfc7] uppercase">
                            Input hash
                        </p>
                        <p className="mt-2 font-mono text-[9px] leading-5 break-all text-white">
                            {baseline.input_hash}
                        </p>
                    </div>
                </div>
            </div>

            <Link
                href={`/projects/${projectId}/engineering`}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#f2c69f]"
            >
                Lihat snapshot engineering
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </section>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-b border-[#18201d]/10 py-5 sm:border-r sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:border-r-0 dark:border-white/10">
            <p className="font-mono text-[8px] tracking-[0.09em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                {label}
            </p>
            <p className="mt-2 font-mono text-sm font-medium">{value}</p>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-[90px_1fr] gap-4 py-3 text-[11px]">
            <dt className="text-[#68736e] dark:text-[#a8b0aa]">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className="border border-[#18201d]/14 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase dark:border-white/15">
            {readable(status)}
        </span>
    );
}

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="font-mono text-[9px] font-medium tracking-[0.14em] text-[#c9783d] uppercase">
            {children}
        </p>
    );
}
