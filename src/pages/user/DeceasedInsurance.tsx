import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  DashboardLayout,
  FormCard,
  FormField,
  FuneralForm,
  LoadingState,
  ErrorState,
} from "../../components";
import { useDropdownData, useFormHandler, useSaveAndNext } from "../../hooks";
import { endpoints } from "../../api/apiConfig";
import { InsuranceEntry } from "../../types";

type PolicyRow = {
  policyNumber: string;
  premium?: number;
};

type InsuranceGroup = {
  insurancePartyId: string;
  policies: PolicyRow[];
};

const emptyPolicy = (): PolicyRow => ({
  policyNumber: "",
  premium: undefined,
});

const emptyGroup = (): InsuranceGroup => ({
  insurancePartyId: "",
  policies: [emptyPolicy()],
});

const groupEntries = (entries: InsuranceEntry[] = []): InsuranceGroup[] => {
  const validEntries = entries.filter(
    (entry) =>
      entry.insurancePartyId?.trim() ||
      entry.policyNumber?.trim() ||
      (entry.premium !== undefined && entry.premium !== null)
  );

  if (validEntries.length === 0) return [emptyGroup()];

  const groupedMap = new Map<string, InsuranceGroup>();

  validEntries.forEach((entry) => {
    const key = entry.insurancePartyId?.trim() || `__empty__-${crypto.randomUUID()}`;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        insurancePartyId: entry.insurancePartyId ?? "",
        policies: [],
      });
    }

    groupedMap.get(key)!.policies.push({
      policyNumber: entry.policyNumber ?? "",
      premium: entry.premium,
    });
  });

  return Array.from(groupedMap.values()).map((group) => ({
    ...group,
    policies: group.policies.length > 0 ? group.policies : [emptyPolicy()],
  }));
};

const flattenGroups = (groups: InsuranceGroup[]): InsuranceEntry[] => {
  return groups.flatMap((group) =>
    group.policies.map((policy) => ({
      insurancePartyId: group.insurancePartyId,
      policyNumber: policy.policyNumber,
      premium: policy.premium,
    }))
  );
};

export default function DeceasedInsurance() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as
    | {
        dossierId?: string;
        funeralLeader?: string;
        funeralNumber?: string;
      }
    | undefined;

  const { dossierId } = useParams();
  const initializedRef = useRef(false);

  const {
    formData,
    handleChange,
    setFormData,
    goBack,
    loading: formLoading,
    error: formError,
  } = useFormHandler({
    initialData: {
      id: "",
      funeralLeader: navState?.funeralLeader ?? "",
      funeralNumber: navState?.funeralNumber ?? "",
      insuranceEntries: [] as InsuranceEntry[],
      age: "",
    },
    steps: ["/deceased-information", "/deceased-insurance", "/deceased-layout", "/success-deceased"],
    fetchUrl: dossierId ? `${endpoints.insuranceDeceased}/${dossierId}` : undefined,
    allow404AsEmpty: true,
  });

  const [insuranceGroups, setInsuranceGroups] = useState<InsuranceGroup[]>([emptyGroup()]);

  useEffect(() => {
    if (formLoading || initializedRef.current) return;

    const grouped = groupEntries(formData.insuranceEntries ?? []);
    setInsuranceGroups(grouped);
    initializedRef.current = true;
  }, [formLoading, formData.insuranceEntries]);

  const saveUrl = dossierId
    ? `${endpoints.insuranceDeceased}/${dossierId}`
    : endpoints.insuranceDeceased;

  const sanitizedFormData = useMemo(() => {
    const flattened = flattenGroups(insuranceGroups).filter((entry) => {
      const hasInsurancePartyId = !!entry.insurancePartyId?.trim();
      const hasPolicyNumber = !!entry.policyNumber?.trim();
      const hasPremium = entry.premium !== undefined && entry.premium !== null;
      return hasInsurancePartyId || hasPolicyNumber || hasPremium;
    });

    return {
      ...formData,
      insuranceEntries: flattened,
    };
  }, [formData, insuranceGroups]);

  const { handleNext } = useSaveAndNext({
    formData: sanitizedFormData,
    endpoint: saveUrl,
    id: dossierId,
    getNextPath: (_result, currentId) => {
      return currentId ? `/deceased-layout/${currentId}` : "/deceased-layout";
    },
    getNextState: (_result, currentId) => ({
      dossierId: currentId ?? formData.id ?? "",
      funeralLeader: formData.funeralLeader ?? "",
      funeralNumber: formData.funeralNumber ?? "",
    }),
  });

  const { data, loading: dropdownLoading, errors: dropdownErrors } = useDropdownData({
    insuranceParties: endpoints.insuranceCompanies,
  });

  const insuranceParties = (data.insuranceParties || []).filter((p: any) => p.isInsurance);

  const updateGroup = (groupIndex: number, updates: Partial<InsuranceGroup>) => {
    setInsuranceGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, ...updates } : group
      )
    );
  };

  const updatePolicy = (
    groupIndex: number,
    policyIndex: number,
    field: keyof PolicyRow,
    value: string | number
  ) => {
    setInsuranceGroups((prev) =>
      prev.map((group, gIndex) => {
        if (gIndex !== groupIndex) return group;

        return {
          ...group,
          policies: group.policies.map((policy, pIndex) =>
            pIndex === policyIndex
              ? {
                  ...policy,
                  [field]:
                    field === "premium"
                      ? value === ""
                        ? undefined
                        : Number(value)
                      : value,
                }
              : policy
          ),
        };
      })
    );
  };

  const addInsuranceGroup = () => {
    setInsuranceGroups((prev) => [...prev, emptyGroup()]);
  };

  const removeInsuranceGroup = (groupIndex: number) => {
    setInsuranceGroups((prev) => {
      const updated = prev.filter((_, index) => index !== groupIndex);
      return updated.length > 0 ? updated : [emptyGroup()];
    });
  };

  const addPolicyToGroup = (groupIndex: number) => {
    setInsuranceGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? { ...group, policies: [...group.policies, emptyPolicy()] }
          : group
      )
    );
  };

  const removePolicyFromGroup = (groupIndex: number, policyIndex: number) => {
    setInsuranceGroups((prev) =>
      prev.map((group, index) => {
        if (index !== groupIndex) return group;

        const updatedPolicies = group.policies.filter((_, i) => i !== policyIndex);

        return {
          ...group,
          policies: updatedPolicies.length > 0 ? updatedPolicies : [emptyPolicy()],
        };
      })
    );
  };

  return (
    <DashboardLayout>
      <div className="px-8 pb-8 max-w-8xl mx-auto space-y-6">
        <FuneralForm
          formData={formData}
          onChange={handleChange}
          onNext={handleNext}
          onBack={() =>
            goBack(location.pathname, {
              dossierId: dossierId ?? formData.id ?? "",
              funeralLeader: formData.funeralLeader ?? "",
              funeralNumber: formData.funeralNumber ?? "",
            })
          }
          readOnly={true}
          navigationActions={[
            { label: "Dashboard", onClick: () => navigate("/dashboard") },
            { label: "Overledene", onClick: () => navigate(`/deceased/${dossierId}`) },
            { label: "Opdrachtgever", onClick: () => navigate(`/deceased-information/${dossierId}`) },
            { label: "Opbaren", onClick: () => navigate(`/deceased-layout/${dossierId}`) },
            { label: "Condoleance", onClick: () => navigate(`/deceased-funeral/${dossierId}`) },
            { label: "Documenten", onClick: () => navigate(`/deceased-documents/${dossierId}`) },
            { label: "Kostenbegroting ", onClick: () => navigate(`/deceased-invoice/${dossierId}`) },
            { label: "Diensten", onClick: () => navigate(`/deceased-services/${dossierId}`) },
          ]}
        />

        {formLoading ? (
          <LoadingState
            title="Gegevens laden"
            message="Verzekeringsgegevens worden geladen..."
          />
        ) : formError ? (
          <ErrorState
            title="Fout bij laden"
            message={formError}
          />
        ) : (
          <FormCard title="Verzekeringen">
            <div className="space-y-6">
              {insuranceGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border rounded p-4 space-y-4">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <FormField label={`Verzekering ${groupIndex + 1}`} required>
                        {dropdownLoading.insuranceParties ? (
                          <div className="text-sm text-gray-500">Verzekeraars worden geladen...</div>
                        ) : dropdownErrors.insuranceParties ? (
                          <div className="text-sm text-red-600">{dropdownErrors.insuranceParties}</div>
                        ) : (
                          <select
                            value={group.insurancePartyId}
                            onChange={(e) =>
                              updateGroup(groupIndex, { insurancePartyId: e.target.value })
                            }
                            className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900"
                          >
                            <option value="">Selecteer verzekeraar…</option>
                            {insuranceParties.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </FormField>
                    </div>

                    {insuranceGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInsuranceGroup(groupIndex)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Verwijder verzekering
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {group.policies.map((policy, policyIndex) => (
                      <div
                        key={policyIndex}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-gray-50"
                      >
                        <FormField label="Polisnummer" required>
                          <input
                            type="text"
                            value={policy.policyNumber}
                            onChange={(e) =>
                              updatePolicy(groupIndex, policyIndex, "policyNumber", e.target.value)
                            }
                            className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900 bg-transparent"
                            placeholder="Polisnummer"
                          />
                        </FormField>

                        <FormField label="Premie (€)">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={policy.premium ?? ""}
                            onChange={(e) =>
                              updatePolicy(groupIndex, policyIndex, "premium", e.target.value)
                            }
                            className="w-full border-0 border-b border-gray-300 rounded-none focus:ring-0 focus:border-gray-900 bg-transparent"
                            placeholder="0,00"
                          />
                        </FormField>

                        <div className="flex items-end">
                          {group.policies.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePolicyFromGroup(groupIndex, policyIndex)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                            >
                              Verwijder polis
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addPolicyToGroup(groupIndex)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Voeg polis toe
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={addInsuranceGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Voeg verzekering toe
              </button>
            </div>
          </FormCard>
        )}
      </div>
    </DashboardLayout>
  );
}