import { useTranslations } from "next-intl";

const rows = ["address", "chainId", "network", "explorer", "dexRoute", "pool", "router", "audit", "treasury"] as const;
const pendingRows = new Set(["address", "chainId", "explorer", "dexRoute", "pool"]);

export default function VlmContractRegistryPanel() {
  const t = useTranslations("VlmContractRegistry");

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 md:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-velmere-gold/80">
            {t("kicker")}
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-white">{t("title")}</h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44">
          {t("badge")}
        </span>
      </div>

      <div className="mt-5 divide-y divide-white/10">
        {rows.map((row) => (
          <div key={row} className="grid gap-2 py-3 sm:grid-cols-[0.75fr_1.25fr] sm:items-center">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
              {t(`rows.${row}.label`)}
            </p>
            <div className="flex items-center gap-3 sm:justify-end">
              <span
                className={`h-2 w-2 rounded-full ${pendingRows.has(row) ? "bg-white/30" : "bg-velmere-gold/80"}`}
                aria-hidden="true"
              />
              <p className="font-sans text-sm leading-6 text-white/68">{t(`rows.${row}.value`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
