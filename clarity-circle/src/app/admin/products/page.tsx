"use client";
import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

const EMPTY_FORM = { name: "", description: "", price: "", category: "", season: "", printifyId: "" };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      season: form.season,
      printifyId: form.printifyId,
      imageURLs: [],
      stock: 0,
      isActive: true,
      tags: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await loadProducts();
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Products</h1>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />} size="sm">Add product</Button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading products…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 mx-auto mb-3 text-lavender-300" />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>No products yet</p>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Connect your Printify store and add products.</p>
          <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="w-4 h-4" />}>Add first product</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="h-24 rounded-2xl mb-3 flex items-center justify-center text-4xl" style={{ backgroundColor: "var(--bg-subtle)" }}>📦</div>
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{product.name}</p>
                <Badge variant={product.isActive ? "green" : "gray"}>{product.isActive ? "Active" : "Draft"}</Badge>
              </div>
              <p className="text-xs mb-2 line-clamp-2" style={{ color: "var(--text-muted)" }}>{product.description}</p>
              <div className="flex items-center justify-between">
                <p className="font-bold text-lavender-600">${product.price.toFixed(2)}</p>
                <Badge variant="lavender">{product.category}</Badge>
              </div>
              {product.printifyId && (
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Printify ID: {product.printifyId}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Product" size="md">
        <div className="space-y-4">
          <Input label="Product name" placeholder="e.g. Clarity Tote Bag" value={form.name} onChange={f("name")} />
          <Textarea label="Description" placeholder="Describe the product…" rows={2} value={form.description} onChange={f("description") as any} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price ($)" type="number" placeholder="24.99" value={form.price} onChange={f("price")} />
            <Input label="Category" placeholder="Apparel" value={form.category} onChange={f("category")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Season" placeholder="All Season" value={form.season} onChange={f("season")} />
            <Input label="Printify ID" placeholder="abc123" value={form.printifyId} onChange={f("printifyId")} />
          </div>
          <Button onClick={handleCreate} loading={saving} className="w-full">Add product</Button>
        </div>
      </Modal>
    </div>
  );
}
