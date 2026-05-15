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
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or key in .env.local");
}

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = createClient(supabaseUrl, supabaseKey, {
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
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

const marker = "Fuente: ICA, Lista-Vet-30092022.";
const csv = fs.readFileSync("data/processed/vets/vets_ica_2022_normalized.csv", "utf8");
const rows = parseCsv(csv);

console.log(`Using ${usingServiceRole ? "service role" : "anon"} key`);
console.log(`Preparing ${rows.length} vets`);

const { count: existingCount, error: countError } = await supabase
  .from("veterinarian_profiles")
  .select("*", { count: "exact", head: true })
  .ilike("bio", `%${marker}%`);

if (countError) {
  throw countError;
}

if (existingCount && !process.argv.includes("--force")) {
  console.log(`Found ${existingCount} imported ICA vets already. Use --force to add again.`);
  process.exit(0);
}

const payload = rows.map((row) => ({
  professional_title: row.professional_title,
  years_experience: Number(row.years_experience || 0),
  consultation_price: Number(row.consultation_price || 0),
  total_consultations: Number(row.total_consultations || 0),
  rating: Number(row.rating || 0),
  is_verified: row.is_verified === "true",
  bio: row.bio,
  profile_image_url: row.profile_image_url || null,
  location_city: row.location_city || null,
  location_department: row.location_department || null,
  animal_specialization: row.animal_specialization.split(";").filter(Boolean),
  available_for_emergency: row.available_for_emergency === "true",
  status: row.status || "active",
}));

let inserted = 0;
for (const part of chunk(payload, 100)) {
  const { error } = await supabase.from("veterinarian_profiles").insert(part);
  if (error) {
    console.error("Insert failed:", error);
    if (!usingServiceRole) {
      console.error("Supabase rejected anon writes. Add SUPABASE_SERVICE_ROLE_KEY to .env.local or run the generated SQL in Supabase.");
    }
    process.exit(1);
  }
  inserted += part.length;
  console.log(`Inserted ${inserted}/${payload.length}`);
}

const { data: importedVets, error: fetchError } = await supabase
  .from("veterinarian_profiles")
  .select("id")
  .ilike("bio", `%${marker}%`);

if (fetchError) {
  throw fetchError;
}

const specialties = importedVets.flatMap((vet) => [
  { vet_id: vet.id, specialty: "Animales de compañía" },
  { vet_id: vet.id, specialty: "Inspección sanitaria" },
]);

for (const part of chunk(specialties, 200)) {
  const { error } = await supabase.from("vet_specialties").upsert(part, {
    onConflict: "vet_id,specialty",
    ignoreDuplicates: true,
  });
  if (error) {
    throw error;
  }
}

console.log(`Imported ${inserted} vets and ${specialties.length} specialty links.`);
