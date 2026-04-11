"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { getClassId } from "@/lib/session";
import type { SafetyPin } from "@/types";

type PinRecord = SafetyPin & { students?: { name: string } | null };

interface UseClassPinsOptions {
  locationType?: string;
}

export function useClassPins(options?: UseClassPinsOptions) {
  const [pins, setPins] = useState<PinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClientComponentClient(), []);

  const loadPins = useCallback(async () => {
    const classId = getClassId();

    if (!classId) {
      setError("학급 정보가 없어 다시 입장해야 해요.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const query = new URLSearchParams({ class_id: classId });
      if (options?.locationType) {
        query.set("location_type", options.locationType);
      }

      const res = await fetch(`/api/pins?${query.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "위험 핀을 불러오지 못했어요.");
      }

      const data = await res.json();
      setPins(data.pins || []);
    } catch (err: any) {
      setError(err.message || "위험 핀을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, [options?.locationType]);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  useEffect(() => {
    const classId = getClassId();
    if (!classId) return;

    const channel = supabase
      .channel(`class-pins-${classId}-${options?.locationType ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "safety_pins",
          filter: `class_id=eq.${classId}`,
        },
        () => {
          loadPins();
        }
      )
      .subscribe();

    const interval = window.setInterval(() => {
      loadPins();
    }, 20000);

    return () => {
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadPins, options?.locationType, supabase]);

  return { pins, loading, error, reload: loadPins };
}
