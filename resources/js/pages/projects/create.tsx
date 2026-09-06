import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
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
            <Head title="Buat Project" />
            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[980px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <Link
                        href="/projects"
                        className="text-sm font-medium text-[#68736e] transition hover:text-[#153f32]"
                    >
                        ← Project saya
                    </Link>

                    <header className="mt-6 border-b border-[#153f32]/10 pb-7">
                        <p className="text-xs font-medium text-[#c9783d]">
                            Langkah 1 dari 4
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                            Buat project baru
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736e]">
                            Isi informasi dasar usaha. Setelah itu pilih
                            equipment yang digunakan.
                        </p>
                    </header>

                    <form
                        onSubmit={submit}
                        className="mt-7 rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-8"
                    >
                        <div>
                            <p className="text-sm font-semibold">Jenis usaha</p>
                            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[#153f32]/10 bg-[#faf9f5] p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold">
                                        Laundry
                                    </p>
                                    <p className="mt-1 text-sm text-[#68736e]">
                                        Dataset equipment tersedia.
                                    </p>
                                </div>
                                <span className="w-fit rounded-full bg-[#153f32]/[0.07] px-3 py-1 text-xs font-semibold text-[#153f32]">
                                    Tersedia
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="project-name"
                                className="text-sm font-semibold"
                            >
                                Nama project
                            </label>
                            <input
                                id="project-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                placeholder="Laundry Permata"
                                className="mt-2 h-11 w-full rounded-lg border border-[#153f32]/15 bg-white px-3.5 text-sm transition outline-none placeholder:text-[#9aa19d] focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                            />
                            {form.errors.name && (
                                <p className="mt-2 text-xs text-[#b42318]">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="project-description"
                                className="text-sm font-semibold"
                            >
                                Deskripsi singkat{' '}
                                <span className="font-normal text-[#8a938f]">
                                    (opsional)
                                </span>
                            </label>
                            <textarea
                                id="project-description"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                                rows={4}
                                placeholder="Contoh: laundry dengan 6 washer dan 4 dryer."
                                className="mt-2 w-full resize-none rounded-lg border border-[#153f32]/15 bg-white px-3.5 py-3 text-sm transition outline-none placeholder:text-[#9aa19d] focus:border-[#153f32]/40 focus:ring-4 focus:ring-[#153f32]/[0.05]"
                            />
                        </div>

                        <div className="mt-7 flex flex-col-reverse gap-2 border-t border-[#153f32]/10 pt-5 sm:flex-row sm:justify-end">
                            <Link
                                href="/projects"
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#153f32]/15 px-4 text-sm font-medium text-[#153f32] transition hover:bg-[#f7f5ef]"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Lanjut pilih equipment'}
                                {!form.processing && (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
