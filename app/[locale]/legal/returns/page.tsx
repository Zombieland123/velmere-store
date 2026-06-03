import { getTranslations } from "next-intl/server";
import LegalDraftPage from "@/components/legal/LegalDraftPage";
import ShippingReturnsTruthPanel from "@/components/launch/ShippingReturnsTruthPanel";

export default async function LegalReturnsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Legal.returns" });

  return (
    <>
      <LegalDraftPage
        kicker={t("kicker")}
        title={t("title")}
        updated={t("updated")}
        draftNotice={t("draftNotice")}
        intro={t("intro")}
        sections={t.raw("sections")}
      />
      <ShippingReturnsTruthPanel locale={locale} surface="legal" />
    </>
  );
}
