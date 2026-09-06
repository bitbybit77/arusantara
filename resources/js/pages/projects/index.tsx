import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Plus } from 'lucide-react';

type Project = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    business_category: string | null;
    status: string;
    updated_at: string | null;
    configuration: {
        version: number;
        status: string;
        lines_count: number;
    } | null;
};

const readable = (value: string | null) =>
    value
        ?.replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? 'Draft';

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    return (
        <>
            <Head title="Project Saya" />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <header className="flex flex-col gap-5 border-b border-[#153f32]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <Link
                                href="/dashboard"
                                className="text-sm font-medium text-[#68736e] hover:text-[#153f32]"
                            >
                                ← Dashboard
                            </Link>
                            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                Project saya
                            </h1>
                            <p className="mt-2 text-sm text-[#68736e]">
                                Buka project yang ada atau buat project baru.
                            </p>
                        </div>
                        <Link
                            href="/projects/create"
                            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947]"
                        >
                            <Plus className="h-4 w-4" />
                            Buat project
                        </Link>
                    </header>

                    {projects.length === 0 ? (
                        <section className="mt-7 rounded-xl border border-dashed border-[#153f32]/20 bg-white px-6 py-12 text-center">
                            <h2 className="text-lg font-semibold">
                                Belum ada project
                            </h2>
                            <p className="mt-2 text-sm text-[#68736e]">
                                Buat project pertama untuk mulai memilih
                                equipment.
                            </p>
                            <Link
                                href="/projects/create"
                                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white"
                            >
                                Buat project
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </section>
                    ) : (
                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="group rounded-xl border border-[#153f32]/10 bg-white p-5 transition hover:border-[#153f32]/20 hover:shadow-[0_10px_30px_rgba(21,63,50,0.05)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-[#c9783d]">
                                                {project.code}
                                            </p>
                                            <h2 className="mt-2 truncate text-lg font-semibold tracking-[-0.02em]">
                                                {project.name}
                                            </h2>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-[#153f32]/[0.06] px-2.5 py-1 text-xs font-medium text-[#153f32]">
                                            {readable(
                                                project.configuration?.status ??
                                                    project.status,
                                            )}
                                        </span>
                                    </div>
                                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#68736e]">
                                        {project.description ||
                                            'Tidak ada deskripsi.'}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between border-t border-[#153f32]/10 pt-4 text-xs text-[#68736e]">
                                        <span>
                                            {project.business_category ===
                                            'laundry'
                                                ? 'Laundry'
                                                : readable(
                                                      project.business_category,
                                                  )}
                                        </span>
                                        <span className="inline-flex items-center gap-1 font-medium text-[#153f32]">
                                            {project.configuration
                                                ?.lines_count ?? 0}{' '}
                                            equipment
                                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
