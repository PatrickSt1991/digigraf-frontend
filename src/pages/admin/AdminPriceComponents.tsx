import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components";

import {
  FaArrowLeft,
  FaChartLine,
  FaEdit,
  FaPlus,
  FaSearch,
  FaTrash,
  FaEuroSign,
  FaFilter,
} from "react-icons/fa";

import {
  getInsurancePriceComponents,
  createInsurancePriceComponent,
  updateInsurancePriceComponent,
  getInsurancePartiesAll,
} from "../../api/adminApi";

import { InsurancePartyDto, InsurancePriceComponentDto } from "../../types";

type StatusFilter = "all" | "active" | "inactive";

const emptyForm: InsurancePriceComponentDto = {
  omschrijving: "",
  bedrag: 0,
  factuurBedrag: 0,
  verzekerdAantal: 1,
  insurancePartyIds: [],
  standaardPm: false,
  sortOrder: 10,
  isActive: true,
};

const fmtMoney = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const AdminPriceComponents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "edit">("overview");
  const [selected, setSelected] = useState<InsurancePriceComponentDto | null>(null);

  const [items, setItems] = useState<InsurancePriceComponentDto[]>([]);
  const [insuranceParties, setInsuranceParties] = useState<InsurancePartyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [partyFilter, setPartyFilter] = useState<string>(""); // optional "verzekeraar" dropdown filter

  const refresh = async () => {
    try {
      setLoadError(null);
      setLoading(true);

      const [pcs, parties] = await Promise.all([
        getInsurancePriceComponents(),
        getInsurancePartiesAll(),
      ]);

      setItems(pcs ?? []);
      // only active parties in selector is usually what you want
      setInsuranceParties((parties ?? []).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")));
    } catch (e: any) {
      setLoadError(e?.message ?? "Kon prijs componenten niet laden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return items
      .filter((x) => {
        const matchesSearch =
          !q ||
          (x.omschrijving ?? "").toLowerCase().includes(q);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && x.isActive) ||
          (statusFilter === "inactive" && !x.isActive);

        const matchesParty =
          !partyFilter || (x.insurancePartyIds ?? []).includes(partyFilter);

        return matchesSearch && matchesStatus && matchesParty;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [items, searchTerm, statusFilter, partyFilter]);

  const partyNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of insuranceParties) {
      if (p.id) map.set(p.id, p.name);
    }
    return map;
  }, [insuranceParties]);

  /* ------------------------------- FORM ---------------------------------- */

  const PriceComponentForm = ({
    initial,
    onCancel,
    onSaved,
  }: {
    initial?: InsurancePriceComponentDto;
    onCancel: () => void;
    onSaved: () => void;
  }) => {
    const [formData, setFormData] = useState<InsurancePriceComponentDto>(initial ?? emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // insurance selection UX
    const [partySearch, setPartySearch] = useState("");

    const filteredParties = useMemo(() => {
      const q = partySearch.trim().toLowerCase();
      return insuranceParties.filter((p) => {
        if (!p.id) return false;
        if (!q) return true;
        return (p.name ?? "").toLowerCase().includes(q);
      });
    }, [insuranceParties, partySearch]);

    const toggleParty = (id: string) => {
      setFormData((prev) => {
        const set = new Set(prev.insurancePartyIds ?? []);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        return { ...prev, insurancePartyIds: Array.from(set) };
      });
    };

    const selectAllFiltered = () => {
      setFormData((prev) => {
        const set = new Set(prev.insurancePartyIds ?? []);
        for (const p of filteredParties) if (p.id) set.add(p.id);
        return { ...prev, insurancePartyIds: Array.from(set) };
      });
    };

    const deselectAllFiltered = () => {
      setFormData((prev) => {
        const set = new Set(prev.insurancePartyIds ?? []);
        for (const p of filteredParties) if (p.id) set.delete(p.id);
        return { ...prev, insurancePartyIds: Array.from(set) };
      });
    };

    const handleSave = async () => {
      setError(null);

      if (!formData.omschrijving.trim()) {
        setError("Omschrijving is verplicht.");
        return;
      }

      if ((formData.sortOrder ?? 0) < 0) {
        setError("Sortering moet 0 of hoger zijn.");
        return;
      }

      // If you require at least one verzekering/herkomst:
      if (!formData.insurancePartyIds?.length) {
        setError("Selecteer minimaal 1 verzekering/herkomst.");
        return;
      }

      setSaving(true);
      try {
        const payload: InsurancePriceComponentDto = {
          ...formData,
          omschrijving: formData.omschrijving.trim(),
          bedrag: Number(formData.bedrag ?? 0),
          factuurBedrag: Number(formData.factuurBedrag ?? 0),
          verzekerdAantal: Number(formData.verzekerdAantal ?? 0),
          sortOrder: Number(formData.sortOrder ?? 0),
        };

        if (payload.id) {
          await updateInsurancePriceComponent(payload);
        } else {
          await createInsurancePriceComponent(payload);
        }

        await refresh();
        onSaved();
      } catch (e: any) {
        setError(e?.message ?? "Opslaan mislukt.");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 h-16 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaEuroSign className="text-green-600" />
            {formData.id ? "Prijs component bewerken" : "Nieuwe prijs component"}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: core fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Omschrijving *
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="bv. Akte van Cessie"
                  value={formData.omschrijving}
                  onChange={(e) => setFormData({ ...formData, omschrijving: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrag
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.bedrag}
                    onChange={(e) => setFormData({ ...formData, bedrag: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standaard bedrag op de kostenbegroting.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Factuur bedrag
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.factuurBedrag}
                    onChange={(e) =>
                      setFormData({ ...formData, factuurBedrag: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Altijd op de factuur, los van begroting.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verzekerd aantal
                  </label>
                  <input
                    type="number"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.verzekerdAantal}
                    onChange={(e) =>
                      setFormData({ ...formData, verzekerdAantal: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">bv. 2 rouwauto's</p>
                </div>

                <div className="sm:col-span-1 flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!formData.standaardPm}
                      onChange={(e) => setFormData({ ...formData, standaardPm: e.target.checked })}
                    />
                    Standaard PM
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sortering
                  </label>
                  <input
                    type="number"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">1 bovenaan, 2 eronder…</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === "active" })
                  }
                >
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                </select>
              </div>
            </div>

            {/* Right column: insurance parties selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Verzekeringen</h3>
                <span className="text-sm text-gray-600">
                  geselecteerd: {formData.insurancePartyIds?.length ?? 0}
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Zoek verzekeraar..."
                    value={partySearch}
                    onChange={(e) => setPartySearch(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                >
                  Selecteer alles
                </button>

                <button
                  type="button"
                  onClick={deselectAllFiltered}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                >
                  Deselecteer
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-72 overflow-auto">
                  {filteredParties.map((p) => {
                    const id = p.id!;
                    const checked = formData.insurancePartyIds?.includes(id) ?? false;
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleParty(id)}
                        />
                        <span className="text-sm text-gray-800">{p.name}</span>
                      </label>
                    );
                  })}
                  {filteredParties.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">Geen verzekeraars gevonden.</div>
                  )}
                </div>
              </div>

              {/* Selected chips */}
              {(formData.insurancePartyIds?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.insurancePartyIds.slice(0, 8).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleParty(id)}
                      className="px-2.5 py-1 rounded-full text-xs border bg-gray-50 hover:bg-gray-100"
                      title="Klik om te verwijderen"
                    >
                      {partyNameById.get(id) ?? id} ✕
                    </button>
                  ))}
                  {formData.insurancePartyIds.length > 8 && (
                    <span className="text-xs text-gray-500">
                      +{formData.insurancePartyIds.length - 8} meer
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Sluiten
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700"
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------ RENDER ---------------------------------- */

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4 h-full">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Terug"
                >
                  <FaArrowLeft size={16} />
                </Link>

                <div className="flex items-center gap-3 h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <FaEuroSign className="text-white" size={22} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Kostenbegroting Prijs Componenten
                    </h1>
                    <p className="text-gray-600">Beheer prijscomponenten per verzekering</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 h-full items-center">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "overview"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Overzicht
                </button>

                <button
                  onClick={() => {
                    setSelected(null);
                    setActiveTab("add");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FaPlus size={16} />
                  Nieuwe Prijs Component
                </button>
              </div>
            </div>
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Zoek op omschrijving..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={partyFilter}
                      onChange={(e) => setPartyFilter(e.target.value)}
                      title="Filter verzekeraar"
                    >
                      <option value="">Alle verzekeraars</option>
                      {insuranceParties
                        .filter((p) => p.id)
                        .map((p) => (
                          <option key={p.id} value={p.id!}>
                            {p.name}
                          </option>
                        ))}
                    </select>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                      <option value="all">Alle statussen</option>
                      <option value="active">Actief</option>
                      <option value="inactive">Inactief</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaChartLine size={16} />
                    {filtered.length} componenten
                    <button
                      onClick={() => void refresh()}
                      className="px-3 py-2 rounded-lg border hover:bg-gray-50 flex items-center gap-2"
                      title="Vernieuwen"
                    >
                      <FaFilter />
                      Filters
                    </button>
                  </div>
                </div>

                {loadError && <div className="mt-4 text-sm text-red-600">{loadError}</div>}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Omschrijving
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bedrag
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Factuur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aantal
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PM
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sort
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acties
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {loading && (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-gray-500">
                            Laden...
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        filtered.map((x) => (
                          <tr key={x.id ?? x.omschrijving} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{x.omschrijving}</div>
                              <div className="text-xs text-gray-500">
                                {x.insurancePartyIds?.length ?? 0} verzekeringen
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              € {fmtMoney(x.bedrag)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              € {fmtMoney(x.factuurBedrag)}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              {x.verzekerdAantal}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {x.standaardPm ? (
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  Ja
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                  Nee
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                              {x.sortOrder}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {x.isActive ? (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Actief
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Inactief
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelected(x);
                                    setActiveTab("edit");
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Bewerken"
                                >
                                  <FaEdit size={16} />
                                </button>

                                <button
                                  onClick={async () => {
                                    if (!x.id) return;
                                    await updateInsurancePriceComponent({ ...x, isActive: !x.isActive });
                                    await refresh();
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    x.isActive ? "text-red-600 hover:bg-red-50" : "text-green-700 hover:bg-green-50"
                                  }`}
                                  title={x.isActive ? "Deactiveren" : "Activeren"}
                                >
                                  {x.isActive ? <FaTrash size={16} /> : <FaPlus size={16} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                      {!loading && !loadError && filtered.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-gray-500">
                            Geen prijscomponenten gevonden.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Add */}
          {activeTab === "add" && (
            <PriceComponentForm
              onCancel={() => setActiveTab("overview")}
              onSaved={() => {
                setActiveTab("overview");
                setSelected(null);
              }}
            />
          )}

          {/* Edit */}
          {activeTab === "edit" && selected && (
            <PriceComponentForm
              initial={selected}
              onCancel={() => {
                setActiveTab("overview");
                setSelected(null);
              }}
              onSaved={() => {
                setActiveTab("overview");
                setSelected(null);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPriceComponents;