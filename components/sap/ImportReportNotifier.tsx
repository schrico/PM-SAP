"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useImportReports } from "@/hooks/useImportReports";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { ImportReportModal } from "./ImportReportModal";

export function ImportReportNotifier() {
  const { user } = useUser();
  const isPmOrAdmin = user?.role === "admin" || user?.role === "pm";
  const { reports, hasUnacknowledged, acknowledgeAll } = useImportReports(
    isPmOrAdmin ? user?.id ?? null : null
  );
  const { onImportReport } = useRealtime();
  const [showModal, setShowModal] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Show modal on mount if there are unacknowledged reports
  useEffect(() => {
    if (!initialCheckDone && hasUnacknowledged && isPmOrAdmin) {
      setShowModal(true);
      setInitialCheckDone(true);
    } else if (!hasUnacknowledged) {
      setInitialCheckDone(true);
    }
  }, [hasUnacknowledged, isPmOrAdmin, initialCheckDone]);

  // Show modal on realtime import report events
  useEffect(() => {
    if (!isPmOrAdmin) return;

    const unsubscribe = onImportReport(() => {
      setShowModal(true);
    });

    return unsubscribe;
  }, [isPmOrAdmin, onImportReport]);

  const handleDismiss = () => {
    setShowModal(false);
    if (hasUnacknowledged) {
      acknowledgeAll();
    }
  };

  if (!showModal || !isPmOrAdmin || reports.length === 0) return null;

  return <ImportReportModal reports={reports} onDismiss={handleDismiss} />;
}
