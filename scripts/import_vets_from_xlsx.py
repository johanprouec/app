#!/usr/bin/env python3
"""Normalize the ICA vets XLSX into app-ready CSV and Supabase SQL.

The workbook is a plain .xlsx file, so this script reads the underlying XML
directly and does not require third-party Python packages.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree as ET
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SOURCE_XLSX = ROOT / "data" / "raw" / "vets" / "Lista-Vet-30092022.xlsx"
OUT_CSV = ROOT / "data" / "processed" / "vets" / "vets_ica_2022_normalized.csv"
OUT_SQL = ROOT / "supabase" / "migrations" / "20260515_import_ica_vets.sql"

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"\D+")


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\u00a0", " ")).strip()


def sql(value: str | int | float | bool | None) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + value.replace("'", "''") + "'"


def column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    number = 0
    for ch in letters:
        number = number * 26 + ord(ch.upper()) - 64
    return number - 1


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    value = cell.find("a:v", NS)
    if value is not None:
        raw = value.text or ""
        if cell.attrib.get("t") == "s":
            return shared_strings[int(raw)]
        return raw

    inline = cell.find("a:is", NS)
    if inline is not None:
        return "".join(t.text or "" for t in inline.findall(".//a:t", NS))

    return ""


def sheet_rows(zip_file: ZipFile, sheet_path: str, shared_strings: list[str]) -> Iterable[list[str]]:
    root = ET.fromstring(zip_file.read(sheet_path))
    for row in root.findall(".//a:sheetData/a:row", NS):
        values: list[str] = []
        for cell in row.findall("a:c", NS):
            ref = cell.attrib.get("r", "A1")
            idx = column_index(ref)
            while len(values) <= idx:
                values.append("")
            values[idx] = clean(cell_value(cell, shared_strings))
        yield values


def workbook_sheet_paths(zip_file: ZipFile) -> list[str]:
    workbook = ET.fromstring(zip_file.read("xl/workbook.xml"))
    rels = ET.fromstring(zip_file.read("xl/_rels/workbook.xml.rels"))
    rid_to_target = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
    paths: list[str] = []
    rel_ns = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    for sheet in workbook.find("a:sheets", NS):
        target = rid_to_target[sheet.attrib[rel_ns]]
        paths.append("xl/" + target.lstrip("/"))
    return paths


def looks_like_department_only(row: list[str]) -> bool:
    filled = [value for value in row if value]
    if len(filled) != 1:
        return False
    value = filled[0]
    return value.isupper() and "@" not in value and len(value) > 3


def normalize_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str, str, str]] = set()
    current_department = "Antioquia"
    current_city = ""

    with ZipFile(SOURCE_XLSX) as zip_file:
        shared_root = ET.fromstring(zip_file.read("xl/sharedStrings.xml"))
        shared_strings = [
            "".join(t.text or "" for t in item.findall(".//a:t", NS))
            for item in shared_root.findall("a:si", NS)
        ]

        for sheet_path in workbook_sheet_paths(zip_file):
            for raw_row in sheet_rows(zip_file, sheet_path, shared_strings):
                row = [clean(value) for value in raw_row]
                if not row or any("MEDICOS VETERINARIOS" in value for value in row):
                    continue
                if row[:7] == ["DEPARTAMENTO", "CIUDAD", "CLINICA", "NOMBRE", "APELLIDO", "CORREO", "TELEFONO_CLINICA"]:
                    continue
                if looks_like_department_only(row):
                    current_department = next(value.title() for value in row if value)
                    continue

                email_idx = next((idx for idx, value in enumerate(row) if "@" in value), -1)
                if email_idx < 2:
                    continue

                email = clean(row[email_idx]).lower()
                if not EMAIL_RE.match(email):
                    email = clean(row[email_idx]).lower()

                first_name = clean(row[email_idx - 2]).title()
                last_name = clean(row[email_idx - 1]).title()
                phone = PHONE_RE.sub("", row[email_idx + 1] if email_idx + 1 < len(row) else "")
                clinic = clean(row[email_idx - 3] if email_idx >= 3 else "")

                leading = [clean(value) for value in row[: max(0, email_idx - 3)] if clean(value)]
                if len(leading) >= 2:
                    current_department = leading[-2].title()
                    current_city = leading[-1].title()
                elif len(leading) == 1:
                    current_city = leading[0].title()

                full_name = clean(f"{first_name} {last_name}")
                if not full_name or not email:
                    continue

                key = (full_name.lower(), email.lower(), phone, current_city.lower())
                if key in seen:
                    continue
                seen.add(key)

                clinic_text = clinic or "No registrada"
                bio = (
                    "Registro ICA para inspección sanitaria de animales de compañía. "
                    f"Clínica/consultorio: {clinic_text}. "
                    f"Contacto: {email}"
                    + (f" / {phone}." if phone else ".")
                    + " Fuente: ICA, Lista-Vet-30092022."
                )

                rows.append(
                    {
                        "professional_title": f"MVZ {full_name}",
                        "years_experience": "0",
                        "consultation_price": "70000",
                        "total_consultations": "0",
                        "rating": "0.0",
                        "is_verified": "true",
                        "bio": bio,
                        "profile_image_url": "",
                        "location_city": current_city,
                        "location_department": current_department,
                        "animal_specialization": "Mascotas;Perros;Gatos",
                        "available_for_emergency": "false",
                        "status": "active",
                        "clinic_name": clinic_text,
                        "contact_email": email,
                        "contact_phone": phone,
                    "source_file": SOURCE_XLSX.name,
                    }
                )

    return rows


def write_csv(rows: list[dict[str, str]]) -> None:
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def write_sql(rows: list[dict[str, str]]) -> None:
    OUT_SQL.parent.mkdir(parents=True, exist_ok=True)
    values = []
    for row in rows:
        animal_array = "ARRAY[" + ", ".join(sql(value) for value in row["animal_specialization"].split(";")) + "]::TEXT[]"
        values.append(
            "("
            + ", ".join(
                [
                    sql(row["professional_title"]),
                    row["years_experience"],
                    row["consultation_price"],
                    row["total_consultations"],
                    row["rating"],
                    row["is_verified"].lower(),
                    sql(row["bio"]),
                    "NULL",
                    sql(row["location_city"] or None),
                    sql(row["location_department"] or None),
                    animal_array,
                    row["available_for_emergency"].lower(),
                    sql(row["status"]),
                ]
            )
            + ")"
        )

    content = f"""-- Import generated from data/raw/vets/Lista-Vet-30092022.xlsx
-- Source: ICA registered veterinarians for companion animal sanitary inspection, September 2022.

ALTER TABLE public.veterinarian_profiles ALTER COLUMN user_id DROP NOT NULL;

WITH imported_vets (
  professional_title,
  years_experience,
  consultation_price,
  total_consultations,
  rating,
  is_verified,
  bio,
  profile_image_url,
  location_city,
  location_department,
  animal_specialization,
  available_for_emergency,
  status
) AS (
  VALUES
  {",\n  ".join(values)}
)
INSERT INTO public.veterinarian_profiles (
  professional_title,
  years_experience,
  consultation_price,
  total_consultations,
  rating,
  is_verified,
  bio,
  profile_image_url,
  location_city,
  location_department,
  animal_specialization,
  available_for_emergency,
  status
)
SELECT
  professional_title,
  years_experience,
  consultation_price,
  total_consultations,
  rating,
  is_verified,
  bio,
  profile_image_url,
  location_city,
  location_department,
  animal_specialization,
  available_for_emergency,
  status
FROM imported_vets source
WHERE NOT EXISTS (
  SELECT 1
  FROM public.veterinarian_profiles existing
  WHERE lower(existing.professional_title) = lower(source.professional_title)
    AND coalesce(lower(existing.location_city), '') = coalesce(lower(source.location_city), '')
    AND existing.bio LIKE '%Fuente: ICA, Lista-Vet-30092022.%'
);

INSERT INTO public.vet_specialties (vet_id, specialty)
SELECT id, 'Animales de compañía'
FROM public.veterinarian_profiles
WHERE bio LIKE '%Fuente: ICA, Lista-Vet-30092022.%'
ON CONFLICT DO NOTHING;

INSERT INTO public.vet_specialties (vet_id, specialty)
SELECT id, 'Inspección sanitaria'
FROM public.veterinarian_profiles
WHERE bio LIKE '%Fuente: ICA, Lista-Vet-30092022.%'
ON CONFLICT DO NOTHING;
"""
    OUT_SQL.write_text(content, encoding="utf-8")


def main() -> None:
    rows = normalize_rows()
    if not rows:
        raise SystemExit("No rows were extracted.")
    write_csv(rows)
    write_sql(rows)
    print(f"Extracted {len(rows)} vets")
    print(f"CSV: {OUT_CSV.relative_to(ROOT)}")
    print(f"SQL: {OUT_SQL.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
