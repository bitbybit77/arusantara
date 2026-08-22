import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

export default function CreateProject() {
    const form = useForm({
        name: '',
        description: '',
        business_category: 'laundry',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/projects');
    };

    return (
        <>
            <Head title="Create Project" />
            <main className="min-h-screen bg-[#f3efe4] px-5 py-8 text-[#16241f] md:px-10 md:py-12">
                <div className="mx-auto max-w-5xl">
                    <Link href="/projects" className="text-xs uppercase tracking-[0.2em] text-[#7b6d5d]">← My Projects</Link>
                    <div className="mt-6 grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
                        <section>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56539]">Step 1 / Project</p>
                            <h1 className="mt-4 font-serif text-5xl leading-tight">Ceritakan konteks usahanya.</h1>
                            <p className="mt-5 text-sm leading-7 text-[#5f6962]">MVP saat ini memvalidasi Laundry secara mendalam. Struktur project tetap disiapkan untuk kategori usaha lain.</p>
                        </section>

                        <form onSubmit={submit} className="rounded-[2rem] bg-[#173a32] p-6 text-[#f5f0e4] md:p-9">
                            <label className="block text-xs uppercase tracking-[0.18em] text-[#d9cdb7]">Jenis usaha</label>
                            <div className="mt-3 rounded-2xl border border-white/20 bg-white/5 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-serif text-2xl">Laundry</p>
                                        <p className="mt-1 text-xs leading-5 text-[#cfd9d3]">MVP aktif · equipment dataset tersedia</p>
                                    </div>
                                    <span className="rounded-full bg-[#d9b27c] px-3 py-1 text-xs font-semibold text-[#173a32]">Available</span>
                                </div>
                            </div>

                            <label className="mt-7 block text-xs uppercase tracking-[0.18em] text-[#d9cdb7]">Nama project</label>
                            <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Laundry Permata" className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35 focus:border-[#d9b27c]" />
                            {form.errors.name && <p className="mt-2 text-xs text-[#f2b9a4]">{form.errors.name}</p>}

                            <label className="mt-6 block text-xs uppercase tracking-[0.18em] text-[#d9cdb7]">Deskripsi singkat</label>
                            <textarea value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} rows={4} placeholder="Contoh: laundry komersial dengan rencana ekspansi mesin tahun depan." className="mt-2 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none placeholder:text-white/35 focus:border-[#d9b27c]" />

                            <button disabled={form.processing} className="mt-7 w-full rounded-full bg-[#d9b27c] px-5 py-3 font-semibold text-[#173a32] disabled:opacity-50">{form.processing ? 'Menyimpan...' : 'Lanjut pilih equipment →'}</button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
