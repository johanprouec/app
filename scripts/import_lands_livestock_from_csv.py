#!/usr/bin/env python3
"""Build normalized CSV and Supabase SQL for land and livestock seed imports."""

from __future__ import annotations

import csv
import re
from collections import OrderedDict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LAND_SOURCE = ROOT / "data" / "raw" / "lands" / "REGISTRO_ANALISIS_DE_SUELOS_20260515.csv"
LIVESTOCK_SOURCE = ROOT / "data" / "raw" / "livestock" / "Datos_Abiertos_Animales_de_Pro_20260515.csv"
LAND_OUT = ROOT / "data" / "processed" / "lands" / "productive_lands_soil_20260515_normalized.csv"
LIVESTOCK_OUT = ROOT / "data" / "processed" / "livestock" / "livestock_products_20260515_normalized.csv"
SQL_OUT = ROOT / "supabase" / "migrations" / "20260515_import_lands_livestock.sql"


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\ufeff", "")).strip()


def title(value: str) -> str:
    return clean(value).title()


def slug_key(*parts: str) -> str:
    return "|".join(clean(part).lower() for part in parts)


def sql(value: str | int | float | bool | None) -> str:
    if value is None or value == "":
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + value.replace("'", "''") + "'"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as file:
        return [{key: clean(value) for key, value in row.items()} for row in csv.DictReader(file)]


def normalize_lands() -> list[dict[str, str]]:
    grouped: OrderedDict[str, dict[str, str | set[str]]] = OrderedDict()
    for row in read_csv(LAND_SOURCE):
        predio = title(row["NOMBRE DEL PREDIO"])
        vereda = title(row["VEREDA"])
        cultivo = title(row["TIPO DE CULTIVO"])
        owner = title(row["NOMBRE"])
        key = slug_key(predio, vereda)
        item = grouped.setdefault(
            key,
            {
                "source_sequences": set(),
                "source_owners": set(),
                "crops": set(),
                "name": f"Predio {predio}",
                "type": "Agrícola",
                "location_city": vereda,
                "location_department": "Colombia",
                "area_ha": "1",
                "price_per_ha": "0",
                "transaction_type": "Venta",
                "soil_type": "",
                "water_source": "No registrada",
                "altitude": "",
                "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
                "polygon_data": "[]",
                "is_listed": "true",
                "current_valuation": "0",
            },
        )
        item["source_sequences"].add(row["SECUENCIA"])
        item["source_owners"].add(owner)
        item["crops"].add(cultivo)

    normalized: list[dict[str, str]] = []
    for item in grouped.values():
        crops = sorted(item.pop("crops"))
        owners = sorted(item.pop("source_owners"))
        sequences = sorted(item.pop("source_sequences"), key=lambda value: int(value) if value.isdigit() else value)
        item["soil_type"] = ", ".join(crops)
        item["source_note"] = (
            "Registro de análisis de suelos. "
            f"Cultivos reportados: {', '.join(crops)}. "
            f"Usuarios fuente: {', '.join(owners[:5])}"
            + ("..." if len(owners) > 5 else "")
            + f". Secuencias: {', '.join(sequences)}."
        )
        normalized.append({key: str(value) for key, value in item.items()})
    return normalized


ANIMAL_TYPE_MAP = {
    "bovinos": "bovino",
    "bufálos": "bovino",
    "búfalos": "bovino",
    "porcinos": "porcino",
    "equinos": "equino",
    "ovinos": "ovino",
    "caprinos": "caprino",
    "aves": "avicola",
    "avicola": "avicola",
    "avícola": "avicola",
}


def normalize_livestock() -> list[dict[str, str]]:
    normalized = []
    seen = set()
    for row in read_csv(LIVESTOCK_SOURCE):
        product = clean(row["Descripción producto"])
        product_class = title(row["Clase"])
        presentation = clean(row["Presentación"])
        species = title(row["Especie"])
        animal_type = ANIMAL_TYPE_MAP.get(species.lower(), "bovino")
        key = slug_key(product, product_class, presentation, species)
        if key in seen:
            continue
        seen.add(key)

        normalized.append(
            {
                "title": f"{product} - {species}",
                "description": (
                    "Producto/insumo pecuario de datos abiertos. "
                    f"Clase: {product_class}. Presentación: {presentation}. "
                    f"Especie destino: {species}. Fuente: Datos_Abiertos_Animales_de_Pro_20260515."
                ),
                "animal_type": animal_type,
                "breed": species,
                "units": "1",
                "avg_weight_kg": "",
                "avg_age_years": "",
                "price": "0",
                "price_unit": "total",
                "is_certified": "true",
                "health_certificates": "Datos abiertos ICA",
                "location_city": "Colombia",
                "location_department": "Colombia",
                "status": "active",
                "cover_image_url": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80",
                "documents": "[]",
            }
        )
    return normalized


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_sql(lands: list[dict[str, str]], livestock: list[dict[str, str]]) -> None:
    land_values = []
    for row in lands:
        land_values.append(
            "("
            + ", ".join(
                [
                    sql(row["name"]),
                    sql(row["type"]),
                    sql(row["location_city"]),
                    sql(row["location_department"]),
                    row["area_ha"],
                    row["price_per_ha"],
                    sql(row["transaction_type"]),
                    sql(row["soil_type"]),
                    sql(row["water_source"]),
                    sql(row["altitude"] or None),
                    sql(row["image_url"]),
                    sql(row["polygon_data"]) + "::jsonb",
                    row["is_listed"],
                    row["current_valuation"],
                ]
            )
            + ")"
        )

    livestock_values = []
    for row in livestock:
        certs = "jsonb_build_array(" + sql(row["health_certificates"]) + ")"
        docs = sql(row["documents"]) + "::jsonb"
        livestock_values.append(
            "("
            + ", ".join(
                [
                    sql(row["title"]),
                    sql(row["description"]),
                    sql(row["animal_type"]),
                    sql(row["breed"]),
                    row["units"],
                    sql(row["avg_weight_kg"] or None),
                    sql(row["avg_age_years"] or None),
                    row["price"],
                    sql(row["price_unit"]),
                    row["is_certified"],
                    certs,
                    sql(row["location_city"]),
                    sql(row["location_department"]),
                    sql(row["status"]),
                    sql(row["cover_image_url"]),
                    docs,
                ]
            )
            + ")"
        )

    SQL_OUT.write_text(
        f"""-- Import generated from:
-- data/raw/lands/REGISTRO_ANALISIS_DE_SUELOS_20260515.csv
-- data/raw/livestock/Datos_Abiertos_Animales_de_Pro_20260515.csv

WITH imported_lands (
  name, type, location_city, location_department, area_ha, price_per_ha,
  transaction_type, soil_type, water_source, altitude, image_url, polygon_data,
  is_listed, current_valuation
) AS (
  VALUES
  {",\n  ".join(land_values)}
)
INSERT INTO public.productive_lands (
  name, type, location_city, location_department, area_ha, price_per_ha,
  transaction_type, soil_type, water_source, altitude, image_url, polygon_data,
  is_listed, current_valuation
)
SELECT *
FROM imported_lands source
WHERE NOT EXISTS (
  SELECT 1 FROM public.productive_lands existing
  WHERE lower(existing.name) = lower(source.name)
    AND lower(coalesce(existing.location_city, '')) = lower(coalesce(source.location_city, ''))
    AND existing.soil_type = source.soil_type
);

WITH seed_seller AS (
  SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1
),
imported_livestock (
  title, description, animal_type, breed, units, avg_weight_kg, avg_age_years,
  price, price_unit, is_certified, health_certificates, location_city,
  location_department, status, cover_image_url, documents
) AS (
  VALUES
  {",\n  ".join(livestock_values)}
)
INSERT INTO public.livestock_listings (
  seller_id, title, description, animal_type, breed, units, avg_weight_kg,
  avg_age_years, price, price_unit, is_certified, health_certificates,
  location_city, location_department, status, cover_image_url, documents
)
SELECT
  seed_seller.id,
  source.title,
  source.description,
  source.animal_type,
  source.breed,
  source.units,
  source.avg_weight_kg,
  source.avg_age_years,
  source.price,
  source.price_unit,
  source.is_certified,
  source.health_certificates,
  source.location_city,
  source.location_department,
  source.status,
  source.cover_image_url,
  source.documents
FROM imported_livestock source
CROSS JOIN seed_seller
WHERE NOT EXISTS (
  SELECT 1 FROM public.livestock_listings existing
  WHERE lower(existing.title) = lower(source.title)
    AND existing.description LIKE '%Fuente: Datos_Abiertos_Animales_de_Pro_20260515.%'
);
""",
        encoding="utf-8",
    )


def main() -> None:
    lands = normalize_lands()
    livestock = normalize_livestock()
    write_csv(LAND_OUT, lands)
    write_csv(LIVESTOCK_OUT, livestock)
    write_sql(lands, livestock)
    print(f"Normalized lands: {len(lands)} -> {LAND_OUT.relative_to(ROOT)}")
    print(f"Normalized livestock products: {len(livestock)} -> {LIVESTOCK_OUT.relative_to(ROOT)}")
    print(f"SQL: {SQL_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
