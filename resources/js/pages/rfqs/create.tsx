import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

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

const kw = (value: number | null) =>
    value == null ? 'Perlu verifikasi' : `${(value / 1000).toFixed(1)} kW`;

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Belum tersedia';

export default function CreateRfq({ project, snapshot, makers }: Props) {
    const form = useForm({
        title: `Panel listrik · ${project.name}`,
        installation_location: '',
        due_at: '',
        customer_note: '',
        preferred_maker_profile_ids: [] as number[],
    });

    const toggleMaker = (makerId: number) => {
        const selected =
            form.data.preferred_maker_profile_ids.includes(makerId);

        form.setData(
            'preferred_maker_profile_ids',
            selected
                ? form.data.preferred_maker_profile_ids.filter(
                      (id) => id !== makerId,
                  )
                : [...form.data.preferred_maker_profile_ids, makerId],
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/projects/${project.id}/rfqs`);
    };

    return (
        <>
            <Head title={`Buat RFQ · ${project.name}`} />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <Link
                        href={`/projects/${project.id}/engineering`}
                        className="text-sm font-medium text-[#68736e] hover:text-[#153f32]"
                    >
                        ← Hasil engineering
                    </Link>

                    <header className="mt-5 border-b border-[#153f32]/10 pb-7">
                        <p className="text-xs font-semibold text-[#c9783d]">
                            {project.code}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Buat RFQ
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736e]">
                            RFQ menggunakan snapshot engineering V
                            {snapshot.version} dari project ini.
                        </p>
                    </header>

                    <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <form
                            onSubmit={submit}
                            className="rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-semibold">
                                Detail RFQ
                            </h2>
                            <div className="mt-6 space-y-5">
                                <Field
                                    label="Judul RFQ"
                                    error={form.errors.title}
                                >
                                    <input
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-[#153f32]/15 bg-white px-3.5 text-sm transition outline-none focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                                    />
                                </Field>

                                <Field
                                    label="Lokasi instalasi"
                                    error={form.errors.installation_location}
                                >
                                    <input
                                        value={form.data.installation_location}
                                        onChange={(event) =>
                                            form.setData(
                                                'installation_location',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Bandung, Jawa Barat"
                                        className="h-11 w-full rounded-lg border border-[#153f32]/15 bg-white px-3.5 text-sm transition outline-none placeholder:text-[#9aa19d] focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                                    />
                                </Field>

                                <Field
                                    label="Batas quotation"
                                    error={form.errors.due_at}
                                >
                                    <input
                                        type="date"
                                        value={form.data.due_at}
                                        onChange={(event) =>
                                            form.setData(
                                                'due_at',
                                                event.target.value,
                                            )
                                        }
                                        className="h-11 w-full rounded-lg border border-[#153f32]/15 bg-white px-3.5 text-sm transition outline-none focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                                    />
                                </Field>

                                <Field
                                    label="Catatan untuk panel maker"
                                    error={form.errors.customer_note}
                                >
                                    <textarea
                                        value={form.data.customer_note}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_note',
                                                event.target.value,
                                            )
                                        }
                                        rows={4}
                                        placeholder="Lokasi panel, target pengerjaan, atau catatan lain."
                                        className="w-full resize-none rounded-lg border border-[#153f32]/15 bg-white px-3.5 py-3 text-sm transition outline-none placeholder:text-[#9aa19d] focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                                    />
                                </Field>
                            </div>

                            <div className="mt-7 flex justify-end border-t border-[#153f32]/10 pt-5">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947] disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : 'Buat RFQ draft'}
                                    {!form.processing && (
                                        <ArrowRight className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </form>

                        <aside className="h-fit rounded-xl bg-[#153f32] p-6 text-[#f6f1e7]">
                            <h2 className="text-sm font-semibold">
                                Baseline engineering
                            </h2>
                            <dl className="mt-5 space-y-4">
                                <Metric
                                    label="Design load"
                                    value={kw(snapshot.design_load_w)}
                                />
                                <Metric
                                    label="Supply awal"
                                    value={`${snapshot.recommended_supply_v ?? '—'} V · ${readable(snapshot.recommended_phase)}`}
                                />
                                <Metric
                                    label="Snapshot"
                                    value={`V${snapshot.version}`}
                                />
                            </dl>
                        </aside>
                    </div>

                    <section className="mt-5 rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-8">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Panel maker
                                </h2>
                                <p className="mt-1 text-sm text-[#68736e]">
                                    Opsional. Pilih maker yang ingin
                                    diprioritaskan.
                                </p>
                            </div>
                            <p className="text-xs text-[#8a938f]">
                                Tanpa pilihan, RFQ tetap dapat dipublikasikan.
                            </p>
                        </div>

                        {makers.length === 0 ? (
                            <div className="mt-5 rounded-xl bg-[#f7f5ef] p-4 text-sm text-[#68736e]">
                                Belum ada panel maker aktif. RFQ draft tetap
                                bisa dibuat.
                            </div>
                        ) : (
                            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {makers.map((maker) => {
                                    const selected =
                                        form.data.preferred_maker_profile_ids.includes(
                                            maker.id,
                                        );

                                    return (
                                        <button
                                            key={maker.id}
                                            type="button"
                                            onClick={() =>
                                                toggleMaker(maker.id)
                                            }
                                            className={`rounded-xl border p-4 text-left transition ${
                                                selected
                                                    ? 'border-[#153f32]/35 bg-[#153f32]/[0.05]'
                                                    : 'border-[#153f32]/10 bg-white hover:border-[#153f32]/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold">
                                                        {maker.business_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#68736e]">
                                                        {maker.city ??
                                                            'Lokasi belum diisi'}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-xs font-medium text-[#68736e]">
                                                    {readable(
                                                        maker.verification_status,
                                                    )}
                                                </span>
                                            </div>
                                            <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#68736e]">
                                                {maker.description ??
                                                    'Tidak ada deskripsi.'}
                                            </p>
                                            <p className="mt-3 text-xs font-semibold text-[#153f32]">
                                                {selected ? 'Dipilih' : 'Pilih'}
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

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold">{label}</span>
            {children}
            {error && (
                <span className="mt-2 block text-xs text-[#b42318]">
                    {error}
                </span>
            )}
        </label>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
            <dt className="text-xs text-white/55">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
        </div>
    );
}
