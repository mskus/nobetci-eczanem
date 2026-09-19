import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getOnDutyPharmacies, getNearbyPharmacies } from "./services/eczaneApi.js";
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

  // 4. On-duty pharmacies by city/district/date
  app.get("/api/pharmacies/on-duty", async (req, res) => {
    const city = (req.query.city as string) || "istanbul";
    const district = (req.query.district as string) || undefined;
    const date = (req.query.date as string) || undefined;

    try {
      const result = await getOnDutyPharmacies({ city, district, date });
      const quota = getQuotaSummary();

      res.json({
        success: true,
        data: result,
        wasCacheHit: result.wasCacheHit,
        quota,
      });
    } catch (err: any) {
      console.error("Error fetching on-duty pharmacies:", err);
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        code: err.code || "INTERNAL_ERROR",
        error: err.message || "Eczane bilgileri alınamadı",
        quota: getQuotaSummary(),
      });
    }
  });

  // 5. Nearby on-duty pharmacies by GPS coordinates
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

    try {
      const result = await getNearbyPharmacies({ latitude, longitude, radius });
      const quota = getQuotaSummary();

      res.json({
        success: true,
        data: result,
        wasCacheHit: result.wasCacheHit,
        quota,
      });
    } catch (err: any) {
      console.error("Error fetching nearby pharmacies:", err);
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        code: err.code || "INTERNAL_ERROR",
        error: err.message || "Yakındaki eczaneler alınamadı",
        quota: getQuotaSummary(),
      });
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
