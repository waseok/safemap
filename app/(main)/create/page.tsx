"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode } from "@/lib/session";

export default function LegacyCreateRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getClassRoute(getClassCode() || SAFE_CLASS_CODE, "create"));
  }, [router]);

  return null;
}
