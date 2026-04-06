"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useCreateLivestockListing } from "@/hooks/useListings";

const ANIMAL_TYPES = [
  { value: "bovino", label: "🐄 Bovino" },
  { value: "porcino", label: "🐷 Porcino" },
  { value: "equino", label: "🐴 Equino" },
  { value: "ovino", label: "🐑 Ovino" },
  { value: "caprino", label: "🐐 Caprino" },
  { value: "avicola", label: "🐔 Avícola" },
];

const CERT_TYPES = [
  "Brucelosis", "Tuberculosis", "Aftosa", "Carbón sintomático",
  "Rabia bovina", "IBR/DVB", "Leptospirosis",
];

interface Document {
  name: string;
  url: string;
  type: string;
}

export default function PublicarGanado() {
  const router = useRouter();
  const { createListing, loading } = useCreateLivestockListing();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    animal_type: "bovino",
    breed: "",
    units: "",
    avg_weight_kg: "",
    avg_age_years: "",
    price: "",
    price_unit: "total",
    is_certified: false,
    location_city: "",
    location_department: "",
    cover_image_url: "",
  });

  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [customCert, setCustomCert] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docInput, setDocInput] = useState({ name: "", url: "", type: "pdf" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleCert = (cert: string) => {
    setSelectedCerts(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const addCustomCert = () => {
    if (customCert.trim()) {
      setSelectedCerts(prev => [...prev, customCert.trim()]);
      setCustomCert("");
    }
  };

  const addDocument = () => {
    if (!docInput.name.trim() || !docInput.url.trim()) {
      showToast("Completa nombre y URL del documento", "error");
      return;
    }
    setDocuments(prev => [...prev, { ...docInput }]);
    setDocInput({ name: "", url: "", type: "pdf" });
  };

  const removeDocument = (i: number) => {
    setDocuments(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.animal_type || !form.units || !form.price) {
      showToast("Completa los campos obligatorios (*)", "error");
      return;
    }

    const { error } = await createListing({
      title: form.title,
      description: form.description || undefined,
      animal_type: form.animal_type,
      breed: form.breed || undefined,
      units: parseInt(form.units),
      avg_weight_kg: form.avg_weight_kg ? parseFloat(form.avg_weight_kg) : undefined,
      avg_age_years: form.avg_age_years ? parseFloat(form.avg_age_years) : undefined,
      price: parseFloat(form.price),
      price_unit: form.price_unit,
      is_certified: form.is_certified || selectedCerts.length > 0,
      health_certificates: selectedCerts,
      documents,
      location_city: form.location_city || undefined,
      location_department: form.location_department || undefined,
      cover_image_url: form.cover_image_url || undefined,
    });

    if (error) {
      if (error.message === "Not authenticated") {
        showToast("Debes iniciar sesión para publicar", "error");
        router.push("/login");
      } else {
        showToast("Error al publicar: " + error.message, "error");
      }
      return;
    }

    showToast("¡Publicación exitosa! 🐄", "success");
    router.push("/ganado");
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-400 focus:bg-white/10 transition-all";
  const labelClass = "block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5";
  const sectionStyle = { color: "#f5f0e8" };

  return (
    <>
      <TopNav title="Publicar Ganado" showBack />
      <div className="scroll-area">
        <div className="px-5 pt-4 pb-10 space-y-4">
          <p className="text-xs text-stone animate-up">
            Los campos marcados con <span className="text-amber font-bold">*</span> son obligatorios.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 animate-up d1">

            {/* Información principal */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">info</span>
                Información Principal
              </h3>
              <div>
                <label className={labelClass} style={sectionStyle}>
                  Título del anuncio <span className="text-amber">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ej: Lote Brahman Rojo 24 cab."
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
              <div>
                <label className={labelClass} style={sectionStyle}>Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe el lote, sanidad, condiciones de cría, historial..."
                  rows={3}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)", resize: "none" }}
                />
              </div>
            </Card>

            {/* Tipo y Raza */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">pets</span>
                Tipo y Raza
              </h3>
              <div>
                <label className={labelClass} style={sectionStyle}>
                  Tipo de animal <span className="text-amber">*</span>
                </label>
                <select
                  name="animal_type"
                  value={form.animal_type}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                >
                  {ANIMAL_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={sectionStyle}>Raza</label>
                <input
                  name="breed"
                  value={form.breed}
                  onChange={handleChange}
                  placeholder="Ej: Angus, Holstein, Landrace..."
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
            </Card>

            {/* Detalles del lote */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">straighten</span>
                Detalles del Lote
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={sectionStyle}>
                    Unidades (cabezas) <span className="text-amber">*</span>
                  </label>
                  <input
                    name="units" type="number" min="1" value={form.units}
                    onChange={handleChange} placeholder="Ej: 24"
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
                <div>
                  <label className={labelClass} style={sectionStyle}>Peso promedio (kg)</label>
                  <input
                    name="avg_weight_kg" type="number" min="0" value={form.avg_weight_kg}
                    onChange={handleChange} placeholder="Ej: 480"
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} style={sectionStyle}>Edad promedio (años)</label>
                <input
                  name="avg_age_years" type="number" min="0" step="0.1" value={form.avg_age_years}
                  onChange={handleChange} placeholder="Ej: 3.2"
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
            </Card>

            {/* Precio */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                Precio
              </h3>
              <div>
                <label className={labelClass} style={sectionStyle}>
                  Precio (COP) <span className="text-amber">*</span>
                </label>
                <input
                  name="price" type="number" min="0" value={form.price}
                  onChange={handleChange} placeholder="Ej: 12800000"
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
              <div>
                <label className={labelClass} style={sectionStyle}>Modalidad de precio</label>
                <select
                  name="price_unit"
                  value={form.price_unit}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                >
                  <option value="total">Precio total del lote</option>
                  <option value="per_unit">Precio por cabeza</option>
                  <option value="per_kg">Precio por kg</option>
                </select>
              </div>
            </Card>

            {/* Certificados */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">verified</span>
                Certificados Sanitarios
              </h3>
              <div className="flex items-center justify-between bg-[#f5f0e8] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-forest">✓ Animal certificado</p>
                  <p className="text-xs text-stone">Incluye registros y certificados oficiales</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox" name="is_certified"
                    checked={form.is_certified} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-forest/40 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest peer-checked:after:bg-white" />
                </label>
              </div>
              <p className="text-xs text-stone font-semibold uppercase tracking-wider">Vacunas y pruebas realizadas</p>
              <div className="flex flex-wrap gap-2">
                {CERT_TYPES.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => toggleCert(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selectedCerts.includes(c)
                        ? "bg-forest text-white border-forest"
                        : "bg-[#f5f0e8] text-forest border-forest/20 hover:border-forest/50"
                    }`}
                  >
                    {selectedCerts.includes(c) ? "✓ " : ""}{c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={customCert}
                  onChange={e => setCustomCert(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomCert())}
                  placeholder="Otro certificado..."
                  className="flex-1 border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                />
                <button type="button" onClick={addCustomCert}
                  className="px-3 py-2 bg-forest/10 rounded-xl text-forest font-semibold text-sm hover:bg-forest/20 transition-colors cursor-pointer">
                  + Añadir
                </button>
              </div>
              {selectedCerts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedCerts.map(c => (
                    <span key={c} className="flex items-center gap-1 bg-green-100 text-forest text-xs px-2 py-1 rounded-lg">
                      ✓ {c}
                      <button type="button" onClick={() => toggleCert(c)} className="text-forest/50 hover:text-forest cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Documentos */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                Documentos del Animal
              </h3>
              <p className="text-xs text-stone">Agrega URLs de documentos como carta de venta, registro ICA, etc.</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={docInput.name}
                    onChange={e => setDocInput(d => ({ ...d, name: e.target.value }))}
                    placeholder="Nombre del documento"
                    className="flex-1 border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  />
                  <select
                    value={docInput.type}
                    onChange={e => setDocInput(d => ({ ...d, type: e.target.value }))}
                    className="border border-forest/20 rounded-xl px-2 py-2 text-sm text-forest bg-[#f5f0e8] focus:outline-none focus:border-forest"
                  >
                    <option value="pdf">PDF</option>
                    <option value="img">Imagen</option>
                    <option value="doc">Word</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    value={docInput.url}
                    onChange={e => setDocInput(d => ({ ...d, url: e.target.value }))}
                    placeholder="URL del documento (https://...)"
                    className="flex-1 border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                  />
                  <button type="button" onClick={addDocument}
                    className="px-3 py-2 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-mid transition-colors cursor-pointer flex-shrink-0">
                    Añadir
                  </button>
                </div>
              </div>
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-xl">
                      <span className="material-symbols-outlined text-[18px] text-forest">
                        {doc.type === "pdf" ? "picture_as_pdf" : doc.type === "img" ? "image" : "attach_file"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest truncate">{doc.name}</p>
                        <p className="text-xs text-stone truncate">{doc.url}</p>
                      </div>
                      <button type="button" onClick={() => removeDocument(i)}
                        className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors">
                        <span className="material-symbols-outlined text-[14px] text-red-500">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Ubicación */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">location_on</span>
                Ubicación de Venta
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={sectionStyle}>Ciudad / Municipio</label>
                  <input
                    name="location_city" value={form.location_city}
                    onChange={handleChange} placeholder="Ej: Montería"
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
                <div>
                  <label className={labelClass} style={sectionStyle}>Departamento</label>
                  <input
                    name="location_department" value={form.location_department}
                    onChange={handleChange} placeholder="Ej: Córdoba"
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
              </div>
            </Card>

            {/* Imagen */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">image</span>
                Imagen del Lote
              </h3>
              <div>
                <label className={labelClass} style={sectionStyle}>URL de imagen principal</label>
                <input
                  name="cover_image_url" value={form.cover_image_url}
                  onChange={handleChange} placeholder="https://..."
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
              {form.cover_image_url && (
                <div className="rounded-xl overflow-hidden h-40">
                  <img
                    src={form.cover_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </Card>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" variant="amber-light" className="flex-1 text-forest" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Publicando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Publicar anuncio
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
