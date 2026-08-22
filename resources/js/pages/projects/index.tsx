import { Head, Link } from '@inertiajs/react';

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

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
    return (
        <>
            <Head title="My Projects" />
            <main className="min-h-screen bg-[#f3efe4] px-5 py-8 text-[#16241f] md:px-10 md:py-12">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col gap-6 border-b border-[#16241f]/15 pb-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <Link href="/dashboard" className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">← Dashboard</Link>
                            <h1 className="mt-4 font-serif text-5xl md:text-6xl">My Projects</h1>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-[#5d675f]">Setiap project menyimpan configuration version, frozen equipment specification, dan hasil engineering-nya sendiri.</p>
                        </div>
                        <Link href="/projects/create" className="inline-flex w-fit items-center rounded-full bg-[#173a32] px-5 py-3 text-sm font-semibold text-white">+ Buat project</Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="mt-10 rounded-[2rem] border border-dashed border-[#173a32]/30 p-10 text-center md:p-16">
                            <p className="font-serif text-3xl">Belum ada project.</p>
                            <p className="mt-3 text-sm text-[#69726c]">Mulai dengan use case Laundry MVP.</p>
                            <Link href="/projects/create" className="mt-7 inline-flex rounded-full bg-[#a56539] px-5 py-3 text-sm font-semibold text-white">Buat project pertama</Link>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {projects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-[1.6rem] border border-[#16241f]/15 bg-[#f8f5ed] p-6 transition-transform hover:-translate-y-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-[#a56539]">{project.code}</p>
                                            <h2 className="mt-3 font-serif text-3xl">{project.name}</h2>
                                        </div>
                                        <span className="rounded-full border border-[#173a32]/20 px-3 py-1 text-xs capitalize">{project.configuration?.status ?? project.status}</span>
                                    </div>
                                    <p className="mt-4 min-h-12 text-sm leading-6 text-[#667069]">{project.description || 'Project tanpa deskripsi.'}</p>
                                    <div className="mt-8 flex items-center justify-between border-t border-[#16241f]/10 pt-4 text-xs text-[#667069]">
                                        <span>{project.business_category === 'laundry' ? 'Laundry' : project.business_category}</span>
                                        <span>{project.configuration?.lines_count ?? 0} equipment line →</span>
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
