import { Head, Link } from '@inertiajs/react';

type Props = {
    maker: {
        id: number;
        business_name: string;
        city: string | null;
        verification_status: string;
    };
    rfqs: Array<{
        id: number;
        number: string;
        title: string;
        status: string;
        installation_location: string | null;
        due_at: string | null;
        published_at: string | null;
        customer_name: string;
        project: {
            code: string;
            name: string;
            business_category: string | null;
        };
        quotation: {
            id: number;
            number: string;
            status: string;
        } | null;
    }>;
};

const readable = (value: string | null) => value?.replaceAll('_', ' ') ?? '—';

export default function MakerRfqIndex({ maker, rfqs }: Props) {
    return (
        <>
            <Head title="RFQ Inbox · Panel Maker" />
            <main className="min-h-screen bg-[#f4f2eb] px-5 py-8 text-[#172c26] md:px-10 md:py-12">
                <div className="mx-auto max-w-7xl">
                    <header className="grid gap-8 border-b border-[#172c26]/15 pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a56539]">
                                Panel maker workspace
                            </p>
                            <h1 className="mt-4 font-serif text-5xl leading-none md:text-6xl">RFQ Inbox</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5d675f]">
                                RFQ yang terbuka untuk {maker.business_name}. Technical baseline tetap terikat pada
                                calculation snapshot customer.
                            </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-[#172c26]/15 px-5 py-4">
                            <p className="font-semibold">{maker.business_name}</p>
                            <p className="mt-1 text-xs capitalize text-[#726b61]">
                                {maker.city ?? 'Lokasi belum diisi'} · {readable(maker.verification_status)}
                            </p>
                        </div>
                    </header>

                    {rfqs.length === 0 ? (
                        <section className="mt-8 rounded-[2rem] border border-dashed border-[#172c26]/25 p-10 text-center md:p-16">
                            <p className="font-serif text-3xl">Belum ada RFQ aktif.</p>
                            <p className="mt-3 text-sm text-[#67716b]">
                                RFQ open atau shortlist customer akan muncul di sini.
                            </p>
                        </section>
                    ) : (
                        <section className="mt-8 grid gap-4 lg:grid-cols-2">
                            {rfqs.map((rfq) => (
                                <Link
                                    key={rfq.id}
                                    href={`/maker/rfqs/${rfq.id}`}
                                    className="group rounded-[1.8rem] border border-[#172c26]/15 bg-[#faf8f2] p-6 transition hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between gap-5">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.16em] text-[#a56539]">
                                                {rfq.number}
                                            </p>
                                            <h2 className="mt-3 font-serif text-3xl leading-tight">{rfq.title}</h2>
                                        </div>
                                        <span className="rounded-full border border-[#172c26]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em]">
                                            {readable(rfq.status)}
                                        </span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#81786c]">Customer</p>
                                            <p className="mt-1">{rfq.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#81786c]">Project</p>
                                            <p className="mt-1">{rfq.project.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#81786c]">Lokasi</p>
                                            <p className="mt-1">{rfq.installation_location ?? '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-[#81786c]">Due</p>
                                            <p className="mt-1">{rfq.due_at ?? '—'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-7 flex items-center justify-between border-t border-[#172c26]/10 pt-5">
                                        <span className="text-xs text-[#6a736d]">
                                            {rfq.quotation
                                                ? `${rfq.quotation.number} · ${readable(rfq.quotation.status)}`
                                                : 'Belum membuat quotation'}
                                        </span>
                                        <span className="text-sm font-semibold text-[#8f5934] transition group-hover:translate-x-1">
                                            Buka RFQ →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
