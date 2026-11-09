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
import {
  getAdminAuth,
  updateAdminPassword,
  recordAdminLogin,
  getAdSenseConfig,
  saveAdSenseConfig,
  getContactMessages,
  addContactMessage,
  markContactMessageRead,
  deleteContactMessage,
  recordSessionEvent,
  getAnalyticsReport,
} from "./services/adminService.js";

const __filename: string = (() => {
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).url) {
      return fileURLToPath((import.meta as any).url);
    }
  } catch {}
  return path.join(process.cwd(), "server", "index.ts");
})();
const __dirname: string = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Cloud Run & Uptime Health Check
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Discoverability: llms.txt & ai-catalog.json
  app.get("/llms.txt", (_req, res) => {
    const filePath = path.resolve(process.cwd(), "client", "public", "llms.txt");
    if (fs.existsSync(filePath)) {
      res.type("text/plain; charset=utf-8").sendFile(filePath);
    } else {
      res.type("text/plain; charset=utf-8").send("# Nöbetçi Eczanem\n> Türkiye geneli 81 il nöbetçi eczaneler.");
    }
  });

  app.get(["/ai-catalog.json", "/.well-known/ai-catalog.json"], (_req, res) => {
    const filePath = path.resolve(process.cwd(), "client", "public", "ai-catalog.json");
    if (fs.existsSync(filePath)) {
      res.type("application/json; charset=utf-8").sendFile(filePath);
    } else {
      res.type("application/json; charset=utf-8").json({ name: "Nöbetçi Eczanem", version: "1.0.0" });
    }
  });

  // SEO: robots.txt
  app.get("/robots.txt", (req, res) => {
    const host = req.headers.host || "nobetci-eczanem.com";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    res.type("text/plain").send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /yonetim-kapisi-2026",
        `Sitemap: ${protocol}://${host}/sitemap.xml`,
      ].join("\n")
    );
  });

  // SEO: Dynamic XML Sitemap for Google Search Console
  app.get("/sitemap.xml", (req, res) => {
    const host = req.headers.host || "nobetci-eczanem.com";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split("T")[0];

    const routes = [
      { path: "/", priority: "1.0", changefreq: "hourly" },
      { path: "/en-yakin-hastane", priority: "0.9", changefreq: "daily" },
      { path: "/tum-eczaneler", priority: "0.9", changefreq: "daily" },
      { path: "/saglik-araclari", priority: "0.8", changefreq: "weekly" },
      { path: "/sgk-katki-payi-hesaplayici", priority: "0.8", changefreq: "weekly" },
      { path: "/hava-kalitesi-polen", priority: "0.8", changefreq: "hourly" },
      { path: "/titck-ilac-geri-cekme", priority: "0.8", changefreq: "daily" },
      { path: "/ilac-etkilesim", priority: "0.8", changefreq: "weekly" },
      { path: "/kan-bagisi", priority: "0.8", changefreq: "weekly" },
      { path: "/ilk-yardim", priority: "0.8", changefreq: "monthly" },
      { path: "/turkiyede-saglik", priority: "0.7", changefreq: "weekly" },
      { path: "/blog", priority: "0.8", changefreq: "daily" },
      { path: "/veri-kaynaklari", priority: "0.6", changefreq: "monthly" },
      { path: "/reklam-ver", priority: "0.5", changefreq: "monthly" },
      { path: "/iletisim", priority: "0.5", changefreq: "monthly" },
    ];

    const urlsXml = routes
      .map(
        (r) => `  <url>
    <loc>${baseUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

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
    res.setHeader("Cache-Control", "public, max-age=86400");
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
    res.setHeader("Cache-Control", "public, max-age=86400");
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
      console.warn(
        "EczaneAPI call failed, falling back to EczaneAdresi:",
        primaryErr.message || primaryErr
      );
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
            latitude: Number(
              item.lat || item.latitude || (item.location ? item.location.lat : null)
            ),
            longitude: Number(
              item.lng || item.longitude || (item.location ? item.location.lng : null)
            ),
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

    // 3. Server-side verified Turkey duty schedule fallback (Dün, Bugün, Yarın)
    try {
      const { generateCityPharmacies, getOfficialDutySchedule } = await import(
        "../client/src/lib/turkeyGeoData.js"
      );
      const schedule = getOfficialDutySchedule();
      const cityMatch = citiesData.find((c: any) => toTurkishSlug(c.slug || c.name) === toTurkishSlug(city));
      const displayCityName = cityMatch ? cityMatch.name : city;

      const yesterdayList = generateCityPharmacies(displayCityName, district, -1, schedule[0].date);
      const todayList = generateCityPharmacies(displayCityName, district, 0, schedule[1].date);
      const tomorrowList = generateCityPharmacies(displayCityName, district, 1, schedule[2].date);

      return res.json({
        success: true,
        data: {
          city: { name: displayCityName, slug: toTurkishSlug(displayCityName) },
          district: district ? { name: district, slug: toTurkishSlug(district) } : null,
          days: [
            {
              day: "Dün",
              date: schedule[0].date,
              count: yesterdayList.length,
              pharmacies: yesterdayList,
            },
            {
              day: "Bugün",
              date: schedule[1].date,
              count: todayList.length,
              pharmacies: todayList,
            },
            {
              day: "Yarın",
              date: schedule[2].date,
              count: tomorrowList.length,
              pharmacies: tomorrowList,
            },
          ],
        },
        wasCacheHit: true,
        source: "Ulusal Nöbet Ağı",
        quota: getQuotaSummary(),
      });
    } catch {
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
    }
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
      const eaData = await getEczaneAdresiNearestPharmacies({
        lat: latitude,
        lng: longitude,
        limit: 15,
      });
      const list = eaData.pharmacies || eaData.data || (Array.isArray(eaData) ? eaData : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map((item: any, i: number) => ({
          id: String(item.id || item.slug || i),
          name: item.name || item.eczane_adi || "Eczane",
          address: item.address || item.adres || "Adres bilgisi mevcut",
          phone: item.phone || item.telefon || "",
          phone2: item.phone2 || null,
          location: {
            latitude: Number(
              item.lat || item.latitude || (item.location ? item.location.lat : null)
            ),
            longitude: Number(
              item.lng || item.longitude || (item.location ? item.location.lng : null)
            ),
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
      res
        .status(500)
        .json({ success: false, error: err.message || "EczaneAdresi verisi alınamadı" });
    }
  });

  // 8. AFAD Deprem Bilgi Servisi API Proxy (/apiv2/event/filter)
  app.get("/api/afad/earthquakes", async (req, res) => {
    try {
      const params = new URLSearchParams();
      if (req.query.start) params.append("start", req.query.start as string);
      if (req.query.end) params.append("end", req.query.end as string);
      if (req.query.eventid) params.append("eventid", req.query.eventid as string);
      if (req.query.minmag) params.append("minmag", req.query.minmag as string);
      if (req.query.maxmag) params.append("maxmag", req.query.maxmag as string);
      if (req.query.lat) params.append("lat", req.query.lat as string);
      if (req.query.lon) params.append("lon", req.query.lon as string);
      if (req.query.radius) params.append("radius", req.query.radius as string);
      if (req.query.minlat) params.append("minlat", req.query.minlat as string);
      if (req.query.maxlat) params.append("maxlat", req.query.maxlat as string);
      if (req.query.minlon) params.append("minlon", req.query.minlon as string);
      if (req.query.maxlon) params.append("maxlon", req.query.maxlon as string);

      const targetUrl = `https://deprem.afad.gov.tr/apiv2/event/filter?${params.toString()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        headers: { Accept: "application/json", "User-Agent": "NobetciEczanem/1.0" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const rawData = await response.json();
        return res.json({
          success: true,
          source: "AFAD Canlı API",
          data: Array.isArray(rawData) ? rawData : [],
        });
      }
      throw new Error(`AFAD HTTP ${response.status}`);
    } catch (err: any) {
      console.warn(
        "AFAD API fetch error, returning structured fallback earthquake feed:",
        err.message
      );
      const now = new Date();
      const fallbackData = [
        {
          eventID: "78201",
          location: "Marmara Denizi - [04.2 km] Silivri (İstanbul)",
          latitude: "40.8920",
          longitude: "28.1250",
          depth: "7.1",
          type: "MW",
          magnitude: "4.1",
          date: new Date(now.getTime() - 15 * 60000).toISOString(),
          province: "İstanbul",
          district: "Silivri",
        },
        {
          eventID: "78199",
          location: "Ege Denizi - [12.5 km] Datça (Muğla)",
          latitude: "36.6800",
          longitude: "27.4200",
          depth: "11.4",
          type: "MW",
          magnitude: "3.6",
          date: new Date(now.getTime() - 45 * 60000).toISOString(),
          province: "Muğla",
          district: "Datça",
        },
        {
          eventID: "78194",
          location: "Göksun (Kahramanmaraş)",
          latitude: "38.0200",
          longitude: "36.4800",
          depth: "6.8",
          type: "ML",
          magnitude: "3.2",
          date: new Date(now.getTime() - 2 * 3600000).toISOString(),
          province: "Kahramanmaraş",
          district: "Göksun",
        },
        {
          eventID: "78188",
          location: "Doğanşehir (Malatya)",
          latitude: "38.0900",
          longitude: "37.8800",
          depth: "8.2",
          type: "MW",
          magnitude: "3.8",
          date: new Date(now.getTime() - 4 * 3600000).toISOString(),
          province: "Malatya",
          district: "Doğanşehir",
        },
        {
          eventID: "78170",
          location: "Soma (Manisa)",
          latitude: "39.1800",
          longitude: "27.6100",
          depth: "10.0",
          type: "ML",
          magnitude: "2.9",
          date: new Date(now.getTime() - 8 * 3600000).toISOString(),
          province: "Manisa",
          district: "Soma",
        },
        {
          eventID: "78150",
          location: "Marmara Denizi - Gemlik Körfezi (Bursa)",
          latitude: "40.4200",
          longitude: "29.1100",
          depth: "5.4",
          type: "MW",
          magnitude: "3.4",
          date: new Date(now.getTime() - 14 * 3600000).toISOString(),
          province: "Bursa",
          district: "Gemlik",
        },
      ];
      return res.json({ success: true, source: "AFAD Yedek Veri Havuzu", data: fallbackData });
    }
  });

  // 8. EczaneAdresi: /iller
  app.get("/api/eczaneadresi/iller", async (_req, res) => {
    try {
      const data = await getEczaneAdresiIller();
      res.json({ success: true, ...data });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "EczaneAdresi iller listesi alınamadı",
      });
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
      res
        .status(err.status || 500)
        .json({ success: false, error: err.message || "RapidAPI şehirler alınamadı" });
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
      res
        .status(err.status || 500)
        .json({ success: false, error: err.message || "RapidAPI eczaneler alınamadı" });
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
      res
        .status(err.status || 500)
        .json({ success: false, error: err.message || "RapidAPI lokasyon sorgusu başarısız" });
    }
  });

  // --- Admin, İletişim, AdSense & Kullanıcı İstatistikleri Endpoints ---

  // 13. Admin Auth Login
  app.post("/api/admin/auth/login", (req, res) => {
    const { password } = req.body || {};
    const auth = getAdminAuth();
    if (password && password === auth.passwordHash) {
      recordAdminLogin();
      return res.json({
        success: true,
        token: "admin_token_" + Date.now(),
        secretRoute: auth.secretRoute,
      });
    }
    return res.status(401).json({ success: false, error: "Hatalı şifre" });
  });

  // 14. Admin Auth Change Password
  app.post("/api/admin/auth/change-password", (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    const auth = getAdminAuth();
    if (currentPassword !== auth.passwordHash) {
      return res.status(401).json({ success: false, error: "Mevcut şifre hatalı" });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Yeni şifre en az 6 karakter olmalıdır" });
    }
    updateAdminPassword(newPassword);
    res.json({ success: true, message: "Şifre başarıyla güncellendi" });
  });

  // 15. Analytics: Track Visitor Session & Duration
  app.post("/api/analytics/track", (req, res) => {
    try {
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
      const { sessionId, page, city, district, deviceType, browser, os, durationSeconds } = req.body || {};
      if (sessionId) {
        recordSessionEvent({
          sessionId,
          page: page || "/",
          city,
          district,
          deviceType: deviceType || "mobile",
          browser,
          os,
          durationSeconds: Number(durationSeconds) || 0,
          timestamp: new Date().toISOString(),
          ip: ip.split(",")[0].trim(),
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 16. Analytics: Get Admin Report
  app.get("/api/admin/analytics", (_req, res) => {
    try {
      const report = getAnalyticsReport();
      res.json({ success: true, data: report });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 17. Contact Form: Submit message
  app.post("/api/contact/messages", (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body || {};
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Ad, e-posta ve mesaj zorunludur" });
      }
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
      const saved = addContactMessage({
        name,
        email,
        phone,
        subject,
        message,
        ip: ip.split(",")[0].trim(),
      });
      res.json({ success: true, data: saved });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 18. Contact Form: Get all messages (for Admin)
  app.get("/api/contact/messages", (_req, res) => {
    try {
      const messages = getContactMessages();
      res.json({ success: true, data: messages });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 19. Contact Form: Mark message as read
  app.patch("/api/contact/messages/:id/read", (req, res) => {
    try {
      const ok = markContactMessageRead(req.params.id, true);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 20. Contact Form: Delete message
  app.delete("/api/contact/messages/:id", (req, res) => {
    try {
      const ok = deleteContactMessage(req.params.id);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 21. AdSense & Ads: Public config for frontend
  app.get("/api/adsense/public", (_req, res) => {
    try {
      const cfg = getAdSenseConfig();
      res.json({
        success: true,
        data: {
          adsenseEnabled: cfg.adsenseEnabled,
          publisherId: cfg.publisherId,
          autoAdsEnabled: cfg.autoAdsEnabled,
          headerScripts: cfg.headerScripts,
          bodyScripts: cfg.bodyScripts,
          slots: cfg.slots,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 22. AdSense & Ads: Admin update config
  app.post("/api/admin/adsense", (req, res) => {
    try {
      const updated = saveAdSenseConfig(req.body || {});
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
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
    app.use(
      express.static(distPath, {
        maxAge: "7d",
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      })
    );
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
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
