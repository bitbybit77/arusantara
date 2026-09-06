import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    FileCheck2,
    MessageSquareText,
    Printer,
    ShieldCheck,
    TriangleAlert,
} from 'lucide-react';
import type { ReactNode } from 'react';

type Deviation = {
    id: number;
    baseline_reference: string;
    requested_specification: string;
    proposed_specification: string;
    reason: string;
    price_impact: number;
    lead_time_impact_days: number;
    status: string;
};

type Props = {
    quotation: {
        id: number;
        number: string;
        status: string;
        can_accept: boolean;
        can_discuss: boolean;
    };
    rfq: {
        id: number;
        number: string;
        title: string;
        status: string;
        project_name: string;
    };
    maker: {
        id: number;
        business_name: string;
        city: string | null;
        verification_status: string;
    };
    revision: {
        id: number;
        revision_number: number;
        currency_code: string;
        component_cost: number;
        fabrication_cost: number;
        installation_cost: number;
        other_cost: number;
        subtotal: number;
        discount_amount: number;
        tax_amount: number;
        grand_total: number;
        lead_time_days: number | null;
        warranty_months: number | null;
        notes: string | null;
        submitted_at: string | null;
        items: Array<{
            id: number;
            description: string;
            manufacturer: string | null;
            part_number: string | null;
            quantity: number;
            unit: string;
            unit_price: number;
            line_total: number;
        }>;
        deviations: Deviation[];
    };
    deal: {
        id: number;
        number: string;
        status: string;
        agreed_value: number;
    } | null;
};

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? '—';

const money = (value: number, currencyCode = 'IDR') =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0,
    }).format(value);

const formatDate = (value: string | null) => {
    if (!value) {
        return 'Belum tersedia';
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

export default function QuotationShow({
    quotation,
    rfq,
    maker,
    revision,
    deal,
}: Props) {
    const pendingDeviations = revision.deviations.filter(
        (deviation) => deviation.status === 'pending',
    );

    const acceptedDeviations = revision.deviations.filter(
        (deviation) => deviation.status === 'accepted',
    );

    const respond = (
        deviation: Deviation,
        response: 'accepted' | 'rejected',
    ) => {
        router.post(
            `/quotations/${quotation.id}/deviations/${deviation.id}/respond`,
            { response },
            { preserveScroll: true },
        );
    };

    const discuss = () => {
        router.post(
            `/quotations/${quotation.id}/discuss`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const accept = () => {
        const confirmed = window.confirm(
            `Terima Quotation V${revision.revision_number} dari ${maker.business_name}? Tindakan ini akan membuat Deal berdasarkan quotation revision yang diterima.`,
        );

        if (!confirmed) {
            return;
        }

        router.post(`/quotations/${quotation.id}/accept`);
    };

    return (
        <>
            <Head
                title={`${quotation.number} · Quotation V${revision.revision_number}`}
            />

            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d] dark:bg-[#0d1512] dark:text-[#edf0eb] print:bg-white print:text-black">
                <div className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
                    <header className="border-b border-[#18201d]/10 pb-8 dark:border-white/10 print:border-black/20">
                        <Link
                            href={`/rfqs/${rfq.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#68736e] transition hover:text-[#153f32] dark:text-[#a8b0aa] dark:hover:text-white print:hidden"
                        >
                            ← {rfq.number}
                        </Link>

                        <div className="mt-6 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#c9783d] uppercase">
                                        {quotation.number}
                                    </span>
                                    <StatusBadge status={quotation.status} />
                                    <span className="border border-[#18201d]/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] uppercase dark:border-white/15">
                                        Quotation V{revision.revision_number}
                                    </span>
                                </div>

                                <h1 className="mt-4 max-w-4xl font-sans text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
                                    {rfq.title}
                                </h1>

                                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#68736e] dark:text-[#a8b0aa] print:text-black/60">
                                    <span>{rfq.project_name}</span>
                                    <span className="hidden h-3 w-px bg-current/20 sm:block" />
                                    <span>{maker.business_name}</span>
                                    <span className="hidden h-3 w-px bg-current/20 sm:block" />
                                    <span>
                                        {maker.city ?? 'Lokasi belum diisi'}
                                    </span>
                                    <span className="hidden h-3 w-px bg-current/20 sm:block" />
                                    <span>
                                        {formatDate(revision.submitted_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="border-l border-[#18201d]/10 pl-0 xl:pl-6 dark:border-white/10">
                                <p className="font-mono text-[9px] tracking-[0.13em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                                    Total penawaran
                                </p>
                                <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                                    {money(
                                        revision.grand_total,
                                        revision.currency_code,
                                    )}
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#18201d]/10 pt-4 dark:border-white/10">
                                    <HeaderFact
                                        label="Lead time"
                                        value={
                                            revision.lead_time_days === null
                                                ? '—'
                                                : `${revision.lead_time_days} hari`
                                        }
                                    />
                                    <HeaderFact
                                        label="Warranty"
                                        value={
                                            revision.warranty_months === null
                                                ? '—'
                                                : `${revision.warranty_months} bulan`
                                        }
                                    />
                                </div>

                                <div className="mt-5 flex flex-col gap-2 sm:flex-row xl:flex-col print:hidden">
                                    <button
                                        type="button"
                                        onClick={() => window.print()}
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-[#18201d]/15 px-4 text-xs font-semibold transition hover:bg-[#18201d]/5 dark:border-white/15 dark:hover:bg-white/5"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </button>

                                    {deal === null && quotation.can_discuss && (
                                        <button
                                            type="button"
                                            onClick={discuss}
                                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-[#153f32]/25 px-4 text-xs font-semibold text-[#153f32] transition hover:bg-[#153f32]/5 dark:border-white/20 dark:text-white dark:hover:bg-white/5"
                                        >
                                            <MessageSquareText className="h-4 w-4" />
                                            Bahas / Minta revisi
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="min-w-0">
                            <TechnicalResponse
                                revision={revision}
                                deal={deal}
                                quotation={quotation}
                                respond={respond}
                                discuss={discuss}
                            />

                            <CommercialBreakdown revision={revision} />

                            {revision.notes !== null && (
                                <section className="mt-12 border-t border-[#18201d]/10 pt-6 dark:border-white/10">
                                    <Eyebrow>Maker notes</Eyebrow>
                                    <p className="mt-4 max-w-4xl text-sm leading-7 text-[#59665f] dark:text-[#b6c0ba]">
                                        {revision.notes}
                                    </p>
                                </section>
                            )}
                        </div>

                        <aside className="h-fit space-y-5 xl:sticky xl:top-6">
                            {deal !== null ? (
                                <DealPanel
                                    deal={deal}
                                    revision={revision}
                                    maker={maker}
                                />
                            ) : (
                                <DecisionPanel
                                    quotation={quotation}
                                    revision={revision}
                                    pendingDeviationCount={
                                        pendingDeviations.length
                                    }
                                    acceptedDeviationCount={
                                        acceptedDeviations.length
                                    }
                                    onAccept={accept}
                                    onDiscuss={discuss}
                                />
                            )}

                            <MakerPanel maker={maker} />

                            <RfqContext rfq={rfq} />
                        </aside>
                    </div>

                    <footer className="mt-12 border-t border-[#18201d]/10 py-7 dark:border-white/10 print:border-black/20">
                        <div className="flex items-start gap-3">
                            <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9783d]" />
                            <p className="max-w-4xl text-[10px] leading-5 text-[#68736e] dark:text-[#a8b0aa] print:text-black/60">
                                Quotation ini dibuat untuk RFQ tersebut.
                                Perubahan spesifikasi dicatat sebagai technical
                                deviation dan harus diselesaikan sebelum
                                quotation diterima.
                            </p>
                        </div>
                    </footer>
                </div>
            </main>
        </>
    );
}

function TechnicalResponse({
    revision,
    deal,
    quotation,
    respond,
    discuss,
}: {
    revision: Props['revision'];
    deal: Props['deal'];
    quotation: Props['quotation'];
    respond: (deviation: Deviation, response: 'accepted' | 'rejected') => void;
    discuss: () => void;
}) {
    return (
        <section>
            <div className="flex flex-col gap-5 border-b border-[#18201d]/10 pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
                <div>
                    <Eyebrow>Respons teknis</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Perubahan terhadap baseline
                    </h2>
                </div>

                <p className="font-mono text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                    {revision.deviations.length} deviation
                    {revision.deviations.length === 1 ? '' : 's'}
                </p>
            </div>

            {revision.deviations.length === 0 ? (
                <div className="grid gap-4 border-b border-[#18201d]/10 py-7 sm:grid-cols-[32px_1fr] dark:border-white/10">
                    <ShieldCheck className="h-5 w-5 text-[#2f7a52]" />
                    <div>
                        <p className="text-sm font-semibold">
                            Tidak ada technical deviation pada revisi ini.
                        </p>
                        <p className="mt-2 max-w-3xl text-xs leading-6 text-[#68736e] dark:text-[#a8b0aa]">
                            Tidak ada perubahan spesifikasi dari baseline RFQ
                            pada revisi ini.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-[#18201d]/10 dark:divide-white/10">
                    {revision.deviations.map((deviation, index) => (
                        <DeviationCard
                            key={deviation.id}
                            index={index}
                            deviation={deviation}
                            currencyCode={revision.currency_code}
                            disabled={deal !== null}
                            canDiscuss={quotation.can_discuss}
                            onRespond={respond}
                            onDiscuss={discuss}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function DeviationCard({
    deviation,
    index,
    currencyCode,
    disabled,
    canDiscuss,
    onRespond,
    onDiscuss,
}: {
    deviation: Deviation;
    index: number;
    currencyCode: string;
    disabled: boolean;
    canDiscuss: boolean;
    onRespond: (
        deviation: Deviation,
        response: 'accepted' | 'rejected',
    ) => void;
    onDiscuss: () => void;
}) {
    const pending = deviation.status === 'pending';

    return (
        <article className="py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="font-mono text-[9px] tracking-[0.12em] text-[#c9783d] uppercase">
                        TD-{String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">
                        {deviation.baseline_reference}
                    </h3>
                </div>

                <DeviationStatus status={deviation.status} />
            </div>

            <div className="mt-6 grid gap-px border border-[#18201d]/10 bg-[#18201d]/10 md:grid-cols-2 dark:border-white/10 dark:bg-white/10">
                <SpecBlock
                    label="Requested specification"
                    value={deviation.requested_specification}
                />
                <SpecBlock
                    label="Proposed specification"
                    value={deviation.proposed_specification}
                />
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                    <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                        Reason
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[#59665f] dark:text-[#b6c0ba]">
                        {deviation.reason}
                    </p>
                </div>

                <dl className="grid grid-cols-2 border-y border-[#18201d]/10 py-4 dark:border-white/10">
                    <Impact
                        label="Price impact"
                        value={money(deviation.price_impact, currencyCode)}
                    />
                    <Impact
                        label="Lead-time impact"
                        value={`${deviation.lead_time_impact_days} hari`}
                    />
                </dl>
            </div>

            {pending && !disabled && (
                <div className="mt-6 border-l-2 border-[#c9783d] pl-4 print:hidden">
                    <p className="text-xs font-semibold">
                        Keputusan customer diperlukan
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                        Pilih Terima, Bahas, atau Tolak. Perubahan tidak
                        diterapkan diam-diam.
                    </p>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => onRespond(deviation, 'accepted')}
                            className="inline-flex h-10 items-center justify-center gap-2 bg-[#153f32] px-4 text-[11px] font-semibold text-white transition hover:bg-[#102e27] dark:bg-[#1d5442]"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Terima
                        </button>

                        {canDiscuss && (
                            <button
                                type="button"
                                onClick={onDiscuss}
                                className="inline-flex h-10 items-center justify-center gap-2 border border-[#18201d]/15 px-4 text-[11px] font-semibold transition hover:bg-[#18201d]/5 dark:border-white/15 dark:hover:bg-white/5"
                            >
                                <MessageSquareText className="h-3.5 w-3.5" />
                                Bahas
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => onRespond(deviation, 'rejected')}
                            className="inline-flex h-10 items-center justify-center border border-[#9a4d3f]/30 px-4 text-[11px] font-semibold text-[#8b4439] transition hover:bg-[#9a4d3f]/5 dark:text-[#efb4aa]"
                        >
                            Tolak
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
}

function CommercialBreakdown({ revision }: { revision: Props['revision'] }) {
    return (
        <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#18201d]/10 pb-5 dark:border-white/10">
                <div>
                    <Eyebrow>Rincian biaya</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Item quotation
                    </h2>
                </div>

                <span className="font-mono text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                    {revision.items.length} item
                    {revision.items.length === 1 ? '' : 's'}
                </span>
            </div>

            <div className="hidden md:block">
                <div className="grid grid-cols-[minmax(0,1fr)_160px_100px_160px_160px] gap-4 border-b border-[#18201d]/10 py-3 font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:border-white/10 dark:text-[#a8b0aa]">
                    <span>Item</span>
                    <span>Manufacturer / part</span>
                    <span className="text-right">Qty</span>
                    <span className="text-right">Unit price</span>
                    <span className="text-right">Line total</span>
                </div>

                <div className="divide-y divide-[#18201d]/10 dark:divide-white/10">
                    {revision.items.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-[minmax(0,1fr)_160px_100px_160px_160px] gap-4 py-5 text-sm"
                        >
                            <span className="font-medium">
                                {item.description}
                            </span>
                            <span className="text-xs leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                                {item.manufacturer ?? '—'}
                                {item.part_number
                                    ? ` · ${item.part_number}`
                                    : ''}
                            </span>
                            <span className="text-right font-mono text-xs">
                                {item.quantity} {item.unit}
                            </span>
                            <span className="text-right font-mono text-xs">
                                {money(item.unit_price, revision.currency_code)}
                            </span>
                            <span className="text-right font-mono text-xs font-semibold">
                                {money(item.line_total, revision.currency_code)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="divide-y divide-[#18201d]/10 md:hidden dark:divide-white/10">
                {revision.items.map((item) => (
                    <article key={item.id} className="py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">
                                    {item.description}
                                </p>
                                <p className="mt-1 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                                    {item.manufacturer ?? 'Manufacturer —'}
                                    {item.part_number
                                        ? ` · ${item.part_number}`
                                        : ''}
                                </p>
                            </div>
                            <p className="font-mono text-xs font-semibold">
                                {money(item.line_total, revision.currency_code)}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#18201d]/10 pt-3 text-[10px] dark:border-white/10">
                            <span className="text-[#68736e] dark:text-[#a8b0aa]">
                                {item.quantity} {item.unit}
                            </span>
                            <span>
                                {money(item.unit_price, revision.currency_code)}{' '}
                                / {item.unit}
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            <dl className="mt-7 ml-auto max-w-lg border-t border-[#18201d]/10 dark:border-white/10">
                <MoneyRow
                    label="Components"
                    value={revision.component_cost}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Fabrication"
                    value={revision.fabrication_cost}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Installation"
                    value={revision.installation_cost}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Other"
                    value={revision.other_cost}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Subtotal"
                    value={revision.subtotal}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Discount"
                    value={-revision.discount_amount}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Tax"
                    value={revision.tax_amount}
                    currencyCode={revision.currency_code}
                />
                <MoneyRow
                    label="Grand total"
                    value={revision.grand_total}
                    currencyCode={revision.currency_code}
                    strong
                />
            </dl>
        </section>
    );
}

function DecisionPanel({
    quotation,
    revision,
    pendingDeviationCount,
    acceptedDeviationCount,
    onAccept,
    onDiscuss,
}: {
    quotation: Props['quotation'];
    revision: Props['revision'];
    pendingDeviationCount: number;
    acceptedDeviationCount: number;
    onAccept: () => void;
    onDiscuss: () => void;
}) {
    return (
        <section className="border border-[#18201d]/10 bg-[#fbfaf6] p-5 dark:border-white/10 dark:bg-[#121c18] print:hidden">
            <Eyebrow>Keputusan customer</Eyebrow>

            <p className="mt-3 text-xl font-semibold tracking-[-0.02em]">
                Quotation V{revision.revision_number}
            </p>

            <dl className="mt-5 divide-y divide-[#18201d]/10 dark:divide-white/10">
                <SideFact
                    label="Pending deviation"
                    value={String(pendingDeviationCount)}
                />
                <SideFact
                    label="Deviation disetujui"
                    value={String(acceptedDeviationCount)}
                />
                <SideFact
                    label="Status quotation"
                    value={readable(quotation.status)}
                />
            </dl>

            {pendingDeviationCount > 0 && (
                <div className="mt-5 flex items-start gap-3 border-l-2 border-[#c9783d] pl-4">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#c9783d]" />
                    <p className="text-[11px] leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                        Selesaikan technical deviation yang masih pending
                        sebelum quotation diterima.
                    </p>
                </div>
            )}

            {quotation.can_accept ? (
                <button
                    type="button"
                    onClick={onAccept}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-[#153f32] px-4 text-xs font-semibold text-white transition hover:bg-[#102e27] dark:bg-[#1d5442]"
                >
                    Terima quotation
                    <ArrowRight className="h-4 w-4" />
                </button>
            ) : (
                <div className="mt-5 border border-[#18201d]/10 p-4 dark:border-white/10">
                    <p className="text-[11px] font-semibold">
                        Quotation belum dapat diterima.
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                        Ikuti status deviation atau negotiation sampai backend
                        membuka acceptance.
                    </p>
                </div>
            )}

            {quotation.can_discuss && (
                <button
                    type="button"
                    onClick={onDiscuss}
                    className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 border border-[#18201d]/15 px-4 text-xs font-semibold transition hover:bg-[#18201d]/5 dark:border-white/15 dark:hover:bg-white/5"
                >
                    <MessageSquareText className="h-4 w-4" />
                    Bahas / Minta revisi
                </button>
            )}
        </section>
    );
}

function DealPanel({
    deal,
    revision,
    maker,
}: {
    deal: NonNullable<Props['deal']>;
    revision: Props['revision'];
    maker: Props['maker'];
}) {
    return (
        <section className="bg-[#153f32] p-5 text-white dark:bg-[#173c31] print:border print:border-black/20 print:bg-white print:text-black">
            <div className="flex items-start gap-3">
                <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-[#d99a68] print:text-black" />
                <div>
                    <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#d5e0da] uppercase print:text-black/60">
                        Deal created
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                        {deal.number}
                    </p>
                    <p className="mt-2 text-[11px] text-[#d5e0da] print:text-black/70">
                        {maker.business_name} · Quotation V
                        {revision.revision_number}
                    </p>
                </div>
            </div>

            <dl className="mt-5 divide-y divide-white/15 border-t border-white/15 print:divide-black/15 print:border-black/15">
                <DealFact label="Status" value={readable(deal.status)} />
                <DealFact
                    label="Agreed value"
                    value={money(deal.agreed_value, revision.currency_code)}
                />
            </dl>

            <p className="mt-5 text-[10px] leading-5 text-[#c9d8d1] print:text-black/60">
                Deal dibuat dari revisi quotation yang diterima.
            </p>
        </section>
    );
}

function MakerPanel({ maker }: { maker: Props['maker'] }) {
    return (
        <section className="border border-[#18201d]/10 p-5 dark:border-white/10">
            <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9783d]" />
                <div>
                    <Eyebrow>Panel maker</Eyebrow>
                    <p className="mt-2 text-sm font-semibold">
                        {maker.business_name}
                    </p>
                    <p className="mt-1 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                        {maker.city ?? 'Lokasi belum diisi'}
                    </p>
                </div>
            </div>

            <div className="mt-5 border-t border-[#18201d]/10 pt-4 dark:border-white/10">
                <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                    Verification status
                </p>
                <p className="mt-1 text-[10px] font-medium">
                    {readable(maker.verification_status)}
                </p>
            </div>
        </section>
    );
}

function RfqContext({ rfq }: { rfq: Props['rfq'] }) {
    return (
        <section className="border border-[#18201d]/10 p-5 dark:border-white/10">
            <Eyebrow>RFQ context</Eyebrow>
            <p className="mt-3 font-mono text-[10px] font-semibold">
                {rfq.number}
            </p>
            <p className="mt-2 text-sm font-medium">{rfq.title}</p>
            <p className="mt-2 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                Status · {readable(rfq.status)}
            </p>

            <Link
                href={`/rfqs/${rfq.id}`}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#153f32] dark:text-[#7fb49e]"
            >
                Open RFQ
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </section>
    );
}

function HeaderFact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                {label}
            </p>
            <p className="mt-1 text-[11px] font-medium">{value}</p>
        </div>
    );
}

function SideFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 text-[11px]">
            <dt className="text-[#68736e] dark:text-[#a8b0aa]">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

function DealFact({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 text-[11px]">
            <dt className="text-[#c9d8d1] print:text-black/60">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}

function Impact({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                {label}
            </dt>
            <dd className="mt-1 font-mono text-[10px] font-medium">{value}</dd>
        </div>
    );
}

function MoneyRow({
    label,
    value,
    currencyCode,
    strong = false,
}: {
    label: string;
    value: number;
    currencyCode: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 border-b border-[#18201d]/10 py-3 last:border-0 dark:border-white/10 ${
                strong ? 'pt-5' : ''
            }`}
        >
            <dt
                className={
                    strong
                        ? 'font-semibold'
                        : 'text-[#68736e] dark:text-[#a8b0aa]'
                }
            >
                {label}
            </dt>
            <dd
                className={
                    strong
                        ? 'font-mono text-lg font-semibold'
                        : 'font-mono text-xs font-medium'
                }
            >
                {money(value, currencyCode)}
            </dd>
        </div>
    );
}

function SpecBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-[#fbfaf6] p-5 dark:bg-[#121c18] print:bg-white">
            <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa] print:text-black/50">
                {label}
            </p>
            <p className="mt-3 text-sm leading-6">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className="border border-[#18201d]/15 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase dark:border-white/15">
            {readable(status)}
        </span>
    );
}

function DeviationStatus({ status }: { status: string }) {
    const tone =
        status === 'accepted'
            ? 'border-[#2f7a52]/40 text-[#2f7a52]'
            : status === 'rejected'
              ? 'border-[#9a4d3f]/35 text-[#8b4439] dark:text-[#efb4aa]'
              : status === 'pending'
                ? 'border-[#c9783d]/40 text-[#a95f2d] dark:text-[#e1a578]'
                : 'border-[#18201d]/15 text-[#68736e] dark:border-white/15 dark:text-[#a8b0aa]';

    return (
        <span
            className={`w-fit border px-2.5 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase ${tone}`}
        >
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
