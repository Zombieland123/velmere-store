import { getTranslations } from "next-intl/server";
import LegalDraftPage from "@/components/legal/LegalDraftPage";

export default async function ImpressumPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: "Legal.impressum" });

  return (
    <LegalDraftPage
      kicker={t("kicker")}
      title={t("title")}
      updated={t("updated")}
      draftNotice={t("draftNotice")}
      intro={t("intro")}
      sections={t.raw("sections")}
    />
  );
}
