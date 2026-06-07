import { getTranslations } from "next-intl/server";
import LegalDraftPage from "@/components/legal/LegalDraftPage";

// PASS318 route removal: operator panels are removed from public customer DOM.
export default async function LegalShippingPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Legal.shipping" });

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
    </>
  );
}
