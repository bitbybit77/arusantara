import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    CircleDollarSign,
    FilePenLine,
    Minus,
    Plus,
    Save,
    Send,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

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

export default function MakerQuotationEdit({
    quotation,
    revision,
    rfq,
}: Props) {
    const { data, setData, put, processing, errors, isDirty } =
        useForm<QuoteForm>({
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

    const componentCost = data.items.reduce(
        (total, item) => total + item.quantity * item.unit_price,
        0,
    );

    const subtotal =
        componentCost +
        data.fabrication_cost +
        data.installation_cost +
        data.other_cost;

    const rawGrandTotal = subtotal - data.discount_amount + data.tax_amount;

    const grandTotal = Math.max(0, rawGrandTotal);

    const discountInvalid = data.discount_amount > subtotal + data.tax_amount;

    const save = (event: FormEvent) => {
        event.preventDefault();

        if (discountInvalid) {
            return;
        }

        put(`/maker/quotations/${quotation.id}`, {
            preserveScroll: true,
        });
    };

    const submitQuotation = () => {
        if (discountInvalid || processing) {
            return;
        }

        put(`/maker/quotations/${quotation.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                router.post(`/maker/quotations/${quotation.id}/submit`);
            },
        });
    };

    const updateItem = <K extends keyof PriceItem>(
        index: number,
        key: K,
        value: PriceItem[K],
    ) => {
        setData(
            'items',
            data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const updateDeviation = <K extends keyof Deviation>(
        index: number,
        key: K,
        value: Deviation[K],
    ) => {
        setData(
            'deviations',
            data.deviations.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    return (
        <>
            <Head
                title={`${quotation.number} · Quotation V${revision.revision_number}`}
            />

            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d] dark:bg-[#0d1512] dark:text-[#edf0eb]">
                <form
                    onSubmit={save}
                    className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10"
                >
                    <header className="border-b border-[#18201d]/10 pb-8 dark:border-white/10">
                        <Link
                            href={`/maker/rfqs/${rfq.id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#68736e] transition hover:text-[#153f32] dark:text-[#a8b0aa] dark:hover:text-white"
                        >
                            ← {rfq.number}
                        </Link>

                        <div className="mt-6 grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-[#c9783d] uppercase">
                                        {quotation.number}
                                    </span>
                                    <span className="border border-[#18201d]/15 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-[0.1em] uppercase dark:border-white/15">
                                        {readable(quotation.status)}
                                    </span>
                                    <span className="border border-[#18201d]/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] uppercase dark:border-white/15">
                                        Quotation V{revision.revision_number}
                                    </span>
                                </div>

                                <h1 className="mt-4 max-w-4xl font-sans text-3xl leading-tight font-semibold tracking-[-0.04em] sm:text-4xl">
                                    {rfq.title}
                                </h1>

                                <p className="mt-5 text-sm leading-7 text-[#68736e] dark:text-[#a8b0aa]">
                                    {rfq.project_name}. Susun item, biaya, lead
                                    time, dan deviation untuk penawaran ini.
                                </p>
                            </div>

                            <div className="border-l border-[#18201d]/10 pl-0 xl:pl-6 dark:border-white/10">
                                <p className="font-mono text-[9px] tracking-[0.12em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                                    Total draft
                                </p>
                                <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.03em]">
                                    {money(grandTotal, revision.currency_code)}
                                </p>
                                <p className="mt-2 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                                    {isDirty
                                        ? 'Perubahan belum disimpan'
                                        : 'Draft tersimpan'}
                                </p>

                                <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                    <button
                                        type="submit"
                                        disabled={processing || discountInvalid}
                                        className="inline-flex h-11 items-center justify-center gap-2 border border-[#18201d]/15 px-4 text-xs font-semibold transition hover:bg-[#18201d]/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/5"
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing
                                            ? 'Menyimpan…'
                                            : 'Simpan draft'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={submitQuotation}
                                        disabled={processing || discountInvalid}
                                        className="inline-flex h-11 items-center justify-center gap-2 bg-[#153f32] px-4 text-xs font-semibold text-white transition hover:bg-[#102e27] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#1d5442]"
                                    >
                                        <Send className="h-4 w-4" />
                                        Kirim quotation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {Object.keys(errors).length > 0 && (
                        <div className="mt-6 flex items-start gap-3 border border-[#9a4d3f]/30 bg-[#9a4d3f]/5 p-5 text-sm text-[#8b4439] dark:text-[#efb4aa]">
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    Ada data quotation yang belum valid.
                                </p>
                                <p className="mt-1 text-[11px] leading-5">
                                    Periksa field yang ditandai backend sebelum
                                    menyimpan atau submit quotation.
                                </p>
                            </div>
                        </div>
                    )}

                    {discountInvalid && (
                        <div className="mt-6 flex items-start gap-3 border-l-2 border-[#9a4d3f] bg-[#9a4d3f]/5 p-4 text-[#8b4439] dark:text-[#efb4aa]">
                            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold">
                                    Diskon terlalu besar.
                                </p>
                                <p className="mt-1 text-[11px] leading-5">
                                    Diskon tidak boleh melebihi subtotal +
                                    pajak. Perbaiki nilai sebelum Simpan draft
                                    atau Submit.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_330px]">
                        <div className="min-w-0">
                            <QuotationItems
                                data={data}
                                setData={setData}
                                updateItem={updateItem}
                                currencyCode={revision.currency_code}
                            />

                            <CommercialTerms data={data} setData={setData} />

                            <TechnicalDeviations
                                deviations={data.deviations}
                                setData={setData}
                                updateDeviation={updateDeviation}
                            />
                        </div>

                        <aside className="h-fit space-y-5 xl:sticky xl:top-6">
                            <QuoteSummary
                                componentCost={componentCost}
                                subtotal={subtotal}
                                grandTotal={grandTotal}
                                data={data}
                                currencyCode={revision.currency_code}
                                discountInvalid={discountInvalid}
                            />

                            <RfqReference rfq={rfq} />

                            <ReviewChecklist
                                data={data}
                                discountInvalid={discountInvalid}
                            />
                        </aside>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 border-t border-[#18201d]/10 pt-7 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                        <div>
                            <p className="text-xs font-semibold">
                                Quotation V{revision.revision_number}
                            </p>
                            <p className="mt-1 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                                Save draft mempertahankan revision yang sedang
                                Anda edit. Submit menggunakan route lifecycle
                                backend yang sama.
                            </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <button
                                type="submit"
                                disabled={processing || discountInvalid}
                                className="inline-flex h-11 items-center justify-center gap-2 border border-[#18201d]/15 px-5 text-xs font-semibold transition hover:bg-[#18201d]/5 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:hover:bg-white/5"
                            >
                                <Save className="h-4 w-4" />
                                Simpan draft
                            </button>
                            <button
                                type="button"
                                onClick={submitQuotation}
                                disabled={processing || discountInvalid}
                                className="inline-flex h-11 items-center justify-center gap-2 bg-[#153f32] px-5 text-xs font-semibold text-white transition hover:bg-[#102e27] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#1d5442]"
                            >
                                Kirim quotation
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </>
    );
}

function QuotationItems({
    data,
    setData,
    updateItem,
    currencyCode,
}: {
    data: QuoteForm;
    setData: ReturnType<typeof useForm<QuoteForm>>['setData'];
    updateItem: <K extends keyof PriceItem>(
        index: number,
        key: K,
        value: PriceItem[K],
    ) => void;
    currencyCode: string;
}) {
    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#18201d]/10 pb-5 dark:border-white/10">
                <div>
                    <Eyebrow>Penawaran</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Panel items & services
                    </h2>
                    <p className="mt-3 max-w-2xl text-xs leading-6 text-[#68736e] dark:text-[#a8b0aa]">
                        Isi enclosure, protection component, accessories,
                        fabrication item, engineering/service, atau scope panel
                        lain. Equipment customer pada RFQ adalah electrical
                        load, bukan quotation item.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setData('items', [...data.items, emptyItem()])
                    }
                    className="inline-flex h-10 items-center gap-2 text-xs font-semibold text-[#153f32] dark:text-[#7fb49e]"
                >
                    <Plus className="h-4 w-4" />
                    Add item
                </button>
            </div>

            <div className="divide-y divide-[#18201d]/10 dark:divide-white/10">
                {data.items.map((item, index) => (
                    <article key={`item-${index}`} className="py-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-mono text-[9px] tracking-[0.12em] text-[#c9783d] uppercase">
                                    Item {String(index + 1).padStart(2, '0')}
                                </p>
                                <p className="mt-2 text-sm font-semibold">
                                    {item.description.trim() ||
                                        'Item quotation'}
                                </p>
                            </div>

                            {data.items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            'items',
                                            data.items.filter(
                                                (_, itemIndex) =>
                                                    itemIndex !== index,
                                            ),
                                        )
                                    }
                                    className="grid h-9 w-9 place-items-center border border-[#9a4d3f]/25 text-[#8b4439] transition hover:bg-[#9a4d3f]/5 dark:text-[#efb4aa]"
                                    aria-label={`Remove item ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-12">
                            <label className="lg:col-span-5">
                                <Label>Item / service description</Label>
                                <TextInput
                                    value={item.description}
                                    onChange={(value) =>
                                        updateItem(index, 'description', value)
                                    }
                                    placeholder="Panel enclosure / MCCB / fabrication / engineering service"
                                />
                            </label>

                            <label className="lg:col-span-3">
                                <Label>Manufacturer</Label>
                                <TextInput
                                    value={item.manufacturer}
                                    onChange={(value) =>
                                        updateItem(index, 'manufacturer', value)
                                    }
                                    placeholder="Optional"
                                />
                            </label>

                            <label className="lg:col-span-2">
                                <Label>Part number</Label>
                                <TextInput
                                    value={item.part_number}
                                    onChange={(value) =>
                                        updateItem(index, 'part_number', value)
                                    }
                                    placeholder="Optional"
                                />
                            </label>

                            <label className="lg:col-span-2">
                                <Label>Unit price</Label>
                                <NumberInput
                                    min={0}
                                    value={item.unit_price}
                                    onChange={(value) =>
                                        updateItem(index, 'unit_price', value)
                                    }
                                />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 border-t border-[#18201d]/10 pt-4 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <Label>Quantity</Label>
                                    <div className="flex w-fit items-center border border-[#18201d]/15 dark:border-white/15">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateItem(
                                                    index,
                                                    'quantity',
                                                    Math.max(
                                                        0.001,
                                                        Number(
                                                            (
                                                                item.quantity -
                                                                1
                                                            ).toFixed(3),
                                                        ),
                                                    ),
                                                )
                                            }
                                            className="grid h-10 w-10 place-items-center transition hover:bg-[#18201d]/5 dark:hover:bg-white/5"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <input
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            value={item.quantity}
                                            onChange={(event) =>
                                                updateItem(
                                                    index,
                                                    'quantity',
                                                    Number(event.target.value),
                                                )
                                            }
                                            className="h-10 w-20 border-x border-[#18201d]/15 bg-transparent text-center font-mono text-xs outline-none dark:border-white/15"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateItem(
                                                    index,
                                                    'quantity',
                                                    Number(
                                                        (
                                                            item.quantity + 1
                                                        ).toFixed(3),
                                                    ),
                                                )
                                            }
                                            className="grid h-10 w-10 place-items-center transition hover:bg-[#18201d]/5 dark:hover:bg-white/5"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <label>
                                    <Label>Unit</Label>
                                    <TextInput
                                        value={item.unit}
                                        onChange={(value) =>
                                            updateItem(index, 'unit', value)
                                        }
                                        className="w-28"
                                    />
                                </label>
                            </div>

                            <div className="text-left sm:text-right">
                                <p className="font-mono text-[8px] tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
                                    Line total
                                </p>
                                <p className="mt-1 font-mono text-sm font-semibold">
                                    {money(
                                        item.quantity * item.unit_price,
                                        currencyCode,
                                    )}
                                </p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

function CommercialTerms({
    data,
    setData,
}: {
    data: QuoteForm;
    setData: ReturnType<typeof useForm<QuoteForm>>['setData'];
}) {
    return (
        <section className="mt-12">
            <div className="border-b border-[#18201d]/10 pb-5 dark:border-white/10">
                <Eyebrow>Ketentuan penawaran</Eyebrow>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    Cost, lead time & warranty
                </h2>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <MoneyField
                        label="Fabrikasi"
                        value={data.fabrication_cost}
                        onChange={(value) => setData('fabrication_cost', value)}
                    />
                    <MoneyField
                        label="Instalasi"
                        value={data.installation_cost}
                        onChange={(value) =>
                            setData('installation_cost', value)
                        }
                    />
                    <MoneyField
                        label="Lainnya"
                        value={data.other_cost}
                        onChange={(value) => setData('other_cost', value)}
                    />
                    <MoneyField
                        label="Diskon"
                        value={data.discount_amount}
                        onChange={(value) => setData('discount_amount', value)}
                    />
                    <MoneyField
                        label="Pajak amount"
                        value={data.tax_amount}
                        onChange={(value) => setData('tax_amount', value)}
                    />
                </div>

                <div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label>
                            <Label>Lead time (days)</Label>
                            <NullableNumberInput
                                value={data.lead_time_days}
                                min={0}
                                onChange={(value) =>
                                    setData('lead_time_days', value)
                                }
                            />
                        </label>

                        <label>
                            <Label>Warranty (months)</Label>
                            <NullableNumberInput
                                value={data.warranty_months}
                                min={0}
                                onChange={(value) =>
                                    setData('warranty_months', value)
                                }
                            />
                        </label>
                    </div>

                    <label className="mt-4 block">
                        <Label>Catatan penawaran</Label>
                        <textarea
                            rows={7}
                            value={data.notes}
                            onChange={(event) =>
                                setData('notes', event.target.value)
                            }
                            className="w-full resize-none border border-[#18201d]/15 bg-[#fbfaf6] px-3 py-3 text-sm leading-6 transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
                            placeholder="Scope, pengecualian, atau catatan penawaran..."
                        />
                    </label>
                </div>
            </div>
        </section>
    );
}

function TechnicalDeviations({
    deviations,
    setData,
    updateDeviation,
}: {
    deviations: Deviation[];
    setData: ReturnType<typeof useForm<QuoteForm>>['setData'];
    updateDeviation: <K extends keyof Deviation>(
        index: number,
        key: K,
        value: Deviation[K],
    ) => void;
}) {
    return (
        <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#18201d]/10 pb-5 dark:border-white/10">
                <div>
                    <Eyebrow>Engineering negotiation</Eyebrow>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                        Technical Deviation
                    </h2>
                    <p className="mt-3 max-w-2xl text-xs leading-6 text-[#68736e] dark:text-[#a8b0aa]">
                        Tambahkan hanya ketika proposal berbeda dari requested
                        baseline dan customer perlu melihat alasan serta impact
                        perubahan tersebut.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setData('deviations', [...deviations, emptyDeviation()])
                    }
                    className="inline-flex h-10 items-center gap-2 text-xs font-semibold text-[#153f32] dark:text-[#7fb49e]"
                >
                    <Plus className="h-4 w-4" />
                    Add deviation
                </button>
            </div>

            {deviations.length === 0 ? (
                <div className="mt-6 flex items-start gap-3 border-l-2 border-[#2f7a52] pl-4">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2f7a52]" />
                    <div>
                        <p className="text-xs font-semibold">
                            Tidak ada technical deviation.
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#68736e] dark:text-[#a8b0aa]">
                            Proposal dapat disubmit tanpa deviation jika seluruh
                            technical response mengikuti baseline.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="divide-y divide-[#18201d]/10 dark:divide-white/10">
                    {deviations.map((deviation, index) => (
                        <article key={`deviation-${index}`} className="py-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-mono text-[9px] tracking-[0.12em] text-[#c9783d] uppercase">
                                        TD-{String(index + 1).padStart(2, '0')}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold">
                                        {deviation.baseline_reference.trim() ||
                                            'Technical deviation'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            'deviations',
                                            deviations.filter(
                                                (_, deviationIndex) =>
                                                    deviationIndex !== index,
                                            ),
                                        )
                                    }
                                    className="grid h-9 w-9 place-items-center border border-[#9a4d3f]/25 text-[#8b4439] transition hover:bg-[#9a4d3f]/5 dark:text-[#efb4aa]"
                                    aria-label={`Remove deviation ${index + 1}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <label>
                                    <Label>Baseline reference</Label>
                                    <TextInput
                                        value={deviation.baseline_reference}
                                        onChange={(value) =>
                                            updateDeviation(
                                                index,
                                                'baseline_reference',
                                                value,
                                            )
                                        }
                                        placeholder="MAIN-INCOMING / Supply recommendation"
                                    />
                                </label>

                                <label>
                                    <Label>Alasan</Label>
                                    <TextInput
                                        value={deviation.reason}
                                        onChange={(value) =>
                                            updateDeviation(
                                                index,
                                                'reason',
                                                value,
                                            )
                                        }
                                        placeholder="Mengapa perubahan ini diperlukan?"
                                    />
                                </label>

                                <label>
                                    <Label>Spesifikasi RFQ</Label>
                                    <textarea
                                        rows={4}
                                        value={
                                            deviation.requested_specification
                                        }
                                        onChange={(event) =>
                                            updateDeviation(
                                                index,
                                                'requested_specification',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full resize-none border border-[#18201d]/15 bg-[#fbfaf6] px-3 py-3 text-sm leading-6 transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
                                    />
                                </label>

                                <label>
                                    <Label>Spesifikasi yang ditawarkan</Label>
                                    <textarea
                                        rows={4}
                                        value={deviation.proposed_specification}
                                        onChange={(event) =>
                                            updateDeviation(
                                                index,
                                                'proposed_specification',
                                                event.target.value,
                                            )
                                        }
                                        className="w-full resize-none border border-[#18201d]/15 bg-[#fbfaf6] px-3 py-3 text-sm leading-6 transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
                                    />
                                </label>

                                <MoneyField
                                    label="Dampak harga"
                                    value={deviation.price_impact}
                                    allowNegative
                                    onChange={(value) =>
                                        updateDeviation(
                                            index,
                                            'price_impact',
                                            value,
                                        )
                                    }
                                />

                                <label>
                                    <Label>Dampak lead time (hari)</Label>
                                    <NumberInput
                                        value={deviation.lead_time_impact_days}
                                        onChange={(value) =>
                                            updateDeviation(
                                                index,
                                                'lead_time_impact_days',
                                                value,
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function QuoteSummary({
    componentCost,
    subtotal,
    grandTotal,
    data,
    currencyCode,
    discountInvalid,
}: {
    componentCost: number;
    subtotal: number;
    grandTotal: number;
    data: QuoteForm;
    currencyCode: string;
    discountInvalid: boolean;
}) {
    return (
        <section className="bg-[#153f32] p-5 text-white dark:bg-[#173c31]">
            <div className="flex items-start gap-3">
                <CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0 text-[#d99a68]" />
                <div>
                    <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-[#d5e0da] uppercase">
                        Ringkasan biaya
                    </p>
                    <p className="mt-2 font-mono text-xl font-semibold">
                        {money(grandTotal, currencyCode)}
                    </p>
                </div>
            </div>

            <dl className="mt-5 divide-y divide-white/15 border-t border-white/15">
                <SummaryRow
                    label="Komponen"
                    value={money(componentCost, currencyCode)}
                />
                <SummaryRow
                    label="Fabrikasi"
                    value={money(data.fabrication_cost, currencyCode)}
                />
                <SummaryRow
                    label="Instalasi"
                    value={money(data.installation_cost, currencyCode)}
                />
                <SummaryRow
                    label="Lainnya"
                    value={money(data.other_cost, currencyCode)}
                />
                <SummaryRow
                    label="Subtotal"
                    value={money(subtotal, currencyCode)}
                />
                <SummaryRow
                    label="Diskon"
                    value={`− ${money(data.discount_amount, currencyCode)}`}
                />
                <SummaryRow
                    label="Pajak"
                    value={money(data.tax_amount, currencyCode)}
                />
            </dl>

            {discountInvalid && (
                <div className="mt-5 border border-[#f2b29f]/30 p-4">
                    <p className="text-[10px] font-semibold text-[#ffd3c8]">
                        Diskon melampaui subtotal + pajak.
                    </p>
                </div>
            )}
        </section>
    );
}

function RfqReference({ rfq }: { rfq: Props['rfq'] }) {
    return (
        <section className="border border-[#18201d]/10 p-5 dark:border-white/10">
            <div className="flex items-start gap-3">
                <FilePenLine className="mt-0.5 h-4 w-4 shrink-0 text-[#c9783d]" />
                <div>
                    <Eyebrow>Baseline RFQ</Eyebrow>
                    <p className="mt-2 font-mono text-[10px] font-semibold">
                        {rfq.number}
                    </p>
                    <p className="mt-2 text-sm font-medium">{rfq.title}</p>
                    <p className="mt-1 text-[10px] text-[#68736e] dark:text-[#a8b0aa]">
                        {rfq.project_name}
                    </p>
                </div>
            </div>

            <Link
                href={`/maker/rfqs/${rfq.id}`}
                className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#153f32] dark:text-[#7fb49e]"
            >
                Lihat baseline RFQ
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </section>
    );
}

function ReviewChecklist({
    data,
    discountInvalid,
}: {
    data: QuoteForm;
    discountInvalid: boolean;
}) {
    const checks = [
        {
            label: `${data.items.length} quotation item${data.items.length === 1 ? '' : 's'}`,
            ok: data.items.length > 0,
        },
        {
            label: 'Ketentuan penawaran',
            ok: data.lead_time_days !== null && data.warranty_months !== null,
        },
        {
            label: `${data.deviations.length} technical deviation${data.deviations.length === 1 ? '' : 's'}`,
            ok: true,
        },
        {
            label: 'Diskon invariant',
            ok: !discountInvalid,
        },
    ];

    return (
        <section className="border border-[#18201d]/10 p-5 dark:border-white/10">
            <Eyebrow>Cek sebelum kirim</Eyebrow>
            <div className="mt-4 divide-y divide-[#18201d]/10 dark:divide-white/10">
                {checks.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-3 py-3"
                    >
                        <span
                            className={`grid h-5 w-5 place-items-center border ${
                                item.ok
                                    ? 'border-[#2f7a52]/40 text-[#2f7a52]'
                                    : 'border-[#c9783d]/40 text-[#c9783d]'
                            }`}
                        >
                            {item.ok ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <TriangleAlert className="h-3 w-3" />
                            )}
                        </span>
                        <p className="text-[11px]">{item.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Label({ children }: { children: ReactNode }) {
    return (
        <span className="mb-2 block font-mono text-[9px] font-medium tracking-[0.1em] text-[#68736e] uppercase dark:text-[#a8b0aa]">
            {children}
        </span>
    );
}

function TextInput({
    value,
    onChange,
    placeholder,
    className = '',
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    return (
        <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={`h-11 border border-[#18201d]/15 bg-[#fbfaf6] px-3 text-sm transition outline-none placeholder:text-[#9a9f9b] focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18] ${className}`}
        />
    );
}

function NumberInput({
    value,
    onChange,
    min,
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
}) {
    return (
        <input
            type="number"
            min={min}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-11 w-full border border-[#18201d]/15 bg-[#fbfaf6] px-3 font-mono text-sm transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
        />
    );
}

function NullableNumberInput({
    value,
    onChange,
    min,
}: {
    value: number | null;
    onChange: (value: number | null) => void;
    min?: number;
}) {
    return (
        <input
            type="number"
            min={min}
            value={value ?? ''}
            onChange={(event) =>
                onChange(
                    event.target.value === ''
                        ? null
                        : Number(event.target.value),
                )
            }
            className="h-11 w-full border border-[#18201d]/15 bg-[#fbfaf6] px-3 font-mono text-sm transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
        />
    );
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
                className="h-11 w-full border border-[#18201d]/15 bg-[#fbfaf6] px-3 font-mono text-sm transition outline-none focus:border-[#c9783d] dark:border-white/15 dark:bg-[#121c18]"
            />
        </label>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-5 py-3 text-[11px]">
            <dt className="text-[#c9d8d1]">{label}</dt>
            <dd className="font-mono font-medium">{value}</dd>
        </div>
    );
}

function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <p className="font-mono text-[9px] font-medium tracking-[0.14em] text-[#c9783d] uppercase">
            {children}
        </p>
    );
}
