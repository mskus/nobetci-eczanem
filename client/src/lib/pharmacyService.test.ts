import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchDutyPharmaciesAuto } from "./pharmacyService";

afterEach(() => vi.unstubAllGlobals());

describe("nöbetçi eczane veri güvenliği", () => {
  it("kaynaklar yanıt vermediğinde eczane üretmez", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await fetchDutyPharmaciesAuto("İstanbul", "Kadıköy");
    expect(result.success).toBe(false);
    expect(result.days).toEqual([]);
  });

  it("kaynakta tek gün varsa yalnızca o günü gösterir", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        date: "2026-09-19",
        pharmacies: [{ name: "Deneme Eczanesi", address: "Test adresi", phone: "", lat: 41, lng: 29 }],
      }),
    }));
    const result = await fetchDutyPharmaciesAuto("İstanbul", "Kadıköy");
    expect(result.success).toBe(true);
    expect(result.days).toHaveLength(1);
    expect(result.days[0].pharmacies[0].name).toBe("Deneme Eczanesi");
  });
});
