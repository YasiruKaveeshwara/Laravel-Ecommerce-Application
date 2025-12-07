"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewProduct() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Pulse");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Choose an image");
    const form = new FormData();
    form.append("name", name);
    form.append("brand", brand);
    form.append("price", price);
    form.append("description", description);
    form.append("image", file);
    try {
      await api("/admin/products", { method: "POST", isForm: true, body: form });
      router.push("/admin/products");
    } catch (e: unknown) {
      alert(e.message);
    }
  };

  return (
    <div className='max-w-lg'>
      <h1 className='text-2xl font-semibold mb-4'>New Product</h1>
      <form className='space-y-3' onSubmit={onSubmit}>
        <Input placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder='Brand' value={brand} onChange={(e) => setBrand(e.target.value)} />
        <Input placeholder='Price' type='number' step='0.01' value={price} onChange={(e) => setPrice(e.target.value)} />
        <Input placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input type='file' accept='image/*' onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button type='submit'>Create</Button>
      </form>
    </div>
  );
}
