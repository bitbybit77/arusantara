import { Head, Link } from '@inertiajs/react';

type Warning = { code?: string; message?: string };
type Assumption = { code?: string; message?: string; value?: unknown };
type Line = { description: string; quantity: number; rated_power_w: number | null; design_power_w: number | null; design_current_a: number | null; phase: string | null; result_status: string; calculation_detail: Record<string, unknown> };
type Props = {
    project: { id: number; code: string; name: string; business_category: string | null };
    result: { version: number; calculator_version: string; connected_load_w: number | null; design_load_w: number | null; design_current_a: number | null; recommended_supply_v: number | null; recommended_phase: string | null; result_status: string; assumptions: Assumption[]; warnings: Warning[]; input_hash: string; calculated_at: string | null; lines: Line[] };
};

const kw = (value: number | null) => value == null ? '—' : `${(value / 1000).toFixed(1)} kW`;

export default function EngineeringShow({ project, result }: Props) {
    const needsVerification = result.result_status === 'requires_verification';

    return (
        <>
            <Head title={`Engineering Result · ${project.name}`} />
            <main className="min-h-screen bg-[#f3efe4] px-5 py-8 text-[#16241f] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-5 border-b border-[#16241f]/15 pb-8 md:flex-row md:items-end md:justify-between">
                        <div><Link href={`/projects/${project.id}`} className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">← {project.code}</Link><p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#a56539]">Preliminary Engineering Result</p><h1 className="mt-2 font-serif text-5xl md:text-6xl">{project.name}</h1></div>
                        <span className={`w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${needsVerification ? 'bg-[#ecd5b0] text-[#6c471e]' : 'bg-[#dce9dd] text-[#27503a]'}`}>{result.result_status.replaceAll('_', ' ')}</span>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <Metric label="Connected load" value={kw(result.connected_load_w)} />
                        <Metric label="Design load" value={kw(result.design_load_w)} />
                        <Metric label="Design current" value={result.design_current_a == null ? 'Verification required' : `${result.design_current_a.toFixed(1)} A`} />
                        <Metric label="Preliminary supply" value={result.recommended_phase ? `${result.recommended_supply_v ?? '—'} V · ${result.recommended_phase.replace('_', ' ')}` : 'Verification required'} />
                    </div>

                    {needsVerification && (
                        <section className="mt-5 rounded-[1.6rem] border border-[#a56539]/30 bg-[#efe1c9] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d562f]">Important boundary</p>
                            <h2 className="mt-2 font-serif text-2xl">Hasil ini belum merupakan final certified electrical design.</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#665947]">Arusantara menghitung hanya parameter yang didukung input. Data yang belum tersedia tetap ditandai untuk diverifikasi panel maker / tenaga profesional.</p>
                        </section>
                    )}

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                        <section className="rounded-[2rem] bg-[#173a32] p-6 text-[#f5f0e5] md:p-8">
                            <div className="flex items-end justify-between border-b border-white/15 pb-5"><div><p className="text-xs uppercase tracking-[0.2em] text-[#cfbea4]">Technical view</p><h2 className="mt-2 font-serif text-3xl">Load schedule</h2></div><span className="text-xs text-[#bac8c1]">{result.lines.length} lines</span></div>
                            <div className="divide-y divide-white/12">
                                {result.lines.map((line, index) => <div key={`${line.description}-${index}`} className="grid grid-cols-[1fr_auto] gap-4 py-5"><div><p className="font-medium">{line.description}</p><p className="mt-1 text-xs text-[#b9c7c0]">Qty {line.quantity} · {line.phase?.replace('_', ' ') ?? 'phase unknown'}</p></div><div className="text-right"><p>{kw(line.design_power_w)}</p><p className="mt-1 text-xs capitalize text-[#b9c7c0]">{line.result_status.replaceAll('_', ' ')}</p></div></div>)}
                            </div>
                        </section>

                        <aside className="space-y-5">
                            <InfoBlock title="Warnings" items={result.warnings.map((item) => item.message || item.code || 'Warning')} empty="No warnings." />
                            <InfoBlock title="Assumptions" items={result.assumptions.map((item) => item.message || item.code || 'Assumption')} empty="No assumptions." />
                            <div className="rounded-[1.6rem] border border-[#16241f]/15 p-6"><p className="text-xs uppercase tracking-[0.18em] text-[#7b6d5d]">Traceability</p><dl className="mt-4 space-y-3 text-xs"><div><dt className="text-[#7b756c]">Engine</dt><dd className="mt-1 font-mono">{result.calculator_version}</dd></div><div><dt className="text-[#7b756c]">Input hash</dt><dd className="mt-1 break-all font-mono">{result.input_hash}</dd></div></dl></div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
 return <div className="rounded-[1.5rem] border border-[#16241f]/15 bg-[#faf7ef] p-5"><p className="text-xs uppercase tracking-[0.16em] text-[#7b756c]">{label}</p><p className="mt-4 font-serif text-2xl leading-tight">{value}</p></div>; 
}
function InfoBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
 return <div className="rounded-[1.6rem] border border-[#16241f]/15 p-6"><p className="text-xs uppercase tracking-[0.18em] text-[#7b6d5d]">{title}</p><div className="mt-4 space-y-3">{items.length === 0 ? <p className="text-sm text-[#677069]">{empty}</p> : items.map((item, index) => <p key={index} className="border-l-2 border-[#a56539] pl-3 text-sm leading-6 text-[#5e685f]">{item}</p>)}</div></div>; 
}
