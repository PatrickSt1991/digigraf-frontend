import { useEffect, useMemo, useState } from "react";
import { endpoints } from "../../api/apiConfig";
import { CessieAction, DocumentTemplate, InsuranceEntry, InsuranceParty, PolicyGroup } from "../../types";

type Props = {
  isOpen: boolean;
  dossierId: string;
  templateId: string;
  templateTitle: string;
  action: CessieAction;
  onClose: () => void;
  onOpenEditor?: (template: DocumentTemplate) => void;
};

function getActionLabel(action: CessieAction) {
  switch (action) {
    case "editor":
      return "openen";
    case "print":
      return "printen";
    case "pdf":
      return "PDF downloaden";
    case "docx":
      return "Word downloaden";
    default:
      return "openen";
  }
}

function formatCurrency(value?: number) {
  const amount = value ?? 0;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getFileName(response: Response, fallback: string): string {
  const disposition = response.headers.get("Content-Disposition");
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match) return decodeURIComponent(utf8Match[1].trim());
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch) return plainMatch[1].trim();
  }
  return fallback;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function InsuranceSelectionModal({
  isOpen,
  dossierId,
  templateId,
  templateTitle,
  action,
  onClose,
  onOpenEditor,
}: Props) {
  const [insuranceEntries, setInsuranceEntries] = useState<InsuranceEntry[]>([]);
  const [insuranceParties, setInsuranceParties] = useState<InsuranceParty[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !dossierId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [policiesResponse, partiesResponse] = await Promise.all([
          fetch(`${endpoints.insuranceDeceased}/${dossierId}`, {
            credentials: "include",
          }),
          fetch(endpoints.insuranceCompanies, {
            credentials: "include",
          }),
        ]);

        if (!policiesResponse.ok) {
          throw new Error("Kon verzekeringspolissen niet ophalen.");
        }

        if (!partiesResponse.ok) {
          throw new Error("Kon verzekeraars niet ophalen.");
        }

        const policiesJson = await policiesResponse.json();
        const partiesJson = await partiesResponse.json();

        if (!cancelled) {
          setInsuranceEntries(policiesJson.insuranceEntries ?? []);
          setInsuranceParties(Array.isArray(partiesJson) ? partiesJson : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Laden van verzekeringen mislukt.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, dossierId]);

  const groupedInsurances = useMemo<PolicyGroup[]>(() => {
    const partyMap = new Map(
      insuranceParties.map((party) => [party.id, party.name])
    );

    const grouped = new Map<string, PolicyGroup>();

    for (const entry of insuranceEntries) {
      const insurancePartyId = entry.insurancePartyId;
      if (!insurancePartyId) continue;

      if (!grouped.has(insurancePartyId)) {
        grouped.set(insurancePartyId, {
          insurancePartyId,
          insurancePartyName: partyMap.get(insurancePartyId) || "Onbekende verzekeraar",
          policies: [],
          totalPremium: 0,
        });
      }

      const group = grouped.get(insurancePartyId)!;
      const premium = typeof entry.premium === "number" ? entry.premium : 0;

      group.policies.push({
        policyNumber: entry.policyNumber,
        premium: entry.premium,
      });
      group.totalPremium += premium;
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.insurancePartyName.localeCompare(b.insurancePartyName)
    );
  }, [insuranceEntries, insuranceParties]);

  const openEditor = async (insurancePartyId: string) => {
    if (!onOpenEditor) return;

    setBusyKey(`editor-${insurancePartyId}`);
    try {
      const response = await fetch(
        `${endpoints.documentsdeceased}/${templateId}/filled?insurancePartyId=${encodeURIComponent(
          insurancePartyId
        )}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Kon akte van cessie niet openen.");
      }

      const template = (await response.json()) as DocumentTemplate;
      onOpenEditor(template);
    } catch (err) {
      console.error(err);
      alert("Openen van akte van cessie mislukt.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleBinaryAction = async (mode: "print" | "pdf" | "docx", insurancePartyId?: string) => {
    const key = `${mode}-${insurancePartyId ?? "all"}`;
    setBusyKey(key);

    try {
      const params = new URLSearchParams();
      if (insurancePartyId) {
        params.set("insurancePartyId", insurancePartyId);
      } else {
        params.set("all", "true");
      }

      const url = `${endpoints.documentsdeceased}/${templateId}/${mode}?${params.toString()}`;

      if (mode === "print") {
        window.open(url, "_blank");
        onClose();
        return;
      }

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Document genereren mislukt.");
      }

      const blob = await response.blob();
      const extension = mode === "pdf" ? "pdf" : "docx";
      downloadBlob(blob, getFileName(response, `${templateTitle}.${extension}`));
      onClose();
    } catch (err) {
      console.error(err);
      alert("Document genereren mislukt.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleSingle = async (insurancePartyId: string) => {
    if (action === "editor") {
      await openEditor(insurancePartyId);
      return;
    }

    await handleBinaryAction(action, insurancePartyId);
  };

  const handleAll = async () => {
    if (action === "editor") return;
    await handleBinaryAction(action);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{templateTitle}</h2>
            <p className="text-sm text-gray-600">
              Kies welke akte van cessie je wilt {getActionLabel(action)}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
          >
            Sluiten
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading && <div>Verzekeringen laden...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && groupedInsurances.length === 0 && (
            <div className="text-gray-700">
              Er zijn geen verzekeringen gevonden voor dit dossier.
            </div>
          )}

          {!loading && !error && action !== "editor" && groupedInsurances.length > 1 && (
            <div className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Alle aktes van cessie</div>
                <div className="text-sm text-gray-600">
                  Maak één document met alle verzekeringen.
                </div>
              </div>

              <button
                type="button"
                onClick={handleAll}
                disabled={busyKey === `${action}-all`}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {busyKey === `${action}-all`
                  ? "Bezig..."
                  : action === "print"
                  ? "Print alle"
                  : action === "pdf"
                  ? "PDF alle"
                  : "Word alle"}
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            groupedInsurances.map((group) => (
              <div key={group.insurancePartyId} className="border rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{group.insurancePartyName}</div>
                    <div className="text-sm text-gray-600 mb-3">
                      {group.policies.length} polis
                      {group.policies.length === 1 ? "" : "sen"} · totaal{" "}
                      {formatCurrency(group.totalPremium)}
                    </div>

                    <div className="space-y-2">
                      {group.policies.map((policy, index) => (
                        <div
                          key={`${group.insurancePartyId}-${policy.policyNumber}-${index}`}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <span className="text-sm text-gray-800">
                            Polis {policy.policyNumber || "—"}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(policy.premium)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSingle(group.insurancePartyId)}
                      disabled={busyKey === `${action}-${group.insurancePartyId}`}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {busyKey === `${action}-${group.insurancePartyId}`
                        ? "Bezig..."
                        : action === "editor"
                        ? "Open editor"
                        : action === "print"
                        ? "Print"
                        : action === "pdf"
                        ? "PDF"
                        : "Word"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}