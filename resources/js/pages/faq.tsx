import { Head } from '@inertiajs/react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const faqs = [
    [
        'Apakah hasil Arusantara adalah final design panel?',
        'Tidak. Hasilnya adalah preliminary engineering specification. Final verification, compliance, sizing, protection selection, dan manufacturing decision tetap menjadi tanggung jawab qualified engineer atau panel maker.',
    ],
    [
        'Apakah saya harus tahu breaker atau design current?',
        'Tidak. Customer memulai dari equipment, jumlah, status, dan pola penggunaan. Parameter teknis hanya dihitung bila data yang dibutuhkan tersedia.',
    ],
    [
        'Apa yang terjadi jika data seperti power factor tidak tersedia?',
        'Parameter tetap ditandai belum diketahui atau requires verification. Arusantara tidak mengarang nilai agar hasil terlihat lengkap.',
    ],
    [
        'Apa itu permintaan penawaran atau RFQ?',
        'Request for Quotation adalah proses membawa technical baseline ke panel maker agar quotation dibuat terhadap kebutuhan yang sama.',
    ],
    [
        'Apa fungsi technical deviation?',
        'Technical deviation mencatat perbedaan antara requested specification dan proposed specification beserta alasan, dampak harga, dan lead time.',
    ],
];

export default function FaqPage() {
    return (
        <PublicSiteShell>
            <Head title="FAQ" />
            <main>
                <GradientHero
                    eyebrow="FAQ"
                    title="Pertanyaan yang paling sering muncul sebelum menggunakan Arusantara."
                    body="Jawaban singkat tentang preliminary engineering, permintaan penawaran, dan batas tanggung jawab platform."
                />
                <section className="mx-auto max-w-[1000px] px-5 py-20 sm:px-8 lg:py-28">
                    <div className="overflow-hidden rounded-2xl border border-[#153F32]/10 bg-white">
                        {faqs.map(([question, answer], index) => (
                            <div
                                key={question}
                                className={`p-7 lg:p-9 ${index ? 'border-t border-[#153F32]/10' : ''}`}
                            >
                                <h2 className="text-xl font-bold tracking-[-0.03em]">{question}</h2>
                                <p className="mt-3 text-sm leading-7 text-[#68736E]">{answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}
