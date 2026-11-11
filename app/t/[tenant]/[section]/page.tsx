"use client";

import { useParams } from "next/navigation";
import { ComingSoonView } from "@/components/tenant/coming-soon-view";

export default function TenantSectionPage() {
  const params = useParams<{ section: string }>();
  return <ComingSoonView section={params?.section ?? ""} />;
}
