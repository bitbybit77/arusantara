import { Head, Link, useForm } from '@inertiajs/react';

type Maker = {
    id: number;
    business_name: string;
    description: string | null;
    city: string | null;
    service_area: string[];
    verification_status: string;
    contact_name: string | null;
};

type Props = {
    project: {
        id: number;
        code: string;
        name: string;
        business_category: string | null;
    };
    snapshot: {
        id: number;
        version: number;
        connected_load_w: number | null;
        design_load_w: number | null;
        design_current_a: number | null;
        recommended_supply_v: number | null;
        recommended_phase: string | null;
        result_status: string;
    };
    makers: Maker[];
};

const kw = (value: number | null) => (value == null ? '—' : `${(value / 1000).toFixed(1)} kW`);
const readable = (value: string | null) => value?.replaceAll('_', ' ') ?? '—';

export default function CreateRfq({ project, snapshot, makers }: Props) {
    const form = useForm({
        title: `Panel listrik · ${project.name}`,
        installation_location: '',
        due_at: '',
        customer_note: '',
        preferred_maker_profile_ids: [] as number[],
    });

    const toggleMaker = (makerId: number) => {
        const selected = form.data.preferred_maker_profile_ids.includes(makerId);

        form.setData(
            'preferred_maker_profile_ids',
            selected
                ? form.data.preferred_maker_profile_ids.filter((id) => id !== makerId)
                : [...form.data.preferred_maker_profile_ids, makerId],
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/projects/${project.id}/rfqs`);
    };

    return (
        <>
            <Head title={`Request Quotation · ${project.name}`} />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href={`/projects/${project.id}/engineering`}
                        className="text-xs font-medium uppercase tracking-[0.2em] text-[#766f64]"
                    >
                        ← Engineering result
                    </Link>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <section className="rounded-[2rem] bg-[#173a32] p-7 text-[#f7f3e8] md:p-10">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#c8d4ce]">Request for quotation</p>
                            <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.98] md:text-6xl">
                                Jadikan hasil engineering sebagai baseline RFQ.
                            </h1>
                            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#d6dfda]">
                                RFQ menyimpan calculation snapshot yang sudah dibekukan. Panel maker dapat memverifikasi
                                parameter yang belum lengkap pada tahap quotation dan technical deviation.
                            </p>

                            <div className="mt-10 grid gap-3 sm:grid-cols-3">
                                <Metric label="Design load" value={kw(snapshot.design_load_w)} />
                                <Metric
                                    label="Supply awal"
                                    value={`${snapshot.recommended_supply_v ?? '—'} V · ${readable(snapshot.recommended_phase)}`}
                                />
                                <Metric label="Snapshot" value={`V${snapshot.version}`} />
                            </div>
                        </section>

                        <form onSubmit={submit} className="rounded-[2rem] border border-[#172c26]/15 bg-[#faf8f2] p-7 md:p-9">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b56f3d]">RFQ draft</p>
                            <div className="mt-6 space-y-5">
                                <Field label="Judul RFQ" error={form.errors.title}>
                                    <input
                                        value={form.data.title}
                                        onChange={(event) => form.setData('title', event.target.value)}
                                        className="w-full rounded-2xl border border-[#172c26]/15 bg-white px-4 py-3 outline-none focus:border-[#a56539]"
                                    />
                                </Field>

                                <Field label="Lokasi instalasi" error={form.errors.installation_location}>
                                    <input
                                        value={form.data.installation_location}
                                        onChange={(event) => form.setData('installation_location', event.target.value)}
                                        placeholder="Contoh: Bandung, Jawa Barat"
                                        className="w-full rounded-2xl border border-[#172c26]/15 bg-white px-4 py-3 outline-none focus:border-[#a56539]"
                                    />
                                </Field>

                                <Field label="Batas quotation" error={form.errors.due_at}>
                                    <input
                                        type="date"
                                        value={form.data.due_at}
                                        onChange={(event) => form.setData('due_at', event.target.value)}
                                        className="w-full rounded-2xl border border-[#172c26]/15 bg-white px-4 py-3 outline-none focus:border-[#a56539]"
                                    />
                                </Field>

                                <Field label="Catatan untuk panel maker" error={form.errors.customer_note}>
                                    <textarea
                                        value={form.data.customer_note}
                                        onChange={(event) => form.setData('customer_note', event.target.value)}
                                        rows={4}
                                        placeholder="Kebutuhan lokasi, ruang panel, target pengerjaan, atau catatan lain."
                                        className="w-full resize-none rounded-2xl border border-[#172c26]/15 bg-white px-4 py-3 outline-none focus:border-[#a56539]"
                                    />
                                </Field>
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="mt-7 w-full rounded-full bg-[#a56539] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#8d562f] disabled:opacity-50"
                            >
                                {form.processing ? 'Membuat RFQ…' : 'Buat RFQ Draft →'}
                            </button>
                        </form>
                    </div>

                    <section className="mt-6 rounded-[2rem] border border-[#172c26]/15 p-7 md:p-9">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#776f64]">Preferred panel makers</p>
                                <h2 className="mt-2 font-serif text-3xl">Pilih maker yang ingin diprioritaskan.</h2>
                            </div>
                            <p className="max-w-md text-sm leading-6 text-[#657069]">
                                Opsional. Tanpa pilihan, RFQ tetap dapat dipublikasikan sebagai RFQ terbuka.
                            </p>
                        </div>

                        {makers.length === 0 ? (
                            <div className="mt-6 rounded-[1.4rem] bg-[#ebe4d7] p-5 text-sm text-[#665d52]">
                                Belum ada panel maker aktif. Kamu tetap bisa membuat RFQ draft dan mempublikasikannya nanti.
                            </div>
                        ) : (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {makers.map((maker) => {
                                    const selected = form.data.preferred_maker_profile_ids.includes(maker.id);

                                    return (
                                        <button
                                            key={maker.id}
                                            type="button"
                                            onClick={() => toggleMaker(maker.id)}
                                            className={`rounded-[1.5rem] border p-5 text-left transition ${
                                                selected
                                                    ? 'border-[#a56539] bg-[#f0e2d2]'
                                                    : 'border-[#172c26]/15 bg-[#faf8f2] hover:border-[#172c26]/30'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold">{maker.business_name}</p>
                                                    <p className="mt-1 text-xs text-[#73786f]">{maker.city ?? 'Lokasi belum diisi'}</p>
                                                </div>
                                                <span className="text-xs font-medium capitalize text-[#8a6344]">
                                                    {readable(maker.verification_status)}
                                                </span>
                                            </div>
                                            <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#5f6a63]">
                                                {maker.description ?? 'Panel maker Arusantara'}
                                            </p>
                                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a6344]">
                                                {selected ? 'Dipilih' : 'Pilih maker'}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[#6c706a]">{label}</span>
            {children}
            {error && <span className="mt-2 block text-xs text-red-700">{error}</span>}
        </label>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t border-white/15 pt-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#b9c7c0]">{label}</p>
            <p className="mt-2 font-serif text-xl">{value}</p>
        </div>
    );
}
