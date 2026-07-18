"use client";

import { useEffect } from "react";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { useToastStore } from "@/lib/stores/useToastStore";
import { documentService } from "@/lib/documents";

const POLL_INTERVAL_MS = 5000;

// Documents in either of these states are still being worked on by the
// backend pipeline (pending -> processing -> completed/failed).
const isInFlight = (status: string) => status === "pending" || status === "processing";

export function useDocumentPolling() {
  const { documents, updateDocument } = useDocumentStore();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    const hasInFlight = documents.some((d) => isInFlight(d.status));
    if (!hasInFlight) return;

    const interval = setInterval(async () => {
      try {
        const res = await documentService.list();

        res.documents.forEach((freshDoc) => {
          const existing = documents.find((d) => d.id === freshDoc.id);
          if (existing && isInFlight(existing.status) && freshDoc.status === "completed") {
            updateDocument(freshDoc);
            addToast(`${freshDoc.original_filename} processed successfully`, "success");
          } else if (existing && existing.status !== freshDoc.status) {
            updateDocument(freshDoc);
          }
        });

        const stillInFlight = res.documents.some((d) => isInFlight(d.status));
        if (!stillInFlight) clearInterval(interval);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [documents, updateDocument, addToast]);
}
