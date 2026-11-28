"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// `mark` is the logo's own ink colour (the PNGs are transparent); the tile takes the opposite tone so every logo stays
// legible in both Quantum themes (fixed tile colours: see .mind-logo-tile in globals.css).
const alphaMindSlides = [
    { title: "Brainnix", src: "/alpha-mind/brainnix.png", mark: "light" },
    { title: "English Mind", src: "/alpha-mind/english mind.png", mark: "light" },
    { title: "Enkartar", src: "/alpha-mind/enkartar.png", mark: "dark" },
    { title: "Hii English", src: "/alpha-mind/hii english.png", mark: "dark" },
    { title: "Learnme", src: "/alpha-mind/learnme.png", mark: "dark" },
    { title: "MathsMind", src: "/alpha-mind/mathsmind.png", mark: "dark" },
    { title: "Navigate Me", src: "/alpha-mind/navigate me.png", mark: "dark" },
    { title: "Perkapz", src: "/alpha-mind/perkapz.png", mark: "dark" },
    { title: "Riizon", src: "/alpha-mind/riizon.png", mark: "dark" },
    { title: "Thelbemma", src: "/alpha-mind/thelbemma.png", mark: "dark" },
] as const;

export function AlphaMindHeader() {
    const [orderedSlides, setOrderedSlides] = useState<ReadonlyArray<(typeof alphaMindSlides)[number]>>(alphaMindSlides);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setOrderedSlides((prev) => {
                const [first, ...rest] = prev;
                return first ? [...rest, first] : prev;
            });
        }, 3000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <section aria-label="Alpha Mind products" className="shrink-0 border-b border-line bg-canvas px-3 py-2.5">
            <div className="flex h-[12vh] min-h-[92px] max-h-[136px] gap-3">
                <div className="hidden w-[136px] shrink-0 flex-col justify-between border-r border-line-muted pr-3 @3xl:flex">
                    <div>
                        <p className="kicker">Alpha Mind</p>
                        <p className="mt-1 text-[13px] font-medium text-fg">Product suite</p>
                    </div>
                    <p className="font-mono text-[10.5px] text-fg-3">{alphaMindSlides.length} apps · rotating</p>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-5 gap-2 @xl:grid-cols-10">
                    {orderedSlides.map((slide) => (
                        <div
                            key={slide.src}
                            data-mark={slide.mark}
                            className="mind-logo-tile group relative min-h-0 overflow-hidden rounded border transition-opacity hover:opacity-90"
                            title={slide.title}
                        >
                            <Image
                                src={slide.src}
                                alt={`${slide.title} thumbnail`}
                                fill
                                sizes="(max-width: 640px) 18vw, 9vw"
                                className="object-contain p-1.5"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
