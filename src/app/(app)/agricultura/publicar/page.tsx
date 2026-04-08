"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/navigation/TopNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/ToastProvider";
import { useCreateAgricultureListing } from "@/hooks/useListings";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "tubérculos", label: "🥔 Tubérculos" },
  { value: "vegetales", label: "🥬 Vegetales" },
  { value: "frutas", label: "🍎 Frutas" },
  { value: "cereales", label: "🌾 Cereales" },
];

const SALE_UNITS = [
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "unidad", label: "Por Unidad" },
  { value: "bulto", label: "Por Bulto" },
  { value: "tonelada", label: "Por Tonelada" },
];

const CERT_TYPES = [
  "BPA (Buenas Prácticas Agrícolas)", "Certificado de Producción Orgánica", 
  "Certificado ICA", "Global GAP", "Rainforest Alliance"
];

interface Document {
  name: string;
  url: string;
  type: string;
}

export default function PublicarAgricultura() {
  const router = useRouter();
  const { createListing, loading } = useCreateAgricultureListing();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "vegetales",
    variety: "",
    units_available: "",
    sale_unit: "kg",
    price: "",
    price_unit: "total",
    is_organic: false,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!docInput.name.trim()) {
      showToast("Ingresa un nombre para el documento antes de subir el archivo", "error");
      return;
    }
    
    let docType = "otro";
    if (file.name.toLowerCase().endsWith('.pdf')) docType = "pdf";
    else if (file.name.toLowerCase().match(/\.(doc|docx)$/)) docType = "doc";
    else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)) docType = "img";
    else docType = docInput.type;

    try {
      // Using globally imported supabase
      const fileName = `public/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data, error } = await supabase.storage.from('documents').upload(fileName, file);
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(data.path);
      
      setDocuments(prev => [...prev, {
        name: docInput.name,
        url: urlData.publicUrl,
        type: docType
      }]);
      setDocInput({ name: "", url: "", type: "pdf" });
      showToast("Documento subido exitosamente", "success");
    } catch (err: any) {
      showToast("Error al subir archivo: " + err.message, "error");
    } finally {
      e.target.value = '';
    }
  };

  const removeDocument = (i: number) => {
    setDocuments(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.units_available || !form.price || !form.sale_unit) {
      showToast("Completa los campos obligatorios (*)", "error");
      return;
    }

    const { error } = await createListing({
      title: form.title,
      description: form.description || undefined,
      category: form.category,
      variety: form.variety || undefined,
      units_available: parseFloat(form.units_available),
      sale_unit: form.sale_unit,
      price: parseFloat(form.price),
      price_unit: form.price_unit,
      is_organic: form.is_organic || selectedCerts.includes("Certificado de Producción Orgánica"),
      certifications: selectedCerts,
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

    showToast("¡Publicación exitosa! 🌱", "success");
    router.push("/agricultura");
  };

  const inputClass =
    "w-full bg-[#f5f0e8] border border-forest/20 rounded-xl px-4 py-3 text-[#002d1c] placeholder:text-[#002d1c] placeholder:opacity-60 text-sm focus:outline-none focus:border-forest transition-all";
  const labelClass = "block text-xs font-semibold text-forest uppercase tracking-wider mb-1.5";

  return (
    <>
      <TopNav title="Publicar Producto Agrícola" showBack />
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
                <label className={labelClass}>
                  Título del anuncio <span className="text-amber">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                 
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                 
                  rows={3}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)", resize: "none" }}
                />
              </div>
            </Card>

            {/* Tipo y Variedad */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">grass</span>
                Tipo y Variedad
              </h3>
              <div>
                <label className={labelClass}>
                  Tipo de producto <span className="text-amber">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                >
                  {CATEGORIES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Variedad</label>
                <input
                  name="variety"
                  value={form.variety}
                  onChange={handleChange}
                 
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
            </Card>

            {/* Detalles de la venta */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">inventory</span>
                Detalles de Venta
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Cantidad <span className="text-amber">*</span>
                  </label>
                  <input
                    name="units_available" type="number" min="0" step="0.1" value={form.units_available}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Unidad de Venta <span className="text-amber">*</span>
                  </label>
                  <select
                    name="sale_unit"
                    value={form.sale_unit}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  >
                    {SALE_UNITS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Precio */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">payments</span>
                Precio
              </h3>
              <div>
                <label className={labelClass}>
                  Precio (COP) <span className="text-amber">*</span>
                </label>
                <input
                  name="price" type="number" min="0" value={form.price}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                />
              </div>
              <div>
                <label className={labelClass}>Modalidad de precio</label>
                <select
                  name="price_unit"
                  value={form.price_unit}
                  onChange={handleChange}
                  className={inputClass}
                  style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                >
                  <option value="total">Precio total</option>
                  <option value="per_unit_measure">Precio por unidad de medida (ej. por kg)</option>
                </select>
              </div>
            </Card>

            {/* Certificacioens y Organico */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">eco</span>
                Certificaciones
              </h3>
              <div className="flex items-center justify-between bg-[#f5f0e8] rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-forest">🌱 Producto Orgánico</p>
                  <p className="text-xs text-stone">Cultivado sin químicos sintéticos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                     name="is_organic" type="checkbox"
                    checked={form.is_organic} onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-forest/40 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest peer-checked:after:bg-white" />
                </label>
              </div>

              <p className="text-xs text-stone font-semibold uppercase tracking-wider">Certificados seleccionados</p>
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
                 
                  className="flex-1 border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                />
                <button type="button" onClick={addCustomCert}
                  className="px-3 py-2 bg-forest/10 rounded-xl text-forest font-semibold text-sm hover:bg-forest/20 transition-colors cursor-pointer">
                  + Añadir
                </button>
              </div>
            </Card>

            {/* Documentos */}
            <Card className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-forest flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                Documentos
              </h3>
              <p className="text-xs text-stone">Agrega URLs de documentos como certificados, etc.</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={docInput.name}
                    onChange={e => setDocInput(d => ({ ...d, name: e.target.value }))}
                   
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
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={docInput.url}
                      onChange={e => setDocInput(d => ({ ...d, url: e.target.value }))}
                     
                      className="flex-1 border border-forest/20 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-forest bg-[#f5f0e8]"
                    />
                    <button type="button" onClick={addDocument}
                      className="px-3 py-2 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-forest-mid transition-colors cursor-pointer flex-shrink-0">
                      Añadir URL
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-stone font-semibold mx-2">O SUBE UN ARCHIVO LOCAL:</span>
                    <input
                      type="file"
                      id="docFileAgro"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="docFileAgro" className="flex items-center gap-1 px-3 py-2 bg-forest-mid text-white rounded-xl text-sm font-semibold hover:bg-forest transition-colors cursor-pointer flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px]">upload_file</span> Subir archivo
                    </label>
                  </div>
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
                Ubicación de Cosecha / Venta
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Ciudad / Municipio</label>
                  <input
                    name="location_city" value={form.location_city}
                    onChange={handleChange}
                    className={inputClass}
                    style={{ color: "#002d1c", background: "#f5f0e8", borderColor: "rgba(0,45,28,0.15)" }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Departamento</label>
                  <input
                    name="location_department" value={form.location_department}
                    onChange={handleChange}
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
                Imagen del Producto
              </h3>
              <div>
                <label className={labelClass}>URL de imagen principal</label>
                <input
                  name="cover_image_url" value={form.cover_image_url}
                  onChange={handleChange}
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
