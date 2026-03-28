export interface AddressLookupResult {
  street: string;
  city: string;
  county: string;
}

export const lookupAddress = async (
  postalCode: string,
  houseNumber: string,
  suffix?: string
): Promise<AddressLookupResult | null> => {
  const normalized = postalCode.replace(/\s/g, "").toUpperCase();
  if (!/^\d{4}[A-Z]{2}$/.test(normalized) || !houseNumber.trim()) return null;

  const query = suffix?.trim()
    ? `${normalized} ${houseNumber.trim()} ${suffix.trim()}`
    : `${normalized} ${houseNumber.trim()}`;
  const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}&fq=type:adres&fl=straatnaam,woonplaatsnaam,gemeentenaam&rows=1`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const doc = data?.response?.docs?.[0];
  if (!doc) return null;

  return {
    street: doc.straatnaam ?? "",
    city: doc.woonplaatsnaam ?? "",
    county: doc.gemeentenaam ?? "",
  };
};
