// import { useTranslations } from "next-intl";

import { PageTitle } from "@/src/components/root/PageTitle";
import { Badge } from "@/src/components/ui/badge";

export default function ShopPage() {
  // const t = useTranslations("Portfolio");

  return (
    <div>
      <PageTitle title="Shop" />
      <div className="py-5" />
      <Badge className="text-xl" variant="primary">
        Coming soon...
      </Badge>
    </div>
  );
}
