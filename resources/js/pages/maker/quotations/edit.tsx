import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type PriceItem = {
    description: string;
    manufacturer: string;
    part_number: string;
    quantity: number;
    unit: string;
    unit_price: number;
};

type Deviation = {
    baseline_reference: string;
    requested_specification: string;
    proposed_specification: string;
    reason: string;
    price_impact: number;
    lead_time_impact_days: number;
};

type Props = {
    quotation: {
        id: number;
        number: string;
        status: string;
    };
    revision: {
        id: number;
        revision_number: number;
        currency_code: string;
        fabrication_cost: number;
        installation_cost: number;
        other_cost: number;
        discount_amount: number;
        tax_amount: number;
        grand_total: number;
        lead_time_days: number | null;
        warranty_months: number | null;
        notes: string | null;
        items: PriceItem[];
        deviations: Deviation[];
    };
    rfq: {
        id: number;
        number: string;
        title: string;
        project_name: string;
    };
};

type QuoteForm = {
    items: PriceItem[];
    fabrication_cost: number;
    installation_cost: number;
    other_cost: number;
    discount_amount: number;
    tax_amount: number;
    lead_time_days: number | null;
    warranty_months: number | null;
    notes: string;
    deviations: Deviation[];
};

const emptyItem = (): PriceItem => ({
    description: '',
    manufacturer: '',
    part_number: '',
    quantity: 1,
    unit: 'unit',
    unit_price: 0,
});

const emptyDeviation = (): Deviation => ({
    baseline_reference: '',
    requested_specification: '',
    proposed_specification: '',
    reason: '',
    price_impact: 0,
    lead_time_impact_days: 0,
});

const rupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function MakerQuotationEdit({ quotation, revision, rfq }: Props) {
    const { data, setData, put, processing, errors } = useForm<QuoteForm>({
        items: revision.items.length > 0 ? revision.items : [emptyItem()],
        fabrication_cost: revision.fabrication_cost,
        installation_cost: revision.installation_cost,
        other_cost: revision.other_cost,
        discount_amount: revision.discount_amount,
        tax_amount: revision.tax_amount,
        lead_time_days: revision.lead_time_days,
        warranty_months: revision.warranty_months,
        notes: revision.notes ?? '',
        deviations: revision.deviations,
    });

    const componentCost = data.items.reduce((total, item) => total + item.quantity * item.unit_price, 0);
    const subtotal = componentCost + data.fabrication_cost + data.installation_cost + data.other_cost;
    const grandTotal = Math.max(0, subtotal - data.discount_amount + data.tax_amount);

    const save = (event: FormEvent) => {
        event.preventDefault();
        put(`/maker/quotations/${quotation.id}`);
    };

    const submitQuotation = () => {
        put(`/maker/quotations/${quotation.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.post(`/maker/quotations/${quotation.id}/submit`);
            },
        });
    };

    const updateItem = <K extends keyof PriceItem>(index: number, key: K, value: PriceItem[K]) => {
        setData(
            'items',
            data.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
        );
    };

    const updateDeviation = <K extends keyof Deviation>(index: number, key: K, value: Deviation[K]) => {
        setData(
            'deviations',
            data.deviations.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
        );
    };

    return (
        <>
            <Head title={`${quotation.number} · Quote V${revision.revision_number}`} />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <form onSubmit={save} className="mx-auto max-w-7xl">
                    <Link href={`/maker/rfqs/${rfq.id}`} className="text-xs uppercase tracking-[0.2em] text-[#766f64]">
                        ← {rfq.number}
                    </Link>

                    <header className="mt-6 grid gap-6 border-b border-[#172c26]/15 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a56539]">
                                {quotation.number} · Quote V{revision.revision_number}
                            </p>
                            <h1 className="mt-4 font-serif text-5xl leading-none md:text-6xl">{rfq.title}</h1>
                            <p className="mt-4 text-sm text-[#626b65]">{rfq.project_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-full border border-[#173a32]/20 px-5 py-3 text-sm font-semibold"
                            >
                                {processing ? 'Menyimpan…' : 'Save Draft'}
                            </button>
                            <button
                                type="button"
                                onClick={submitQuotation}
                                className="rounded-full bg-[#173a32] px-5 py-3 text-sm font-semibold text-white"
                            >
                                Submit Quotation →
                            </button>
                        </div>
                    </header>

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-6 rounded-[1.4rem] border border-red-900/20 bg-red-50 p-5 text-sm text-red-800">
                            Ada data quotation yang belum valid. Periksa field yang ditandai sebelum submit.
                        </div>
                    )}

                    <section className="mt-8">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Commercial proposal</p>
                                <h2 className="mt-2 font-serif text-3xl">Item harga</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('items', [...data.items, emptyItem()])}
                                className="text-sm font-semibold text-[#8f5934]"
                            >
                                + Tambah item
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {data.items.map((item, index) => (
                                <div
                                    key={`item-${index}`}
                                    className="grid gap-4 rounded-[1.7rem] border border-[#172c26]/15 bg-[#faf8f2] p-5 lg:grid-cols-12"
                                >
                                    <label className="lg:col-span-4">
                                        <Label>Deskripsi</Label>
                                        <input
                                            value={item.description}
                                            onChange={(event) => updateItem(index, 'description', event.target.value)}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                            placeholder="Incoming MCCB / enclosure / component"
                                        />
                                    </label>
                                    <label className="lg:col-span-2">
                                        <Label>Manufacturer</Label>
                                        <input
                                            value={item.manufacturer}
                                            onChange={(event) => updateItem(index, 'manufacturer', event.target.value)}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                        />
                                    </label>
                                    <label className="lg:col-span-2">
                                        <Label>Part no.</Label>
                                        <input
                                            value={item.part_number}
                                            onChange={(event) => updateItem(index, 'part_number', event.target.value)}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                        />
                                    </label>
                                    <label className="lg:col-span-1">
                                        <Label>Qty</Label>
                                        <input
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            value={item.quantity}
                                            onChange={(event) => updateItem(index, 'quantity', Number(event.target.value))}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                        />
                                    </label>
                                    <label className="lg:col-span-1">
                                        <Label>Unit</Label>
                                        <input
                                            value={item.unit}
                                            onChange={(event) => updateItem(index, 'unit', event.target.value)}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                        />
                                    </label>
                                    <label className="lg:col-span-2">
                                        <Label>Unit price</Label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.unit_price}
                                            onChange={(event) => updateItem(index, 'unit_price', Number(event.target.value))}
                                            className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                        />
                                    </label>
                                    <div className="flex items-center justify-between border-t border-[#172c26]/10 pt-4 lg:col-span-12">
                                        <span className="text-sm text-[#6b746e]">
                                            Line total · {rupiah(item.quantity * item.unit_price)}
                                        </span>
                                        {data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'items',
                                                        data.items.filter((_, itemIndex) => itemIndex !== index),
                                                    )
                                                }
                                                className="text-xs font-semibold text-red-700"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                        <div className="rounded-[2rem] border border-[#172c26]/15 p-6 md:p-8">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Additional costs</p>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <MoneyField
                                    label="Fabrication"
                                    value={data.fabrication_cost}
                                    onChange={(value) => setData('fabrication_cost', value)}
                                />
                                <MoneyField
                                    label="Installation"
                                    value={data.installation_cost}
                                    onChange={(value) => setData('installation_cost', value)}
                                />
                                <MoneyField
                                    label="Other"
                                    value={data.other_cost}
                                    onChange={(value) => setData('other_cost', value)}
                                />
                                <MoneyField
                                    label="Discount"
                                    value={data.discount_amount}
                                    onChange={(value) => setData('discount_amount', value)}
                                />
                                <MoneyField
                                    label="Tax amount"
                                    value={data.tax_amount}
                                    onChange={(value) => setData('tax_amount', value)}
                                />
                            </div>
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <label>
                                    <Label>Lead time (days)</Label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.lead_time_days ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'lead_time_days',
                                                event.target.value === '' ? null : Number(event.target.value),
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                    />
                                </label>
                                <label>
                                    <Label>Warranty (months)</Label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.warranty_months ?? ''}
                                        onChange={(event) =>
                                            setData(
                                                'warranty_months',
                                                event.target.value === '' ? null : Number(event.target.value),
                                            )
                                        }
                                        className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                    />
                                </label>
                            </div>
                            <label className="mt-4 block">
                                <Label>Notes</Label>
                                <textarea
                                    rows={4}
                                    value={data.notes}
                                    onChange={(event) => setData('notes', event.target.value)}
                                    className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539] resize-none"
                                    placeholder="Scope, exclusions, commercial notes…"
                                />
                            </label>
                        </div>

                        <aside className="rounded-[2rem] bg-[#173a32] p-7 text-[#f7f3e8] md:p-8">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#c7d3cd]">Quote summary</p>
                            <dl className="mt-7 space-y-4 text-sm">
                                <SummaryRow label="Components" value={rupiah(componentCost)} />
                                <SummaryRow label="Fabrication" value={rupiah(data.fabrication_cost)} />
                                <SummaryRow label="Installation" value={rupiah(data.installation_cost)} />
                                <SummaryRow label="Other" value={rupiah(data.other_cost)} />
                                <SummaryRow label="Discount" value={`− ${rupiah(data.discount_amount)}`} />
                                <SummaryRow label="Tax" value={rupiah(data.tax_amount)} />
                            </dl>
                            <div className="mt-7 border-t border-white/20 pt-6">
                                <p className="text-xs uppercase tracking-[0.15em] text-[#c7d3cd]">Grand total</p>
                                <p className="mt-3 font-serif text-4xl">{rupiah(grandTotal)}</p>
                            </div>
                        </aside>
                    </section>

                    <section className="mt-8 rounded-[2rem] bg-[#e8ddcb] p-6 md:p-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#8a6344]">Engineering negotiation</p>
                                <h2 className="mt-2 font-serif text-3xl">Technical Deviation</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#625a50]">
                                    Kosongkan jika proposal mengikuti baseline. Tambahkan hanya jika ada spesifikasi yang
                                    berbeda dan perlu keputusan customer.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setData('deviations', [...data.deviations, emptyDeviation()])}
                                className="text-sm font-semibold text-[#8f5934]"
                            >
                                + Tambah deviation
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            {data.deviations.map((deviation, index) => (
                                <div key={`deviation-${index}`} className="rounded-[1.5rem] bg-[#f8f4eb] p-5">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label>
                                            <Label>Baseline reference</Label>
                                            <input
                                                value={deviation.baseline_reference}
                                                onChange={(event) =>
                                                    updateDeviation(index, 'baseline_reference', event.target.value)
                                                }
                                                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                                placeholder="MAIN-INCOMING / Supply recommendation"
                                            />
                                        </label>
                                        <label>
                                            <Label>Reason</Label>
                                            <input
                                                value={deviation.reason}
                                                onChange={(event) => updateDeviation(index, 'reason', event.target.value)}
                                                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                            />
                                        </label>
                                        <label>
                                            <Label>Requested specification</Label>
                                            <textarea
                                                rows={3}
                                                value={deviation.requested_specification}
                                                onChange={(event) =>
                                                    updateDeviation(index, 'requested_specification', event.target.value)
                                                }
                                                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539] resize-none"
                                            />
                                        </label>
                                        <label>
                                            <Label>Proposed specification</Label>
                                            <textarea
                                                rows={3}
                                                value={deviation.proposed_specification}
                                                onChange={(event) =>
                                                    updateDeviation(index, 'proposed_specification', event.target.value)
                                                }
                                                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539] resize-none"
                                            />
                                        </label>
                                        <MoneyField
                                            label="Price impact"
                                            value={deviation.price_impact}
                                            allowNegative
                                            onChange={(value) => updateDeviation(index, 'price_impact', value)}
                                        />
                                        <label>
                                            <Label>Lead-time impact (days)</Label>
                                            <input
                                                type="number"
                                                value={deviation.lead_time_impact_days}
                                                onChange={(event) =>
                                                    updateDeviation(
                                                        index,
                                                        'lead_time_impact_days',
                                                        Number(event.target.value),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
                                            />
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'deviations',
                                                data.deviations.filter(
                                                    (_, deviationIndex) => deviationIndex !== index,
                                                ),
                                            )
                                        }
                                        className="mt-5 text-xs font-semibold text-red-700"
                                    >
                                        Hapus deviation
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#172c26]/15 pt-7">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-full border border-[#173a32]/20 px-6 py-3 text-sm font-semibold"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={submitQuotation}
                            className="rounded-full bg-[#b56f3d] px-6 py-3 text-sm font-semibold text-white"
                        >
                            Submit Quotation →
                        </button>
                    </div>
                </form>
            </main>
        </>
    );
}

function Label({ children }: { children: string }) {
    return <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.13em] text-[#716b62]">{children}</span>;
}

function MoneyField({
    label,
    value,
    onChange,
    allowNegative = false,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    allowNegative?: boolean;
}) {
    return (
        <label>
            <Label>{label}</Label>
            <input
                type="number"
                min={allowNegative ? undefined : 0}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="w-full rounded-xl border border-[#172c26]/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#a56539]"
            />
        </label>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-4">
            <dt className="text-[#c7d3cd]">{label}</dt>
            <dd className="font-medium">{value}</dd>
        </div>
    );
}
