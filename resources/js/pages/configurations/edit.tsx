import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Database,
    LockKeyhole,
    Minus,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type CatalogModel = {
    id: number;
    brand: string;
    model: string;
    equipment_type: string | null;
    specification_variant: string | null;
    rated_power_w: number | null;
    voltage_v: number | null;
    phase: string | null;
    confidence: string | null;
    source_count: number;
};

type CatalogCategory = {
    id: number;
    code: string;
    name: string;
    models: CatalogModel[];
};

type Item = {
    equipment_model_id: number;
    quantity: number;
    equipment_status: 'existing' | 'planned';
    simultaneous_use: boolean;
};

type Props = {
    project: {
        id: number;
        code: string;
        name: string;
        business_category: string | null;
    };
    configuration: {
        version: number;
        status: string;
        lines: Item[];
    };
    catalog: CatalogCategory[];
};

const formatKw = (watts: number | null) =>
    watts == null ? 'Belum tersedia' : `${(watts / 1000).toFixed(1)} kW`;

const formatVoltage = (voltage: number | null) =>
    voltage == null ? 'Belum tersedia' : `${voltage} V`;

const formatPhase = (phase: string | null) =>
    phase == null
        ? 'Belum tersedia'
        : phase
              .replaceAll('_', ' ')
              .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ConfigurationEdit({
    project,
    configuration,
    catalog,
}: Props) {
    const [query, setQuery] = useState('');
    const form = useForm<{ items: Item[] }>({
        items: configuration.lines.filter(
            (line) => line.equipment_model_id !== null,
        ) as Item[],
    });

    const modelMap = useMemo(
        () =>
            new Map(
                catalog.flatMap((category) =>
                    category.models.map((model) => [model.id, model]),
                ),
            ),
        [catalog],
    );

    const visibleCatalog = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) {
            return catalog;
        }

        return catalog
            .map((category) => ({
                ...category,
                models: category.models.filter((model) =>
                    [
                        category.name,
                        category.code,
                        model.brand,
                        model.model,
                        model.equipment_type ?? '',
                        model.specification_variant ?? '',
                    ]
                        .join(' ')
                        .toLowerCase()
                        .includes(normalized),
                ),
            }))
            .filter((category) => category.models.length > 0);
    }, [catalog, query]);

    const selectedUnits = form.data.items.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const addModel = (modelId: number) => {
        const current = form.data.items.find(
            (item) => item.equipment_model_id === modelId,
        );

        if (current) {
            form.setData(
                'items',
                form.data.items.map((item) =>
                    item.equipment_model_id === modelId
                        ? {
                              ...item,
                              quantity: Math.min(100, item.quantity + 1),
                          }
                        : item,
                ),
            );

            return;
        }

        form.setData('items', [
            ...form.data.items,
            {
                equipment_model_id: modelId,
                quantity: 1,
                equipment_status: 'existing',
                simultaneous_use: true,
            },
        ]);
    };

    const updateItem = (modelId: number, patch: Partial<Item>) => {
        form.setData(
            'items',
            form.data.items.map((item) =>
                item.equipment_model_id === modelId
                    ? { ...item, ...patch }
                    : item,
            ),
        );
    };

    const updateQuantity = (modelId: number, next: number) => {
        updateItem(modelId, { quantity: Math.max(1, Math.min(100, next)) });
    };

    const removeItem = (modelId: number) => {
        form.setData(
            'items',
            form.data.items.filter(
                (item) => item.equipment_model_id !== modelId,
            ),
        );
    };

    const save = (event: FormEvent) => {
        event.preventDefault();
        form.put(`/projects/${project.id}/configuration`, {
            preserveScroll: true,
        });
    };

    const calculate = () => {
        if (form.isDirty) {
            form.put(`/projects/${project.id}/configuration`, {
                preserveScroll: true,
                onSuccess: () =>
                    router.post(`/projects/${project.id}/calculate`),
            });

            return;
        }

        router.post(`/projects/${project.id}/calculate`);
    };

    return (
        <>
            <Head title={`Configurator - ${project.name}`} />
            <style>{`
                @keyframes workspace-enter {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .workspace-enter { animation: workspace-enter .38s cubic-bezier(.2,.8,.2,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .workspace-enter { animation: none !important; }
                }
            `}</style>

            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d] dark:bg-[#0D0D0D] dark:text-[#F5F5F5]">
                <div className="border-b border-[#153f32]/10 bg-[#f7f5ef] dark:border-white/10 dark:bg-[#1A1A1A]/90">
                    <div className="mx-auto max-w-[1220px] px-5 py-5 sm:px-8 lg:px-12">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <Link
                                    href={`/projects/${project.id}`}
                                    className="text-xs font-medium text-[#68736e] transition hover:text-[#153f32] dark:text-[#9aa19d] dark:hover:text-white"
                                >
                                    ← {project.name}
                                </Link>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                                        Pilih equipment
                                    </h1>
                                    <span className="rounded-full border border-[#153f32]/10 bg-white/60 px-3 py-1 text-[11px] font-medium text-[#68736e] dark:border-white/12 dark:bg-white/[0.04] dark:text-[#9aa19d]">
                                        V{configuration.version}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-[#68736e] dark:text-[#9aa19d]">
                                    {project.name}
                                </p>
                            </div>
                            <StepProgress />
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-[1220px] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
                    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <section className="workspace-enter min-w-0">
                            <div className="flex flex-col gap-5 rounded-xl border border-[#153f32]/10 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#1A1A1A]">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="max-w-2xl">
                                        <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                                            Pilih equipment
                                        </h2>
                                        <p className="mt-3 text-sm leading-6 text-[#68736e] dark:text-[#9aa19d]">
                                            Cari model yang digunakan, lalu atur
                                            jumlah dan kondisi pemakaiannya.
                                        </p>
                                    </div>
                                    <div className="relative w-full lg:w-[320px]">
                                        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#8a938f]" />
                                        <input
                                            value={query}
                                            onChange={(event) =>
                                                setQuery(event.target.value)
                                            }
                                            placeholder="Cari brand atau model..."
                                            className="h-11 w-full rounded-md border border-[#153f32]/15 bg-white pr-4 pl-10 text-sm transition outline-none placeholder:text-[#9aa19d] hover:border-[#153f32]/25 focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05] dark:border-white/12 dark:bg-[#1A1A1A]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-8">
                                {visibleCatalog.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-[#153f32]/20 px-6 py-14 text-center dark:border-white/15">
                                        <p className="text-sm font-semibold">
                                            Tidak ada equipment yang cocok
                                        </p>
                                        <p className="mt-2 text-xs text-[#68736e] dark:text-[#9aa19d]">
                                            Coba kata kunci brand, model, atau
                                            kategori lain.
                                        </p>
                                    </div>
                                ) : (
                                    visibleCatalog.map(
                                        (category, categoryIndex) => (
                                            <CatalogSection
                                                key={category.id}
                                                category={category}
                                                selectedItems={form.data.items}
                                                onAdd={addModel}
                                                delay={categoryIndex * 55}
                                            />
                                        ),
                                    )
                                )}
                            </div>
                        </section>

                        <aside
                            className="workspace-enter h-fit xl:sticky xl:top-6"
                            style={{ animationDelay: '80ms' }}
                        >
                            <form
                                onSubmit={save}
                                className="overflow-hidden rounded-lg border border-[#153f32]/10 bg-white dark:border-white/10 dark:bg-[#1A1A1A]"
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-[#153f32]/10 px-5 py-5 dark:border-white/10">
                                    <div>
                                        <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                            Review konfigurasi
                                        </h2>
                                        <p className="mt-1 text-xs text-[#68736e] dark:text-[#9aa19d]">
                                            {form.data.items.length} model /{' '}
                                            {selectedUnits} unit
                                        </p>
                                    </div>
                                    <span
                                        className={`mt-0.5 h-2.5 w-2.5 rounded-full ${form.isDirty ? 'bg-[#c9783d]' : 'bg-[#153f32]'}`}
                                    />
                                </div>

                                <div className="max-h-[54vh] overflow-y-auto">
                                    {form.data.items.length === 0 ? (
                                        <div className="px-5 py-10 text-center">
                                            <Database className="mx-auto h-5 w-5 text-[#68736e]" />
                                            <p className="mt-3 text-sm font-medium">
                                                Belum ada equipment
                                            </p>
                                            <p className="mt-2 text-xs leading-5 text-[#68736e] dark:text-[#9aa19d]">
                                                Pilih satu atau beberapa model
                                                dari daftar equipment.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[#153f32]/10 dark:divide-white/10">
                                            {form.data.items.map((item) => {
                                                const model = modelMap.get(
                                                    item.equipment_model_id,
                                                );

                                                if (!model) {
                                                    return null;
                                                }

                                                return (
                                                    <SelectedEquipment
                                                        key={
                                                            item.equipment_model_id
                                                        }
                                                        item={item}
                                                        model={model}
                                                        onUpdate={updateItem}
                                                        onQuantityChange={
                                                            updateQuantity
                                                        }
                                                        onRemove={removeItem}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {form.errors.items && (
                                    <div className="border-t border-[#B42318]/20 bg-[#B42318]/[0.05] px-5 py-3 text-xs text-[#B42318]">
                                        {form.errors.items}
                                    </div>
                                )}

                                <div className="border-t border-[#153f32]/10 p-5 dark:border-white/10">
                                    <div className="flex items-start gap-3 rounded-md bg-[#153f32]/[0.06] p-3.5 dark:bg-white/[0.04]">
                                        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#153f32] dark:text-[#153f32]" />
                                        <p className="text-[11px] leading-5 text-[#68736e] dark:text-[#9aa19d]">
                                            Run engineering menggunakan
                                            configuration tersimpan. Parameter
                                            yang belum tersedia tetap ditandai
                                            untuk verifikasi.
                                        </p>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                                        <button
                                            type="submit"
                                            disabled={
                                                form.processing ||
                                                form.data.items.length === 0
                                            }
                                            className="h-11 rounded-md border border-[#153f32]/15 bg-white px-4 text-xs font-semibold transition hover:border-[#153f32]/25 hover:bg-[#f7f5ef] disabled:pointer-events-none disabled:opacity-40 dark:border-white/14 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                                        >
                                            Simpan draft
                                        </button>
                                        <button
                                            type="button"
                                            onClick={calculate}
                                            disabled={
                                                form.processing ||
                                                form.data.items.length === 0
                                            }
                                            className="group inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#153f32] px-4 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#255947] disabled:pointer-events-none disabled:opacity-40 dark:bg-[#1C1C1E] dark:hover:bg-[#153f32]"
                                        >
                                            {form.processing
                                                ? 'Memproses...'
                                                : 'Lock & run engineering'}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function StepProgress() {
    const steps = [
        { label: 'Project', done: true },
        { label: 'Equipment', current: true },
        { label: 'Review & run', current: false },
    ];

    return (
        <div className="flex min-w-[280px] items-center gap-2">
            {steps.map((step, index) => (
                <div
                    key={step.label}
                    className="flex min-w-0 flex-1 items-center gap-2"
                >
                    <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold transition ${
                            step.done
                                ? 'bg-[#153f32] text-white'
                                : step.current
                                  ? 'border-2 border-[#153f32] bg-[#F5F5F5] text-[#153f32] dark:bg-[#0D0D0D] dark:text-white'
                                  : 'border border-[#153f32]/20 text-[#68736e] dark:border-white/15'
                        }`}
                    >
                        {step.done ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            index + 1
                        )}
                    </span>
                    <span className="hidden truncate text-[11px] font-medium text-[#68736e] sm:block dark:text-[#9aa19d]">
                        {step.label}
                    </span>
                    {index < steps.length - 1 && (
                        <span className="h-px flex-1 bg-[#153f32]/10 dark:bg-white/10" />
                    )}
                </div>
            ))}
        </div>
    );
}

function CatalogSection({
    category,
    selectedItems,
    onAdd,
    delay,
}: {
    category: CatalogCategory;
    selectedItems: Item[];
    onAdd: (modelId: number) => void;
    delay: number;
}) {
    return (
        <section
            className="workspace-enter"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
                <div>
                    <h3 className="text-lg font-semibold tracking-[-0.025em]">
                        {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#68736e] dark:text-[#9aa19d]">
                        {category.code} / {category.models.length} model
                    </p>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {category.models.map((model) => {
                    const selected = selectedItems.find(
                        (item) => item.equipment_model_id === model.id,
                    );

                    return (
                        <button
                            key={model.id}
                            type="button"
                            onClick={() => onAdd(model.id)}
                            className={`group relative rounded-xl border bg-white p-5 text-left transition duration-200 hover:border-[#153f32]/25 dark:bg-[#1A1A1A] ${
                                selected
                                    ? 'border-[#153f32]/55 shadow-[0_0_0_3px_rgba(31,98,77,0.06)] dark:border-[#153f32]'
                                    : 'border-[#153f32]/10 hover:border-[#153f32]/25 dark:border-white/10 dark:hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-[#68736e] dark:text-[#9aa19d]">
                                        {model.brand}
                                    </p>
                                    <p className="mt-1 text-lg leading-tight font-semibold tracking-[-0.03em]">
                                        {model.model}
                                    </p>
                                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[#68736e] dark:text-[#9aa19d]">
                                        {model.specification_variant ??
                                            model.equipment_type ??
                                            'Equipment profile'}
                                    </p>
                                </div>
                                <span
                                    className={`grid h-7 min-w-7 place-items-center rounded-full px-2 text-[10px] font-semibold ${selected ? 'bg-[#153f32] text-white' : 'border border-[#153f32]/15 text-[#68736e] group-hover:border-[#153f32]/30 group-hover:text-[#153f32] dark:border-white/12 dark:text-[#9aa19d]'}`}
                                >
                                    {selected ? selected.quantity : '+'}
                                </span>
                            </div>

                            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[#153f32]/10 pt-4 dark:border-white/10">
                                <Spec
                                    label="Power"
                                    value={formatKw(model.rated_power_w)}
                                />
                                <Spec
                                    label="Voltage"
                                    value={formatVoltage(model.voltage_v)}
                                />
                                <Spec
                                    label="Phase"
                                    value={formatPhase(model.phase)}
                                />
                            </dl>

                            <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-[#68736e] dark:text-[#9aa19d]">
                                <span className="inline-flex items-center gap-1.5">
                                    <Database className="h-3.5 w-3.5 text-[#153f32] dark:text-[#153f32]" />
                                    {model.source_count > 0
                                        ? `${model.source_count} source`
                                        : 'Sumber belum tersedia'}
                                </span>
                                <span>
                                    {model.confidence?.replaceAll('_', ' ') ??
                                        'Status belum tersedia'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

function Spec({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-[10px] text-[#8a938f] dark:text-[#8a938f]">
                {label}
            </dt>
            <dd className="mt-1 truncate text-[11px] font-semibold">{value}</dd>
        </div>
    );
}

function SelectedEquipment({
    item,
    model,
    onUpdate,
    onQuantityChange,
    onRemove,
}: {
    item: Item;
    model: CatalogModel;
    onUpdate: (modelId: number, patch: Partial<Item>) => void;
    onQuantityChange: (modelId: number, quantity: number) => void;
    onRemove: (modelId: number) => void;
}) {
    return (
        <article className="px-5 py-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                        {model.brand} {model.model}
                    </p>
                    <p className="mt-1 text-[11px] text-[#68736e] dark:text-[#9aa19d]">
                        {formatKw(model.rated_power_w)}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onRemove(item.equipment_model_id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#B42318] transition hover:bg-[#B42318]/[0.07] hover:text-[#B42318]"
                    aria-label={`Hapus ${model.brand} ${model.model}`}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-[#68736e] dark:text-[#9aa19d]">
                    Jumlah
                </span>
                <div className="flex items-center overflow-hidden rounded-lg border border-[#153f32]/10 dark:border-white/12">
                    <button
                        type="button"
                        onClick={() =>
                            onQuantityChange(
                                item.equipment_model_id,
                                item.quantity - 1,
                            )
                        }
                        className="grid h-8 w-8 place-items-center transition hover:bg-[#153f32]/5 dark:hover:bg-white/5"
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={item.quantity}
                        onChange={(event) =>
                            onQuantityChange(
                                item.equipment_model_id,
                                Number(event.target.value),
                            )
                        }
                        className="h-8 w-12 border-x border-[#153f32]/10 bg-transparent text-center text-xs font-semibold outline-none dark:border-white/12"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            onQuantityChange(
                                item.equipment_model_id,
                                item.quantity + 1,
                            )
                        }
                        className="grid h-8 w-8 place-items-center transition hover:bg-[#153f32]/5 dark:hover:bg-white/5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <ChoiceButton
                    active={item.equipment_status === 'existing'}
                    onClick={() =>
                        onUpdate(item.equipment_model_id, {
                            equipment_status: 'existing',
                        })
                    }
                >
                    Sudah ada
                </ChoiceButton>
                <ChoiceButton
                    active={item.equipment_status === 'planned'}
                    onClick={() =>
                        onUpdate(item.equipment_model_id, {
                            equipment_status: 'planned',
                        })
                    }
                >
                    Rencana
                </ChoiceButton>
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 text-[11px] text-[#68736e] dark:text-[#9aa19d]">
                <span>Berpotensi digunakan bersamaan</span>
                <input
                    type="checkbox"
                    checked={item.simultaneous_use}
                    onChange={(event) =>
                        onUpdate(item.equipment_model_id, {
                            simultaneous_use: event.target.checked,
                        })
                    }
                    className="h-4 w-4 accent-[#153f32]"
                />
            </label>
        </article>
    );
}

function ChoiceButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-9 rounded-lg border text-[11px] font-semibold transition ${active ? 'border-[#153f32]/35 bg-[#153f32]/[0.07] text-[#153f32] dark:border-[#153f32]/40 dark:bg-[#153f32]/10 dark:text-[#153f32]' : 'border-[#153f32]/10 text-[#68736e] hover:border-[#153f32]/25 dark:border-white/10 dark:text-[#9aa19d] dark:hover:border-white/20'}`}
        >
            {children}
        </button>
    );
}
