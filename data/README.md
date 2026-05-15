# Datasets para ML y app

Esta carpeta separa los datos por etapa para que sirvan tanto a la app como a futuros modelos de machine learning.

## Estructura

- `raw/`: archivos originales recibidos, sin modificar.
- `processed/`: archivos normalizados, limpios y listos para entrenamiento/importacion.

## Datasets actuales

### Veterinarios

- Fuente: `raw/vets/Lista-Vet-30092022.xlsx`
- Procesado: `processed/vets/vets_ica_2022_normalized.csv`
- Registros procesados: 1.987
- Uso actual en app: `veterinarian_profiles` y `vet_specialties`

### Tierras / suelos

- Fuente: `raw/lands/REGISTRO_ANALISIS_DE_SUELOS_20260515.csv`
- Procesado: `processed/lands/productive_lands_soil_20260515_normalized.csv`
- Registros procesados: 84 predios agrupados
- Uso actual en app: `productive_lands`

### Animales / productos pecuarios

- Fuente: `raw/livestock/Datos_Abiertos_Animales_de_Pro_20260515.csv`
- Procesado: `processed/livestock/livestock_products_20260515_normalized.csv`
- Registros procesados: 159
- Uso actual en app: `livestock_listings`

## Regenerar datos procesados

```bash
python3 scripts/import_vets_from_xlsx.py
python3 scripts/import_lands_livestock_from_csv.py
```

## Cargar en Supabase

Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.

```bash
node scripts/import_vets_to_supabase.mjs
node scripts/import_lands_livestock_to_supabase.mjs
```

## Nota para entrenamiento

Para modelos de ML, usa preferiblemente los CSV de `processed/`. Supabase queda como base consultable por la app y para exploracion, pero el entrenamiento debe ser reproducible desde archivos versionados.
