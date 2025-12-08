"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, ShieldCheck, BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BRAND_PRESETS = ["Pulse", "Galaxy", "iPhone", "Pixel", "OnePlus", "Nothing"];
const CATEGORY_OPTIONS = [
  { value: "flagship", label: "Flagship" },
  { value: "foldables", label: "Foldable" },
  { value: "midrange", label: "Mid-range" },
  { value: "budget", label: "Budget" },
];

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    brand: "Pulse",
    category: "flagship",
    price: "899",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const featureHighlights = useMemo(
    () => [
      { icon: ShieldCheck, title: "Warranty", text: "2-year Pulse Shield extended coverage." },
      { icon: Sparkles, title: "AI Ready", text: "Optimized for Nova OS AI co-pilot features." },
      { icon: BadgeCheck, title: "Verified", text: "Meets retailer QA checklist for shipping." },
    ],
    []
  );

  const updateField =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      return alert("Upload at least one product photo");
    }
    setLoading(true);
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("brand", form.brand);
    payload.append("category", form.category);
    payload.append("price", form.price);
    payload.append("description", form.description);
    payload.append("image", file);

    try {
      await api("/admin/products", { method: "POST", isForm: true, body: payload });
      router.push("/admin/products");
    } catch (error: any) {
      alert(error?.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-8'>
      <div className='rounded-3xl border border-border bg-white/70 p-6 shadow-card backdrop-blur'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-500'>Admin Studio</p>
            <h1 className='text-3xl font-semibold text-slate-900'>Create a device listing</h1>
            <p className='text-sm text-muted'>Upload assets, set pricing, and publish instantly to the storefront.</p>
          </div>
          <div className='flex gap-3 text-xs text-muted'>
            <div className='rounded-2xl bg-sky-50 px-4 py-3 text-center'>
              <p className='text-slate-500'>Avg. fulfillment</p>
              <p className='text-lg font-semibold text-sky-600'>2.3 days</p>
            </div>
            <div className='rounded-2xl bg-emerald-50 px-4 py-3 text-center'>
              <p className='text-slate-500'>Inventory health</p>
              <p className='text-lg font-semibold text-emerald-600'>Stable</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className='grid gap-6 lg:grid-cols-[2fr,1fr]'>
        <div className='space-y-6'>
          <section className='rounded-3xl border border-border bg-white/70 p-6 shadow-card backdrop-blur'>
            <h2 className='text-lg font-semibold text-slate-900'>Product details</h2>
            <p className='text-sm text-muted'>Tell shoppers what makes this release special.</p>
            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>Model name</label>
                <Input value={form.name} onChange={updateField("name")} placeholder='e.g., Nova X Ultra 1TB' required />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>Brand</label>
                <div className='flex gap-2'>
                  <Input value={form.brand} onChange={updateField("brand")} className='flex-1' required />
                </div>
                <div className='flex flex-wrap gap-2 text-xs text-muted'>
                  {BRAND_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type='button'
                      onClick={() => setForm((prev) => ({ ...prev, brand: preset }))}
                      className={cn(
                        "rounded-full border px-3 py-1",
                        form.brand === preset ? "border-sky-500 bg-sky-50 text-sky-600" : "border-border"
                      )}>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>Category</label>
                <select
                  value={form.category}
                  onChange={updateField("category")}
                  className='rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>Price (USD)</label>
                <Input type='number' min='0' step='0.01' value={form.price} onChange={updateField("price")} required />
              </div>
            </div>

            <div className='mt-4 space-y-2'>
              <label className='text-sm font-medium text-slate-700'>Description</label>
              <textarea
                value={form.description}
                onChange={updateField("description")}
                rows={5}
                className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'
                placeholder='Summarize display, camera, chipset, and accessory highlights.'
              />
            </div>
          </section>

          <section className='rounded-3xl border border-dashed border-sky-200 bg-white/80 p-6 text-center shadow-card'>
            <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600'>
              <Upload className='h-8 w-8' />
            </div>
            <p className='mt-4 text-lg font-semibold text-slate-900'>Gallery upload</p>
            <p className='text-sm text-muted'>Drag & drop hero art (recommended 1600 x 1200, JPG/PNG).</p>
            {preview && (
              <img src={preview} alt='Preview' className='mx-auto mt-4 h-64 w-full max-w-xl rounded-3xl object-cover' />
            )}
            <div className='mt-4 flex flex-col items-center gap-3'>
              <Input type='file' accept='image/*' onChange={onFileChange} />
              <p className='text-xs text-muted'>Max 5MB. Watermarking handled automatically.</p>
            </div>
          </section>
        </div>

        <aside className='space-y-6'>
          <div className='rounded-3xl border border-border bg-white/80 p-6 shadow-card'>
            <h3 className='text-base font-semibold text-slate-900'>Launch checklist</h3>
            <p className='text-xs text-muted'>Everything your merchandising team reviews before pushing live.</p>
            <ul className='mt-4 space-y-3'>
              {featureHighlights.map(({ icon: Icon, title, text }) => (
                <li key={title} className='flex gap-3 rounded-2xl border border-border/80 p-3'>
                  <div className='rounded-2xl bg-slate-50 p-2 text-sky-600'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-slate-900'>{title}</p>
                    <p className='text-xs text-muted'>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
            <h3 className='text-base font-semibold text-slate-900'>Publish</h3>
            <p className='text-xs text-muted'>Save as soon as the essentials are filled.</p>
            <div className='mt-4 space-y-3 text-sm text-muted'>
              <p>• Brand, category, and hero asset are required.</p>
              <p>• Pricing syncs with storefront instantly.</p>
              <p>• You can edit/delete from the inventory tab.</p>
            </div>
            <Button type='submit' disabled={loading} className='mt-4 w-full'>
              {loading ? "Publishing..." : "Publish device"}
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='mt-2 w-full'
              onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
