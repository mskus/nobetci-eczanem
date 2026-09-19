import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getOnDutyPharmacies, getNearbyPharmacies } from "./services/eczaneApi.js";
import {
  getEczaneAdresiDutyPharmacies,
  getEczaneAdresiNearestPharmacies,
  getEczaneAdresiIller,
  getEczaneAdresiDetail,
} from "./services/eczaneAdresiApi.js";
import {
  getRapidApiCities,
  getRapidApiPharmacies,
  getRapidApiLocations,
} from "./services/rapidApi.js";
import { getQuotaSummary } from "./services/quotaService.js";
import { TURKEY_DISTRICTS, toTurkishSlug } from "../shared/turkeyDistricts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Load static cities data
  let citiesData: any[] = [];
  try {
    const citiesFile = path.resolve(process.cwd(), "shared", "cities.json");
    if (fs.existsSync(citiesFile)) {
      citiesData = JSON.parse(fs.readFileSync(citiesFile, "utf-8")).data || [];
    }
  } catch (e) {
    console.error("Could not load cities.json:", e);
  }

  // --- API Routes ---

  // 1. Quota & Rate Limit Info
  app.get("/api/quota", (_req, res) => {
    try {
      const summary = getQuotaSummary();
      res.json({ success: true, quota: summary });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Static Cities List (0 quota consumed)
  app.get("/api/cities", (_req, res) => {
    res.json({
      success: true,
      data: citiesData,
      fromCache: true,
      note: "Statik 82 il veritabanı, 0 API kotası harcandı.",
    });
  });

  // 3. Static Districts List (0 quota consumed)
  app.get("/api/cities/:slug/districts", (req, res) => {
    const slug = toTurkishSlug(req.params.slug);
    const districts = TURKEY_DISTRICTS[slug] || [];
    res.json({
      success: true,
      city: req.params.slug,
      districts,
      fromCache: true,
      note: "Statik ilçe veritabanı, 0 API kotası harcandı.",
    });
  });

  // 4. On-duty pharmacies by city/district/date with automatic multi-source fallback
  app.get("/api/pharmacies/on-duty", async (req, res) => {
    const city = (req.query.city as string) || "istanbul";
    const district = (req.query.district as string) || undefined;
    const date = (req.query.date as string) || undefined;

    // 1. Try EczaneAPI
    try {
      const result = await getOnDutyPharmacies({ city, district, date });
      const quota = getQuotaSummary();

      return res.json({
        success: true,
        data: result,
        wasCacheHit: result.wasCacheHit,
        source: "EczaneAPI",
        quota,
      });
    } catch (primaryErr: any) {
      console.warn("EczaneAPI call failed, falling back to EczaneAdresi:", primaryErr.message || primaryErr);
    }

    // 2. Automatic fallback to EczaneAdresi.com
    try {
      const eaData = await getEczaneAdresiDutyPharmacies({ city, district, limit: 50 });
      const list = eaData.pharmacies || eaData.data || (Array.isArray(eaData) ? eaData : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item: any, i: number) => ({
          id: String(item.id || item.slug || i),
          name: item.name || item.eczane_adi || "Eczane",
          address: item.address || item.adres || "Adres bilgisi mevcut",
          phone: item.phone || item.telefon || "",
          phone2: item.phone2 || null,
          location: {
            latitude: Number(item.lat || item.latitude || (item.location ? item.location.lat : null)),
            longitude: Number(item.lng || item.longitude || (item.location ? item.location.lng : null)),
          },
          city: { name: city, slug: toTurkishSlug(city) },
          district: {
            name: item.district || district || "",
            slug: toTurkishSlug(item.district || district || ""),
          },
          duty: {
            date: eaData.date || new Date().toISOString().split("T")[0],
            isVerified: true,
          },
        }));

        return res.json({
          success: true,
          data: {
            city: { name: city, slug: toTurkishSlug(city) },
            district: district ? { name: district, slug: toTurkishSlug(district) } : null,
            days: [
              {
                day: "Bugün",
                date: eaData.date || new Date().toISOString().split("T")[0],
                count: mapped.length,
                pharmacies: mapped,
              },
            ],
          },
          wasCacheHit: eaData.wasCacheHit || false,
          source: "EczaneAdresi.com",
          quota: getQuotaSummary(),
        });
      }
    } catch (eaErr: any) {
      console.warn("EczaneAdresi fallback failed:", eaErr.message || eaErr);
    }

    // 3. Fallback response (ensures valid JSON never HTML or crash)
    res.json({
      success: true,
      data: {
        city: { name: city, slug: toTurkishSlug(city) },
        district: null,
        days: [],
      },
      source: "Yok",
      quota: getQuotaSummary(),
    });
  });

  // 5. Nearby on-duty pharmacies by GPS coordinates with automatic fallback
  app.get("/api/pharmacies/nearby", async (req, res) => {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = req.query.radius ? Number(req.query.radius) : 5;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_COORDINATES",
        error: "Geçerli bir latitude ve longitude belirtilmelidir.",
      });
    }

    // 1. Try EczaneAPI
    try {
      const result = await getNearbyPharmacies({ latitude, longitude, radius });
      const quota = getQuotaSummary();

      return res.json({
        success: true,
        data: result,
        wasCacheHit: result.wasCacheHit,
        source: "EczaneAPI",
        quota,
      });
    } catch (err: any) {
      console.warn("EczaneAPI nearby failed, falling back to EczaneAdresi:", err.message || err);
    }

    // 2. Fallback to EczaneAdresi nearest
    try {
      const eaData = await getEczaneAdresiNearestPharmacies({ lat: latitude, lng: longitude, limit: 15 });
      const list = eaData.pharmacies || eaData.data || (Array.isArray(eaData) ? eaData : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item: any, i: number) => ({
          id: String(item.id || item.slug || i),
          name: item.name || item.eczane_adi || "Eczane",
          address: item.address || item.adres || "Adres bilgisi mevcut",
          phone: item.phone || item.telefon || "",
          phone2: item.phone2 || null,
          location: {
            latitude: Number(item.lat || item.latitude || (item.location ? item.location.lat : null)),
            longitude: Number(item.lng || item.longitude || (item.location ? item.location.lng : null)),
          },
          city: { name: "Yakın Konum", slug: "yakin-konum" },
          district: { name: item.district || "", slug: toTurkishSlug(item.district || "") },
          duty: {
            date: eaData.date || new Date().toISOString().split("T")[0],
            isVerified: true,
          },
          distance: item.distance_m ? item.distance_m / 1000 : undefined,
        }));

        return res.json({
          success: true,
          data: {
            date: eaData.date || new Date().toISOString().split("T")[0],
            pharmacies: mapped,
          },
          wasCacheHit: eaData.wasCacheHit || false,
          source: "EczaneAdresi.com",
          quota: getQuotaSummary(),
        });
      }
    } catch (eaErr: any) {
      console.warn("EczaneAdresi nearest failed:", eaErr.message || eaErr);
    }

    res.json({
      success: true,
      data: {
        date: new Date().toISOString().split("T")[0],
        pharmacies: [],
      },
      source: "Yok",
      quota: getQuotaSummary(),
    });
  });

  // --- EczaneAdresi API Public v1 Endpoints ---

  // 6. EczaneAdresi: /duty-pharmacies
  app.get("/api/eczaneadresi/duty-pharmacies", async (req, res) => {
    const city = (req.query.city as string) || "istanbul";
    const district = req.query.district ? (req.query.district as string) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    try {
      const data = await getEczaneAdresiDutyPharmacies({ city, district, limit });
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "EczaneAdresi verisi alınamadı" });
    }
  });

  // 7. EczaneAdresi: /nearest-pharmacies
  app.get("/api/eczaneadresi/nearest-pharmacies", async (req, res) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: "lat ve lng parametreleri zorunludur" });
    }

    try {
      const data = await getEczaneAdresiNearestPharmacies({ lat, lng, limit });
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "EczaneAdresi en yakın eczaneler alınamadı" });
    }
  });

  // 8. EczaneAdresi: /iller
  app.get("/api/eczaneadresi/iller", async (_req, res) => {
    try {
      const data = await getEczaneAdresiIller();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "EczaneAdresi iller listesi alınamadı" });
    }
  });

  // 9. EczaneAdresi: /eczane/:slug
  app.get("/api/eczaneadresi/eczane/:slug", async (req, res) => {
    const slug = req.params.slug;
    try {
      const data = await getEczaneAdresiDetail(slug);
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || "Eczane detayı alınamadı" });
    }
  });

  // --- RapidAPI Endpoints ---

  // 10. RapidAPI: /pharmacies-on-duty/cities
  app.get("/api/rapidapi/pharmacies-on-duty/cities", async (_req, res) => {
    try {
      const data = await getRapidApiCities();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || "RapidAPI şehirler alınamadı" });
    }
  });

  // 11. RapidAPI: /pharmacies-on-duty
  app.get("/api/rapidapi/pharmacies-on-duty", async (req, res) => {
    const city = (req.query.city as string) || "istanbul";
    const district = req.query.district ? (req.query.district as string) : undefined;
    try {
      const data = await getRapidApiPharmacies({ city, district });
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || "RapidAPI eczaneler alınamadı" });
    }
  });

  // 12. RapidAPI: /pharmacies-on-duty/locations
  app.get("/api/rapidapi/pharmacies-on-duty/locations", async (req, res) => {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, error: "latitude ve longitude zorunludur" });
    }
    try {
      const data = await getRapidApiLocations({ latitude, longitude });
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, error: err.message || "RapidAPI lokasyon sorgusu başarısız" });
    }
  });

  // --- Vite Dev Middleware or Production Static ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Eczane Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
