import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = fs.readFileSync(".env.local", "utf8");
for (const line of env.split(/\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  console.error("Use the generated SQL in Supabase SQL Editor, or add the service role key and rerun this script.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function parseCsv(text) {
  const rows = [];
  let cell = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const lands = parseCsv(fs.readFileSync("data/processed/lands/productive_lands_soil_20260515_normalized.csv", "utf8"));
const livestock = parseCsv(fs.readFileSync("data/processed/livestock/livestock_products_20260515_normalized.csv", "utf8"));

const { data: sellers, error: sellerError } = await supabase
  .from("profiles")
  .select("id")
  .order("created_at", { ascending: true })
  .limit(1);

if (sellerError) throw sellerError;
if (!sellers?.length) throw new Error("No profiles found to use as seed seller.");

const sellerId = sellers[0].id;

const landPayload = lands.map((row) => ({
  name: row.name,
  type: row.type,
  location_city: row.location_city,
  location_department: row.location_department,
  area_ha: Number(row.area_ha || 1),
  price_per_ha: Number(row.price_per_ha || 0),
  transaction_type: row.transaction_type,
  soil_type: row.soil_type,
  water_source: row.water_source,
  altitude: row.altitude ? Number(row.altitude) : null,
  image_url: row.image_url,
  polygon_data: JSON.parse(row.polygon_data || "[]"),
  is_listed: row.is_listed === "true",
  current_valuation: Number(row.current_valuation || 0),
}));

const livestockPayload = livestock.map((row) => ({
  seller_id: sellerId,
  title: row.title,
  description: row.description,
  animal_type: row.animal_type,
  breed: row.breed,
  units: Number(row.units || 1),
  avg_weight_kg: row.avg_weight_kg ? Number(row.avg_weight_kg) : null,
  avg_age_years: row.avg_age_years ? Number(row.avg_age_years) : null,
  price: Number(row.price || 0),
  price_unit: row.price_unit,
  is_certified: row.is_certified === "true",
  health_certificates: [row.health_certificates],
  location_city: row.location_city,
  location_department: row.location_department,
  status: row.status,
  cover_image_url: row.cover_image_url,
  documents: JSON.parse(row.documents || "[]"),
}));

for (const part of chunk(landPayload, 100)) {
  const { error } = await supabase.from("productive_lands").insert(part);
  if (error) throw error;
}

for (const part of chunk(livestockPayload, 100)) {
  const { error } = await supabase.from("livestock_listings").insert(part);
  if (error) throw error;
}

console.log(`Imported ${landPayload.length} lands and ${livestockPayload.length} livestock/product listings.`);
