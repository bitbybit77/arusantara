import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

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

const kw = (value: number | null) => {
    return value == null ? '—' : `${(value / 1000).toFixed(1)} kW`;
};

const ampere = (value: number | null) => {
    return value == null ? 'Perlu verifikasi' : `${value.toFixed(1)} A`;
};

const readable = (value: string | null) => {
    return value?.replaceAll('_', ' ') ?? '—';
};

export default function EngineeringShow({ project, result }: Props) {
    const [view, setView] = useState<ViewMode>('simple');
    const needsVerification = result.result_status === 'requires_verification';
    const warningMessages = result.warnings.map((item) => item.message || item.code || 'Warning');
    const assumptionMessages = result.assumptions.map((item) => item.message || item.code || 'Assumption');

    const supply = result.recommended_phase
        ? `${result.recommended_supply_v ?? '—'} V · ${readable(result.recommended_phase)}`
        : 'Perlu verifikasi';

    return (
        <>
            <Head title={`Engineering Result · ${project.name}`} />

            <main className="min-h-screen bg-[#f4f2eb] text-[#172c26] print:bg-white">
                <div className="mx-auto max-w-7xl px-5 py-7 md:px-10 md:py-10">
                    <header className="border-b border-[#172c26]/15 pb-7">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="text-xs font-medium uppercase tracking-[0.2em] text-[#766f64] transition hover:text-[#172c26] print:hidden"
                                >
                                    ← {project.code}
                                </Link>
                                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#b56f3d]">
                                    Preliminary panel configuration
                                </p>
                                <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[0.98] md:text-6xl">
                                    {project.name}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 print:hidden">
                                <div className="flex rounded-full border border-[#172c26]/15 bg-white/55 p-1">
                                    <ViewButton active={view === 'simple'} onClick={() => setView('simple')}>
                                        Simple view
                                    </ViewButton>
                                    <ViewButton active={view === 'technical'} onClick={() => setView('technical')}>
                                        Technical view
                                    </ViewButton>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="rounded-full bg-[#172c26] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#24453b]"
                                >
                                    Print specification
                                </button>
                            </div>
                        </div>
                    </header>

                    {view === 'simple' ? (
                        <SimpleView
                            project={project}
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
            </main>
        </>
    );
}

function SimpleView({
    project,
    result,
    needsVerification,
    supply,
    warnings,
}: {
    project: Props['project'];
    result: Props['result'];
    needsVerification: boolean;
    supply: string;
    warnings: string[];
}) {
    return (
        <div className="py-8 md:py-10">
            <section className="grid overflow-hidden rounded-[2rem] bg-[#173a32] text-[#f7f3e8] lg:grid-cols-[1.3fr_0.7fr]">
                <div className="p-7 md:p-10 lg:p-12">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">Kebutuhan listrik awal</p>
                    <p className="mt-6 font-serif text-6xl leading-none md:text-8xl">{kw(result.design_load_w)}</p>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-[#d6dfda] md:text-base">
                        Ini adalah estimasi design load berdasarkan equipment yang kamu pilih. Arusantara hanya
                        menampilkan hasil yang dapat dihitung dari data yang tersedia.
                    </p>
                </div>

                <div className="border-t border-white/15 bg-white/[0.04] p-7 lg:border-l lg:border-t-0 md:p-10">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">Supply awal</p>
                    <p className="mt-5 font-serif text-3xl leading-tight">{supply}</p>
                    <div className="mt-8 border-t border-white/15 pt-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#c8d4ce]">Design current</p>
                        <p className="mt-2 text-lg font-medium">{ampere(result.design_current_a)}</p>
                    </div>
                </div>
            </section>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[1.8rem] border border-[#172c26]/15 bg-[#faf8f2] p-6 md:p-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b56f3d]">Status hasil</p>
                            <h2 className="mt-3 font-serif text-3xl">
                                {needsVerification ? 'Ada data yang perlu diverifikasi.' : 'Preliminary result tersedia.'}
                            </h2>
                        </div>
                        <StatusPill needsVerification={needsVerification} />
                    </div>

                    <p className="mt-5 max-w-3xl text-sm leading-7 text-[#59665f]">
                        {needsVerification
                            ? 'Arusantara tidak mengisi parameter yang tidak tersedia dari sumber equipment. Panel maker perlu memverifikasi data tersebut sebelum final engineering.'
                            : 'Parameter utama dapat dihitung dari konfigurasi yang dibekukan. Hasil ini tetap merupakan preliminary engineering specification, bukan final certified design.'}
                    </p>

                    {warnings.length > 0 && (
                        <div className="mt-7 border-t border-[#172c26]/10 pt-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Yang perlu diperhatikan</p>
                            <div className="mt-4 space-y-3">
                                {warnings.slice(0, 3).map((warning, index) => (
                                    <div key={`${warning}-${index}`} className="flex gap-3 text-sm leading-6 text-[#59665f]">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b56f3d]" />
                                        <span>{warning}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-[1.8rem] border border-[#172c26]/15 p-6 md:p-8">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Ringkasan konfigurasi</p>
                    <dl className="mt-6 divide-y divide-[#172c26]/10">
                        <SummaryRow label="Jenis usaha" value={project.business_category ?? 'Belum ditentukan'} />
                        <SummaryRow label="Equipment lines" value={`${result.lines.length} item`} />
                        <SummaryRow label="Connected load" value={kw(result.connected_load_w)} />
                        <SummaryRow label="Calculation version" value={`V${result.version}`} />
                    </dl>
                </section>
            </div>

            <section className="mt-5 rounded-[1.8rem] bg-[#e8ddcb] p-6 md:flex md:items-center md:justify-between md:p-8 print:hidden">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6344]">Langkah berikutnya</p>
                    <h2 className="mt-2 font-serif text-2xl">Review konfigurasi sebelum masuk proses RFQ.</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
                    <Link
                        href={`/projects/${project.id}/configuration`}
                        className="rounded-full border border-[#172c26]/20 px-5 py-3 text-sm font-semibold"
                    >
                        Lihat konfigurasi
                    </Link>
                    <span className="rounded-full bg-[#c9b08c] px-5 py-3 text-sm font-semibold text-[#4f4436]">
                        RFQ · next milestone
                    </span>
                </div>
            </section>
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
        <div className="py-8 md:py-10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric label="Connected load" value={kw(result.connected_load_w)} />
                <Metric label="Design load" value={kw(result.design_load_w)} />
                <Metric label="Design current" value={ampere(result.design_current_a)} />
                <Metric label="Preliminary supply" value={supply} />
            </div>

            {needsVerification && (
                <section className="mt-5 border-l-4 border-[#b56f3d] bg-[#ece1cf] p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d562f]">Engineering boundary</p>
                    <p className="mt-2 font-serif text-2xl">Additional engineering data required.</p>
                    <p className="mt-3 max-w-4xl text-sm leading-7 text-[#655b4e]">
                        Hasil ini belum merupakan final certified electrical design. Parameter yang tidak didukung data
                        input tetap dibiarkan tidak terhitung dan harus diverifikasi sebelum final design.
                    </p>
                </section>
            )}

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
                <section className="overflow-hidden rounded-[2rem] bg-[#173a32] text-[#f5f0e5]">
                    <div className="flex items-end justify-between border-b border-white/15 p-6 md:p-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#cfbea4]">Technical view</p>
                            <h2 className="mt-2 font-serif text-3xl">Load schedule</h2>
                        </div>
                        <span className="text-xs text-[#bac8c1]">{result.lines.length} lines</span>
                    </div>

                    <div className="divide-y divide-white/10">
                        {result.lines.map((line, index) => (
                            <div
                                key={`${line.description}-${index}`}
                                className="grid gap-5 px-6 py-5 md:grid-cols-[1fr_auto_auto] md:px-8"
                            >
                                <div>
                                    <p className="font-medium">{line.description}</p>
                                    <p className="mt-1 text-xs text-[#b9c7c0]">
                                        Qty {line.quantity} · {readable(line.phase)}
                                    </p>
                                </div>
                                <div className="md:text-right">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9fb2a9]">Design power</p>
                                    <p className="mt-1">{kw(line.design_power_w)}</p>
                                </div>
                                <div className="md:min-w-32 md:text-right">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#9fb2a9]">Current</p>
                                    <p className="mt-1">{ampere(line.design_current_a)}</p>
                                    <p className="mt-1 text-[11px] capitalize text-[#b9c7c0]">
                                        {readable(line.result_status)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <aside className="space-y-5">
                    <InfoBlock title="Warnings" items={warnings} empty="No warnings." />
                    <InfoBlock title="Assumptions" items={assumptions} empty="No assumptions." />

                    <div className="rounded-[1.6rem] border border-[#172c26]/15 bg-[#faf8f2] p-6">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Traceability</p>
                        <dl className="mt-5 space-y-4 text-xs">
                            <div>
                                <dt className="text-[#817a70]">Engine</dt>
                                <dd className="mt-1 font-mono text-[#243b33]">{result.calculator_version}</dd>
                            </div>
                            <div>
                                <dt className="text-[#817a70]">Snapshot version</dt>
                                <dd className="mt-1 font-mono text-[#243b33]">{result.version}</dd>
                            </div>
                            <div>
                                <dt className="text-[#817a70]">Input hash</dt>
                                <dd className="mt-1 break-all font-mono leading-5 text-[#243b33]">{result.input_hash}</dd>
                            </div>
                            <div>
                                <dt className="text-[#817a70]">Calculated at</dt>
                                <dd className="mt-1 font-mono text-[#243b33]">{result.calculated_at ?? '—'}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
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
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                active ? 'bg-[#172c26] text-white' : 'text-[#625f58] hover:text-[#172c26]'
            }`}
        >
            {children}
        </button>
    );
}

function StatusPill({ needsVerification }: { needsVerification: boolean }) {
    return (
        <span
            className={`w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] ${
                needsVerification ? 'bg-[#ecd5b0] text-[#6c471e]' : 'bg-[#dce9dd] text-[#27503a]'
            }`}
        >
            {needsVerification ? 'Requires verification' : 'Preliminary ready'}
        </span>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 text-sm">
            <dt className="text-[#6e746f]">{label}</dt>
            <dd className="text-right font-medium capitalize">{readable(value)}</dd>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.5rem] border border-[#172c26]/15 bg-[#faf8f2] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#7b756c]">{label}</p>
            <p className="mt-4 font-serif text-2xl leading-tight">{value}</p>
        </div>
    );
}

function InfoBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
    return (
        <div className="rounded-[1.6rem] border border-[#172c26]/15 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">{title}</p>
            <div className="mt-4 space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm text-[#677069]">{empty}</p>
                ) : (
                    items.map((item, index) => (
                        <p key={`${item}-${index}`} className="border-l-2 border-[#b56f3d] pl-3 text-sm leading-6 text-[#5e685f]">
                            {item}
                        </p>
                    ))
                )}
            </div>
        </div>
    );
}
