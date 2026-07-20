import Image from "next/image";
import { publicFotky } from "@/lib/public-assets";

const partners = [
  {
    id: "cougar",
    name: "COUGAR Gaming",
    label: "Technologický partner",
    href: "https://cougargaming.com",
    hrefLabel: "cougargaming.com",
    src: publicFotky("cougar-logo-sm.png"),
    width: 160,
    height: 48,
  },
  {
    id: "xpboost",
    name: "XP BOOST",
    label: "Partner",
    href: "https://www.xpboost.cz/cs/",
    hrefLabel: "xpboost.cz",
    src: publicFotky("logo_xpboost.png"),
    width: 160,
    height: 48,
  },
] as const;

export function HomePartners() {
  return (
    <section
      className="border-t border-white/10 bg-[#040404] py-14 sm:py-16"
      aria-labelledby="partners-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="partners-heading"
          className="font-[family-name:var(--font-bebas)] text-3xl tracking-[0.08em] text-white sm:text-4xl"
        >
          Partneři
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {partners.map((partner) => (
            <li key={partner.id}>
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-[#39FF14]/60"
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  {partner.label}
                </p>
                <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-6 transition group-hover:border-[#39FF14]/35 group-hover:bg-[#0f0f0f] sm:h-28 sm:px-8">
                  <Image
                    src={partner.src}
                    alt=""
                    width={partner.width}
                    height={partner.height}
                    className="h-auto max-h-12 w-auto max-w-[200px] object-contain sm:max-h-14"
                  />
                  <span className="text-center text-sm font-semibold text-white transition group-hover:text-[#39FF14]">
                    {partner.name}
                  </span>
                </div>
                <span className="mt-2 text-center text-xs text-slate-500 transition group-hover:text-slate-400 sm:text-left">
                  {partner.hrefLabel}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
