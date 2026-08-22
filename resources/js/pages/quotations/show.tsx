import { Head, Link, router } from '@inertiajs/react';

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

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
const readable = (value: string | null) => value?.replaceAll('_', ' ') ?? '—';

export default function QuotationShow({ quotation, rfq, maker, revision, deal }: Props) {
    const respond = (deviation: Deviation, response: 'accepted' | 'rejected') => {
        router.post(`/quotations/${quotation.id}/deviations/${deviation.id}/respond`, { response });
    };

    const discuss = () => {
        router.post(`/quotations/${quotation.id}/discuss`);
    };

    const accept = () => {
        router.post(`/quotations/${quotation.id}/accept`);
    };

    return (
        <>
            <Head title={`${quotation.number} · Quote V${revision.revision_number}`} />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <Link href={`/rfqs/${rfq.id}`} className="text-xs uppercase tracking-[0.2em] text-[#766f64]">
                        ← {rfq.number}
                    </Link>

                    <header className="mt-6 grid overflow-hidden rounded-[2rem] bg-[#173a32] text-[#f7f3e8] lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="p-7 md:p-10 lg:p-12">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">
                                {quotation.number} · Quote V{revision.revision_number}
                            </p>
                            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.98] md:text-6xl">{rfq.title}</h1>
                            <p className="mt-6 text-sm leading-7 text-[#d6dfda]">
                                {maker.business_name} · {maker.city ?? 'Lokasi belum diisi'} · {readable(quotation.status)}
                            </p>
                        </div>

                        <div className="border-t border-white/15 bg-white/[0.04] p-7 md:p-10 lg:border-l lg:border-t-0">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#c8d4ce]">Commercial total</p>
                            <p className="mt-4 font-serif text-4xl">{rupiah(revision.grand_total)}</p>
                            <p className="mt-3 text-sm text-[#d6dfda]">
                                Lead time {revision.lead_time_days ?? '—'} hari · Warranty {revision.warranty_months ?? '—'} bulan
                            </p>

                            {deal !== null && (
                                <div className="mt-7 rounded-[1.3rem] border border-white/15 bg-white/10 p-4">
                                    <p className="text-xs uppercase tracking-[0.15em] text-[#c8d4ce]">Deal created</p>
                                    <p className="mt-2 font-semibold">{deal.number}</p>
                                </div>
                            )}

                            {deal === null && quotation.can_accept && (
                                <button
                                    type="button"
                                    onClick={accept}
                                    className="mt-7 w-full rounded-full bg-[#b56f3d] px-5 py-3.5 text-sm font-semibold text-white"
                                >
                                    Accept Quotation → Deal
                                </button>
                            )}

                            {deal === null && quotation.can_discuss && (
                                <button
                                    type="button"
                                    onClick={discuss}
                                    className="mt-3 w-full rounded-full border border-white/25 px-5 py-3.5 text-sm font-semibold text-white"
                                >
                                    Discuss / Request Revision
                                </button>
                            )}
                        </div>
                    </header>

                    <section className="mt-6 rounded-[2rem] border border-[#172c26]/15 bg-[#faf8f2] p-7 md:p-9">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Commercial breakdown</p>
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="border-b border-[#172c26]/15 text-xs uppercase tracking-[0.12em] text-[#777169]">
                                    <tr>
                                        <th className="pb-3">Item</th>
                                        <th className="pb-3">Manufacturer</th>
                                        <th className="pb-3 text-right">Qty</th>
                                        <th className="pb-3 text-right">Unit price</th>
                                        <th className="pb-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#172c26]/10">
                                    {revision.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 pr-4 font-medium">{item.description}</td>
                                            <td className="py-4 pr-4 text-[#68706a]">{item.manufacturer ?? '—'}</td>
                                            <td className="py-4 text-right">
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className="py-4 text-right">{rupiah(item.unit_price)}</td>
                                            <td className="py-4 text-right font-medium">{rupiah(item.line_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <dl className="mt-7 ml-auto max-w-md divide-y divide-[#172c26]/10 text-sm">
                            <MoneyRow label="Components" value={revision.component_cost} />
                            <MoneyRow label="Fabrication" value={revision.fabrication_cost} />
                            <MoneyRow label="Installation" value={revision.installation_cost} />
                            <MoneyRow label="Other" value={revision.other_cost} />
                            <MoneyRow label="Discount" value={-revision.discount_amount} />
                            <MoneyRow label="Tax" value={revision.tax_amount} />
                            <MoneyRow label="Grand total" value={revision.grand_total} strong />
                        </dl>
                    </section>

                    <section className="mt-6 rounded-[2rem] border border-[#172c26]/15 p-7 md:p-9">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Technical deviations</p>
                        <h2 className="mt-2 font-serif text-3xl">Review perbedaan terhadap baseline</h2>

                        {revision.deviations.length === 0 ? (
                            <p className="mt-5 text-sm leading-7 text-[#657069]">Maker tidak mengajukan technical deviation.</p>
                        ) : (
                            <div className="mt-6 space-y-4">
                                {revision.deviations.map((deviation) => (
                                    <article key={deviation.id} className="rounded-[1.5rem] bg-[#faf8f2] p-5 md:p-6">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="font-semibold">{deviation.baseline_reference}</p>
                                            <span className="rounded-full bg-[#e8ddcb] px-3 py-1.5 text-xs font-semibold capitalize text-[#795839]">
                                                {readable(deviation.status)}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                                            <Spec label="Requested" value={deviation.requested_specification} />
                                            <Spec label="Proposed" value={deviation.proposed_specification} />
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-[#5f665f]">{deviation.reason}</p>
                                        <p className="mt-3 text-xs text-[#776f64]">
                                            Price impact {rupiah(deviation.price_impact)} · Lead time impact {deviation.lead_time_impact_days} hari
                                        </p>

                                        {deviation.status === 'pending' && deal === null && (
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => respond(deviation, 'accepted')}
                                                    className="rounded-full bg-[#173a32] px-4 py-2 text-xs font-semibold text-white"
                                                >
                                                    Accept deviation
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={discuss}
                                                    className="rounded-full border border-[#173a32]/20 px-4 py-2 text-xs font-semibold"
                                                >
                                                    Discuss
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => respond(deviation, 'rejected')}
                                                    className="rounded-full border border-[#9a4d3f]/25 px-4 py-2 text-xs font-semibold text-[#8b4439]"
                                                >
                                                    Reject deviation
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {revision.notes !== null && (
                        <section className="mt-6 rounded-[1.7rem] bg-[#e8ddcb] p-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#8a6344]">Maker notes</p>
                            <p className="mt-4 text-sm leading-7 text-[#5f584f]">{revision.notes}</p>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}

function MoneyRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <dt className={strong ? 'font-semibold' : 'text-[#6f756f]'}>{label}</dt>
            <dd className={strong ? 'font-serif text-xl' : 'font-medium'}>{rupiah(value)}</dd>
        </div>
    );
}

function Spec({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1.2rem] border border-[#172c26]/10 bg-white p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#777169]">{label}</p>
            <p className="mt-2 text-sm leading-6">{value}</p>
        </div>
    );
}
