import { Head, Link, router, useForm } from '@inertiajs/react';
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

type CatalogCategory = { id: number; code: string; name: string; models: CatalogModel[] };
type Item = { equipment_model_id: number; quantity: number; equipment_status: 'existing' | 'planned'; simultaneous_use: boolean };

type Props = {
    project: { id: number; code: string; name: string; business_category: string | null };
    configuration: { version: number; status: string; lines: Item[] };
    catalog: CatalogCategory[];
};

const formatKw = (watts: number | null) => (watts == null ? '—' : `${(watts / 1000).toFixed(1)} kW`);

export default function ConfigurationEdit({ project, configuration, catalog }: Props) {
    const form = useForm<{ items: Item[] }>({
        items: configuration.lines.filter((line) => line.equipment_model_id !== null) as Item[],
    });

    const modelMap = new Map(catalog.flatMap((category) => category.models.map((model) => [model.id, model])));

    const addModel = (modelId: number) => {
        const current = form.data.items.find((item) => item.equipment_model_id === modelId);

        if (current) {
            form.setData('items', form.data.items.map((item) => item.equipment_model_id === modelId ? { ...item, quantity: item.quantity + 1 } : item));

            return;
        }

        form.setData('items', [...form.data.items, { equipment_model_id: modelId, quantity: 1, equipment_status: 'existing', simultaneous_use: true }]);
    };

    const updateItem = (modelId: number, patch: Partial<Item>) => {
        form.setData('items', form.data.items.map((item) => item.equipment_model_id === modelId ? { ...item, ...patch } : item));
    };

    const removeItem = (modelId: number) => {
        form.setData('items', form.data.items.filter((item) => item.equipment_model_id !== modelId));
    };

    const save = (event: FormEvent) => {
        event.preventDefault();
        form.put(`/projects/${project.id}/configuration`, { preserveScroll: true });
    };

    const calculate = () => {
        if (form.isDirty) {
            form.put(`/projects/${project.id}/configuration`, {
                preserveScroll: true,
                onSuccess: () => router.post(`/projects/${project.id}/calculate`),
            });

            return;
        }

        router.post(`/projects/${project.id}/calculate`);
    };

    return (
        <>
            <Head title={`Configurator · ${project.name}`} />
            <main className="min-h-screen bg-[#f3efe4] text-[#16241f]">
                <div className="border-b border-[#16241f]/15 px-5 py-5 md:px-10">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
                        <div>
                            <Link href={`/projects/${project.id}`} className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">← {project.code}</Link>
                            <h1 className="mt-2 font-serif text-3xl">Equipment Requirements</h1>
                        </div>
                        <div className="hidden text-right text-xs text-[#6a746e] md:block">Configuration V{configuration.version}<br />Draft · editable</div>
                    </div>
                </div>

                <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[1fr_360px] md:px-10">
                    <section>
                        <div className="mb-8 max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56539]">Step 2 / Equipment</p>
                            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Pilih alat yang benar-benar kamu kenal.</h2>
                            <p className="mt-4 text-sm leading-7 text-[#606b64]">Kamu tidak perlu mengisi watt, arus, atau power factor. Spesifikasi teknis diambil dari Equipment Database dan dibekukan saat configuration disimpan.</p>
                        </div>

                        <div className="space-y-9">
                            {catalog.map((category) => (
                                <div key={category.id}>
                                    <div className="mb-3 flex items-end justify-between border-b border-[#16241f]/15 pb-3">
                                        <h3 className="font-serif text-2xl">{category.name}</h3>
                                        <span className="text-xs text-[#778078]">{category.models.length} verified profiles</span>
                                    </div>
                                    <div className="grid gap-3 lg:grid-cols-2">
                                        {category.models.map((model) => {
                                            const selected = form.data.items.some((item) => item.equipment_model_id === model.id);

                                            return (
                                                <button key={model.id} type="button" onClick={() => addModel(model.id)} className={`rounded-2xl border p-5 text-left transition ${selected ? 'border-[#173a32] bg-[#e4eadf]' : 'border-[#16241f]/15 bg-[#faf7ef] hover:border-[#173a32]/45'}`}>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-[0.14em] text-[#8b765f]">{model.brand}</p>
                                                            <p className="mt-2 font-serif text-2xl">{model.model}</p>
                                                        </div>
                                                        <span className="rounded-full border border-[#173a32]/20 px-3 py-1 text-xs">{selected ? 'Selected' : '+ Add'}</span>
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 text-[#677069]">{model.equipment_type}</p>
                                                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#16241f]/10 pt-4 text-xs">
                                                        <span>{formatKw(model.rated_power_w)}</span><span>{model.voltage_v ? `${model.voltage_v} V` : '—'}</span><span className="capitalize">{model.phase?.replace('_', ' ') ?? '—'}</span>
                                                    </div>
                                                    <p className="mt-3 text-[11px] text-[#7c817c]">{model.source_count} source · {model.confidence ?? 'unknown'} confidence</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <aside className="h-fit md:sticky md:top-6">
                        <form onSubmit={save} className="rounded-[1.8rem] bg-[#173a32] p-6 text-[#f6f1e6]">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#d6c7ae]">Selected equipment</p>
                            <div className="mt-5 space-y-4">
                                {form.data.items.length === 0 && <p className="rounded-xl border border-dashed border-white/25 p-5 text-sm leading-6 text-[#cfd8d3]">Belum ada equipment dipilih.</p>}
                                {form.data.items.map((item) => {
                                    const model = modelMap.get(item.equipment_model_id);

                                    if (!model) {
return null;
}

                                    return (
                                        <div key={item.equipment_model_id} className="border-b border-white/15 pb-4 last:border-0">
                                            <div className="flex justify-between gap-3"><div><p className="font-medium">{model.brand} {model.model}</p><p className="mt-1 text-xs text-[#c2cec8]">{formatKw(model.rated_power_w)} each</p></div><button type="button" onClick={() => removeItem(item.equipment_model_id)} className="text-xs text-[#e5b19b]">Remove</button></div>
                                            <div className="mt-3 grid grid-cols-2 gap-2">
                                                <label className="text-[11px] text-[#d4ddd8]">Qty<input type="number" min={1} max={100} value={item.quantity} onChange={(e) => updateItem(item.equipment_model_id, { quantity: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm" /></label>
                                                <label className="text-[11px] text-[#d4ddd8]">Status<select value={item.equipment_status} onChange={(e) => updateItem(item.equipment_model_id, { equipment_status: e.target.value as Item['equipment_status'] })} className="mt-1 w-full rounded-lg border border-white/15 bg-[#21473e] px-3 py-2 text-sm"><option value="existing">Existing</option><option value="planned">Planned</option></select></label>
                                            </div>
                                            <label className="mt-3 flex gap-2 text-xs leading-5 text-[#d4ddd8]"><input type="checkbox" checked={item.simultaneous_use} onChange={(e) => updateItem(item.equipment_model_id, { simultaneous_use: e.target.checked })} /> Alat ini dapat digunakan bersamaan</label>
                                        </div>
                                    );
                                })}
                            </div>
                            {form.errors.items && <p className="mt-4 text-xs text-[#f2b9a4]">{form.errors.items}</p>}
                            <button type="submit" disabled={form.processing || form.data.items.length === 0} className="mt-6 w-full rounded-full border border-white/25 px-5 py-3 text-sm font-semibold disabled:opacity-40">Simpan configuration</button>
                            <button type="button" onClick={calculate} disabled={form.processing || form.data.items.length === 0} className="mt-3 w-full rounded-full bg-[#d9b27c] px-5 py-3 text-sm font-semibold text-[#173a32] disabled:opacity-40">Lock & run engineering →</button>
                            <p className="mt-4 text-[11px] leading-5 text-[#aebdb5]">Setelah calculation dijalankan, configuration ini dibekukan untuk menjaga reproducibility.</p>
                        </form>
                    </aside>
                </div>
            </main>
        </>
    );
}
