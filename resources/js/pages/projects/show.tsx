import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

type Props = {
    project: {
        id: number;
        code: string;
        name: string;
        description: string | null;
        business_category: string | null;
        status: string;
    };
    configuration: {
        version: number;
        status: string;
        lines_count: number;
        has_result: boolean;
    } | null;
};

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Draft';

export default function ProjectShow({ project, configuration }: Props) {
    return (
        <>
            <Head title={project.name} />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <Link
                        href="/projects"
                        className="text-sm font-medium text-[#68736e] hover:text-[#153f32]"
                    >
                        ← Project saya
                    </Link>

                    <header className="mt-5 flex flex-col gap-5 border-b border-[#153f32]/10 pb-7 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-[#c9783d]">
                                    {project.code}
                                </span>
                                <span className="text-xs text-[#8a938f]">
                                    •
                                </span>
                                <span className="text-xs text-[#68736e]">
                                    {project.business_category === 'laundry'
                                        ? 'Laundry'
                                        : readable(project.business_category)}
                                </span>
                            </div>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                {project.name}
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-[#68736e]">
                                {project.description || 'Tidak ada deskripsi.'}
                            </p>
                        </div>
                    </header>

                    <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <section className="rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-7">
                            <h2 className="text-lg font-semibold">
                                Konfigurasi
                            </h2>
                            <p className="mt-1 text-sm text-[#68736e]">
                                Equipment dan status konfigurasi project.
                            </p>

                            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
                                <Info
                                    label="Versi"
                                    value={`V${configuration?.version ?? 1}`}
                                />
                                <Info
                                    label="Status"
                                    value={readable(
                                        configuration?.status ?? 'draft',
                                    )}
                                />
                                <Info
                                    label="Equipment"
                                    value={`${configuration?.lines_count ?? 0} item`}
                                />
                            </dl>
                        </section>

                        <aside className="rounded-xl bg-[#153f32] p-6 text-[#f6f1e7] sm:p-7">
                            <p className="text-sm font-semibold">
                                Lanjutkan project
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/70">
                                {configuration?.has_result
                                    ? 'Hasil engineering untuk konfigurasi ini sudah tersedia.'
                                    : 'Pilih equipment lalu jalankan engineering.'}
                            </p>
                            <Link
                                href={
                                    configuration?.has_result
                                        ? `/projects/${project.id}/engineering`
                                        : `/projects/${project.id}/configuration`
                                }
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#f6f1e7] px-4 text-sm font-semibold text-[#153f32] transition hover:bg-white"
                            >
                                {configuration?.has_result
                                    ? 'Lihat hasil engineering'
                                    : 'Pilih equipment'}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-[#f7f5ef] p-4">
            <dt className="text-xs text-[#68736e]">{label}</dt>
            <dd className="mt-1 text-sm font-semibold">{value}</dd>
        </div>
    );
}
