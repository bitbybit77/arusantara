import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    ChevronDown,
    ClipboardList,
    FileText,
    Fingerprint,
    Info,
    Printer,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

type Warning = {
    code?: string;
    message?: string;
};

type Assumption = {
    code?: string;
    message?: string;
    value?: unknown;
};

type Line = {
    description: string;
    quantity: number;
    rated_power_w: number | null;
    design_power_w: number | null;
    design_current_a: number | null;
    phase: string | null;
    result_status: string;
    calculation_detail: Record<string, unknown>;
};

type Props = {
    project: {
        id: number;
        code: string;
        name: string;
        business_category: string | null;
    };
    result: {
        version: number;
        calculator_version: string;
        connected_load_w: number | null;
        design_load_w: number | null;
        design_current_a: number | null;
        recommended_supply_v: number | null;
        recommended_phase: string | null;
        result_status: string;
        assumptions: Assumption[];
        warnings: Warning[];
        input_hash: string;
        calculated_at: string | null;
        lines: Line[];
    };
};

type ViewMode = 'simple' | 'technical';

const kw = (value: number | null) =>
    value == null ? 'Belum dapat dihitung' : `${(value / 1000).toFixed(1)} kW`;

const ampere = (value: number | null) =>
    value == null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`;

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Belum tersedia';

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

const formatUnknown = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
        return 'Belum tersedia';
    }

    if (typeof value === 'boolean') {
        return value ? 'Ya' : 'Tidak';
    }

    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }

    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

export default function EngineeringShow({ project, result }: Props) {
    const [view, setView] = useState<ViewMode>('simple');
    const needsVerification = result.result_status === 'requires_verification';
    const warningMessages = result.warnings.map(
        (item) => item.message || item.code || 'Warning',
    );
    const assumptionMessages = result.assumptions.map(
        (item) => item.message || item.code || 'Assumption',
    );
    const supply = result.recommended_phase
        ? `${result.recommended_supply_v ?? '-'} V / ${readable(result.recommended_phase)}`
        : 'Perlu verifikasi';

    return (
        <>
            <Head title={`Engineering Result - ${project.name}`} />
            <style>{`
                @keyframes result-enter {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .result-enter { animation: result-enter .28s cubic-bezier(.2,.8,.2,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .result-enter { animation: none !important; }
                }
                @media print {
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="mx-auto w-full max-w-[1220px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
                <header className="result-enter flex flex-col gap-6 border-b border-[#153f32]/12 pb-8 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <Link
                            href={`/projects/${project.id}`}
                            className="text-[11px] font-medium text-[#68736e] transition hover:text-[#153f32]"
                        >
                            ← {project.name}
                        </Link>
                        <h1 className="mt-2 text-[32px] leading-[1.02] font-semibold tracking-[-0.045em] text-[#18201d] sm:text-[38px]">
                            Hasil engineering
                        </h1>
                        <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#68736e]">
                            Hasil dari konfigurasi yang sudah dikunci. Data yang
                            belum lengkap tetap ditandai untuk verifikasi.
                        </p>
                    </div>

                    <div className="no-print flex flex-wrap items-center gap-2">
                        <SegmentedControl view={view} setView={setView} />
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#153f32]/15 bg-white px-4 text-[12px] font-medium text-[#153f32] transition hover:bg-[#f8f5ed]"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Print
                        </button>
                        <Link
                            href={`/projects/${project.id}/rfq/create`}
                            className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#153f32] px-4 text-[12px] font-semibold text-white transition hover:bg-[#102f27]"
                        >
                            Buat RFQ
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </header>

                <section className="result-enter mt-8 overflow-hidden rounded-xl bg-[#153f32] text-[#f6f1e7]">
                    <div className="grid gap-7 px-6 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-8 md:py-8">
                        <div className="max-w-2xl">
                            <p className="text-[10px] font-medium text-white/48">
                                Snapshot perhitungan
                            </p>
                            <h2 className="mt-2 max-w-xl text-[25px] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[29px]">
                                Data yang tersedia menjadi dasar perhitungan.
                            </h2>
                            <p className="mt-3 max-w-xl text-[11px] leading-5 text-white/55">
                                Parameter yang belum tersedia tidak diisi dengan
                                angka perkiraan.
                            </p>
                        </div>

                        <div className="min-w-[230px] rounded-lg bg-[#f6f1e7] px-4 py-4 text-[#153f32]">
                            <StatusPill needsVerification={needsVerification} />
                            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-[10px] leading-4 text-[#68736e]">
                                <MetaItem
                                    label="Snapshot"
                                    value={`V${result.version}`}
                                />
                                <MetaItem
                                    label="Engine"
                                    value={result.calculator_version}
                                />
                                <MetaItem
                                    label="Load line"
                                    value={String(result.lines.length)}
                                />
                                <MetaItem
                                    label="Calculated"
                                    value={formatDate(result.calculated_at)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div key={view} className="result-enter">
                    {view === 'simple' ? (
                        <SimpleView
                            result={result}
                            needsVerification={needsVerification}
                            supply={supply}
                            warnings={warningMessages}
                        />
                    ) : (
                        <TechnicalView
                            result={result}
                            needsVerification={needsVerification}
                            supply={supply}
                            warnings={warningMessages}
                            assumptions={assumptionMessages}
                        />
                    )}
                </div>

                <SafetyBoundary />
            </div>
        </>
    );
}

function SegmentedControl({
    view,
    setView,
}: {
    view: ViewMode;
    setView: (view: ViewMode) => void;
}) {
    return (
        <div className="grid h-10 grid-cols-2 rounded-lg border border-[#153f32]/15 bg-[#f6f1e7] p-1">
            <ViewButton
                active={view === 'simple'}
                onClick={() => setView('simple')}
            >
                Ringkas
            </ViewButton>
            <ViewButton
                active={view === 'technical'}
                onClick={() => setView('technical')}
            >
                Teknis
            </ViewButton>
        </div>
    );
}

function ViewButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md px-3 text-[11px] font-semibold transition ${active ? 'bg-white text-[#153f32] shadow-sm' : 'text-[#68736e] hover:text-[#153f32]'}`}
        >
            {children}
        </button>
    );
}

function StatusPill({ needsVerification }: { needsVerification: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-semibold ${needsVerification ? 'bg-[#c9783d]/12 text-[#9b5429]' : 'bg-[#153f32]/8 text-[#153f32]'}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${needsVerification ? 'bg-[#c9783d]' : 'bg-[#255947]'}`}
            />
            {needsVerification ? 'Perlu verifikasi' : 'Selesai'}
        </span>
    );
}

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <p className="text-[9px] font-medium text-[#7a837f]">{label}</p>
            <p className="mt-0.5 font-semibold break-words text-[#18201d]">
                {value}
            </p>
        </div>
    );
}

function SimpleView({
    result,
    needsVerification,
    supply,
    warnings,
}: {
    result: Props['result'];
    needsVerification: boolean;
    supply: string;
    warnings: string[];
}) {
    return (
        <div className="py-9">
            <section>
                <SectionHeading
                    kicker="Ringkasan"
                    title="Hasil utama"
                    description="Empat output utama untuk membaca kebutuhan awal sebelum masuk ke detail teknis."
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Connected load"
                        value={kw(result.connected_load_w)}
                        note="Total daya terpasang dari equipment"
                    />
                    <MetricCard
                        label="Design load"
                        value={kw(result.design_load_w)}
                        note="Beban yang digunakan oleh engine"
                    />
                    <MetricCard
                        label="Design current"
                        value={ampere(result.design_current_a)}
                        note="Dihitung hanya ketika input memadai"
                    />
                    <MetricCard
                        label="Supply awal"
                        value={supply}
                        note="Rekomendasi awal dari data yang tersedia"
                        emphasis
                    />
                </div>
            </section>

            <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
                <section>
                    <SurfaceHeader
                        title="Equipment yang dihitung"
                        description="Equipment dari konfigurasi yang sudah dikunci."
                        aside={`${result.lines.length} load line`}
                    />

                    <div>
                        {result.lines.map((line, index) => (
                            <div
                                key={`${line.description}-${index}`}
                                className="grid gap-4 border-b border-[#153f32]/10 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-[12px] font-semibold text-[#18201d]">
                                            {line.description}
                                        </p>
                                        <LineStatus
                                            status={line.result_status}
                                        />
                                    </div>
                                    <p className="mt-1 text-[10px] leading-5 text-[#68736e]">
                                        Qty {line.quantity} ·{' '}
                                        {formatPhaseShort(line.phase)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-x-7 text-left sm:text-right">
                                    <DataPair
                                        label="Design power"
                                        value={kw(line.design_power_w)}
                                    />
                                    <DataPair
                                        label="Current"
                                        value={ampere(line.design_current_a)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-5 lg:border-l lg:border-[#153f32]/12 lg:pl-7">
                    <VerificationCard needsVerification={needsVerification} />
                    <DetailList
                        title="Perlu diperhatikan"
                        icon={<AlertTriangle className="h-4 w-4" />}
                        items={warnings}
                        empty="Tidak ada peringatan pada hasil ini."
                        compact
                    />
                </aside>
            </div>
        </div>
    );
}

function SectionHeading({
    kicker,
    title,
    description,
}: {
    kicker: string;
    title: string;
    description: string;
}) {
    return (
        <div>
            <p className="text-[10px] font-medium text-[#c9783d]">{kicker}</p>
            <h2 className="mt-1.5 text-[15px] font-semibold tracking-[-0.015em] text-[#18201d]">
                {title}
            </h2>
            <p className="mt-1 max-w-2xl text-[10px] leading-5 text-[#7a837f]">
                {description}
            </p>
        </div>
    );
}

function MetricCard({
    label,
    value,
    note,
    emphasis = false,
}: {
    label: string;
    value: string;
    note: string;
    emphasis?: boolean;
}) {
    return (
        <article
            className={`min-h-[142px] rounded-xl border p-5 ${emphasis ? 'border-[#153f32]/12 bg-[#f6f1e7]' : 'border-[#153f32]/10 bg-white'}`}
        >
            <p className="text-[10px] font-medium text-[#68736e]">{label}</p>
            <p className="mt-4 text-[24px] leading-tight font-semibold tracking-[-0.035em] text-[#18201d]">
                {value}
            </p>
            <p className="mt-3 text-[10px] leading-5 text-[#7a837f]">{note}</p>
        </article>
    );
}

function VerificationCard({
    needsVerification,
}: {
    needsVerification: boolean;
}) {
    return (
        <section>
            <div className="flex items-start gap-3">
                <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${needsVerification ? 'bg-[#c9783d]/10 text-[#c9783d]' : 'bg-[#153f32]/8 text-[#255947]'}`}
                >
                    {needsVerification ? (
                        <AlertTriangle className="h-4 w-4" />
                    ) : (
                        <ShieldCheck className="h-4 w-4" />
                    )}
                </span>
                <div>
                    <p className="text-[10px] font-medium text-[#7a837f]">
                        Result status
                    </p>
                    <h2 className="mt-1 text-[12px] leading-5 font-semibold text-[#18201d]">
                        {needsVerification
                            ? 'Ada data yang perlu diverifikasi'
                            : 'Input calculation memadai'}
                    </h2>
                    <p className="mt-2 text-[10px] leading-5 text-[#68736e]">
                        {needsVerification
                            ? 'Arusantara tidak mengisi parameter yang tidak tersedia dengan angka perkiraan.'
                            : 'Engine dapat menyelesaikan calculation sesuai input dan rule yang tersedia.'}
                    </p>
                </div>
            </div>
        </section>
    );
}

function SurfaceHeader({
    title,
    description,
    aside,
}: {
    title: string;
    description: string;
    aside?: string;
}) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#153f32]/12 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.015em] text-[#18201d]">
                    {title}
                </h2>
                <p className="mt-1 text-[10px] leading-5 text-[#7a837f]">
                    {description}
                </p>
            </div>
            {aside ? (
                <span className="shrink-0 text-[10px] font-medium text-[#68736e]">
                    {aside}
                </span>
            ) : null}
        </div>
    );
}

function LineStatus({ status }: { status: string }) {
    const requiresVerification = status === 'requires_verification';

    return (
        <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${requiresVerification ? 'bg-[#c9783d]/10 text-[#9b5429]' : 'bg-[#153f32]/[0.06] text-[#255947]'}`}
        >
            {requiresVerification ? 'Perlu verifikasi' : readable(status)}
        </span>
    );
}

function DataPair({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[9px] font-medium text-[#7a837f]">{label}</p>
            <p className="mt-1 text-[11px] font-semibold tracking-[-0.01em] text-[#18201d]">
                {value}
            </p>
        </div>
    );
}

function TechnicalView({
    result,
    needsVerification,
    supply,
    warnings,
    assumptions,
}: {
    result: Props['result'];
    needsVerification: boolean;
    supply: string;
    warnings: string[];
    assumptions: string[];
}) {
    return (
        <div className="py-9">
            <SectionHeading
                kicker="Detail teknis"
                title="Detail perhitungan"
                description="Snapshot, detail beban, peringatan, dan rincian perhitungan."
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <TraceItem
                    icon={<Fingerprint className="h-4 w-4" />}
                    label="Snapshot"
                    value={`V${result.version}`}
                />
                <TraceItem
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="Calculator"
                    value={result.calculator_version}
                />
                <TraceItem
                    icon={<ShieldCheck className="h-4 w-4" />}
                    label="Result"
                    value={
                        needsVerification
                            ? 'Requires verification'
                            : readable(result.result_status)
                    }
                />
                <TraceItem
                    icon={<FileText className="h-4 w-4" />}
                    label="Supply"
                    value={supply}
                />
            </div>

            <section className="mt-8">
                <SurfaceHeader
                    title="Detail beban"
                    description="Nilai teknis yang tersimpan pada snapshot perhitungan ini."
                    aside={`${result.lines.length} load line`}
                />

                <div className="overflow-x-auto border-b border-[#153f32]/10">
                    <table className="w-full min-w-[940px] text-left text-[11px]">
                        <thead className="text-[9px] font-semibold tracking-[0.05em] text-[#68736e] uppercase">
                            <tr className="border-b border-[#153f32]/10">
                                <Th>Equipment</Th>
                                <Th>Qty</Th>
                                <Th>Rated power</Th>
                                <Th>Design power</Th>
                                <Th>Design current</Th>
                                <Th>Phase</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.lines.map((line, index) => (
                                <tr
                                    key={`${line.description}-${index}`}
                                    className="border-b border-[#153f32]/8 transition last:border-0 hover:bg-[#f8f5ed]"
                                >
                                    <Td>
                                        <span className="font-semibold text-[#18201d]">
                                            {line.description}
                                        </span>
                                    </Td>
                                    <Td>{line.quantity}</Td>
                                    <Td>{kw(line.rated_power_w)}</Td>
                                    <Td>{kw(line.design_power_w)}</Td>
                                    <Td>{ampere(line.design_current_a)}</Td>
                                    <Td>{formatPhaseShort(line.phase)}</Td>
                                    <Td>
                                        <LineStatus
                                            status={line.result_status}
                                        />
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="border-b border-[#153f32]/10 bg-[#f6f1e7]/70 px-4 py-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[9px] font-medium text-[#68736e]">
                            Input hash
                        </span>
                        <code className="font-mono text-[9px] break-all text-[#68736e]">
                            {result.input_hash}
                        </code>
                    </div>
                </div>
            </section>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <DetailList
                    title="Peringatan"
                    icon={<AlertTriangle className="h-4 w-4" />}
                    items={warnings}
                    empty="Tidak ada warning."
                />
                <DetailList
                    title="Asumsi"
                    icon={<Info className="h-4 w-4" />}
                    items={assumptions}
                    empty="Tidak ada assumption tambahan."
                />
            </div>

            <section className="mt-9">
                <SurfaceHeader
                    title="Rincian perhitungan"
                    description="Buka tiap equipment untuk melihat nilai yang digunakan."
                />
                <div>
                    {result.lines.map((line, index) => (
                        <details
                            key={`${line.description}-detail-${index}`}
                            className="group border-b border-[#153f32]/10 py-4"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-semibold text-[#18201d]">
                                <div className="min-w-0">
                                    <span className="block truncate">
                                        {line.description}
                                    </span>
                                    <span className="mt-1 block text-[9px] font-normal text-[#68736e]">
                                        Qty {line.quantity} ·{' '}
                                        {formatPhaseShort(line.phase)}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 text-[#68736e] transition-transform group-open:rotate-180" />
                            </summary>
                            <dl className="mt-4 grid gap-x-6 rounded-lg bg-[#f6f1e7]/60 p-4 text-[10px] sm:grid-cols-2">
                                {Object.entries(line.calculation_detail).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 border-b border-[#153f32]/8 py-2 first:pt-0 last:border-0 last:pb-0"
                                        >
                                            <dt className="text-[#68736e]">
                                                {readable(key)}
                                            </dt>
                                            <dd className="font-medium break-words text-[#18201d]">
                                                {formatUnknown(value)}
                                            </dd>
                                        </div>
                                    ),
                                )}
                            </dl>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}

function TraceItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-h-[90px] min-w-0 items-start gap-3 rounded-xl border border-[#153f32]/10 bg-white p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#153f32]/[0.06] text-[#255947]">
                {icon}
            </span>
            <div className="min-w-0 pt-0.5">
                <p className="text-[9px] font-medium text-[#7a837f]">{label}</p>
                <p className="mt-1.5 truncate text-[11px] font-semibold tracking-[-0.01em] text-[#18201d]">
                    {value}
                </p>
            </div>
        </div>
    );
}

function DetailList({
    title,
    icon,
    items,
    empty,
    compact = false,
}: {
    title: string;
    icon: ReactNode;
    items: string[];
    empty: string;
    compact?: boolean;
}) {
    return (
        <section>
            <div className="flex items-center justify-between gap-3 border-b border-[#153f32]/12 pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="text-[#c9783d]">{icon}</span>
                    <h2 className="text-[12px] font-semibold text-[#18201d]">
                        {title}
                    </h2>
                </div>
                <span className="text-[9px] font-medium text-[#7a837f]">
                    {items.length}
                </span>
            </div>
            <div className={compact ? 'mt-4 space-y-2.5' : 'mt-4 space-y-3'}>
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={`${item}-${index}`}
                            className="flex gap-3 text-[10px] leading-5 text-[#68736e]"
                        >
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9783d]" />
                            <span>{item}</span>
                        </div>
                    ))
                ) : (
                    <div className="flex items-start gap-2.5 text-[10px] leading-5 text-[#68736e]">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#255947]" />
                        <span>{empty}</span>
                    </div>
                )}
            </div>
        </section>
    );
}

function SafetyBoundary() {
    return (
        <section className="mt-1 border-t border-[#153f32]/12 py-7">
            <div className="flex max-w-4xl items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#153f32]/[0.06] text-[#255947]">
                    <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                    <h2 className="text-[12px] font-semibold text-[#18201d]">
                        Batas hasil engineering
                    </h2>
                    <p className="mt-1.5 text-[10px] leading-5 text-[#68736e]">
                        Hasil ini merupakan baseline awal. Verifikasi akhir,
                        pemilihan proteksi, sizing final, dan pengecekan kondisi
                        lokasi tetap dilakukan oleh engineer atau panel maker
                        yang bertanggung jawab.
                    </p>
                </div>
            </div>
        </section>
    );
}

function Th({ children }: { children: ReactNode }) {
    return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
    return (
        <td className="px-4 py-4 align-middle text-[#68736e]">{children}</td>
    );
}

function formatPhaseShort(value: string | null) {
    if (!value) {
        return '-';
    }

    return value
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
