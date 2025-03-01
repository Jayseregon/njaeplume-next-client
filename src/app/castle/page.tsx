// import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";

export default function CastlePage() {
  // const t = useTranslations("Portfolio");

  return (
    <div>
      <PageTitle title={"Welcome to the Castle"} />
      <div className="py-5" />
      <div>
        <p>Upcoming page for the admin dashboard.</p>
      </div>
    </div>
  );
}
