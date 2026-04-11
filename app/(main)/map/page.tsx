"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode } from "@/lib/session";

export default function LegacyMapRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getClassRoute(getClassCode() || SAFE_CLASS_CODE, "map"));
  }, [router]);

  return null;
}
