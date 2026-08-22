import { Head, Link } from '@inertiajs/react';

type Props = {
    project: { id: number; code: string; name: string; description: string | null; business_category: string | null; status: string };
    configuration: { version: number; status: string; lines_count: number; has_result: boolean } | null;
};

export default function ProjectShow({ project, configuration }: Props) {
    return (
        <>
            <Head title={project.name} />
            <main className="min-h-screen bg-[#f3efe4] px-5 py-8 text-[#16241f] md:px-10 md:py-12">
                <div className="mx-auto max-w-6xl">
                    <Link href="/projects" className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">← My Projects</Link>
                    <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
                        <section className="rounded-[2rem] bg-[#173a32] p-7 text-[#f4efe4] md:p-10">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#d4c7b1]">{project.code}</p>
                            <h1 className="mt-4 font-serif text-5xl md:text-6xl">{project.name}</h1>
                            <p className="mt-6 max-w-2xl leading-7 text-[#d4ddd8]">{project.description || 'Belum ada deskripsi project.'}</p>
                        </section>
                        <aside className="rounded-[2rem] border border-[#16241f]/15 p-7">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">Configuration</p>
                            <p className="mt-5 font-serif text-3xl">Version {configuration?.version ?? 1}</p>
                            <dl className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between"><dt>Status</dt><dd className="capitalize">{configuration?.status ?? 'draft'}</dd></div>
                                <div className="flex justify-between"><dt>Equipment lines</dt><dd>{configuration?.lines_count ?? 0}</dd></div>
                            </dl>
                            {configuration?.has_result ? (
                                <Link href={`/projects/${project.id}/engineering`} className="mt-7 flex justify-center rounded-full bg-[#a56539] px-5 py-3 text-sm font-semibold text-white">Lihat engineering result</Link>
                            ) : (
                                <Link href={`/projects/${project.id}/configuration`} className="mt-7 flex justify-center rounded-full bg-[#173a32] px-5 py-3 text-sm font-semibold text-white">Buka configurator →</Link>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
