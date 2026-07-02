"use client";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, ShoppingCart, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { getActiveProducts } from "@/lib/firebase/products";
import { formatPoints } from "@/lib/utils/format";
import type { Product } from "@/lib/types";

type StoreProduct = Pick<Product, "id" | "name" | "description" | "price" | "imageURLs" | "category" | "season"> & {
  rating?: number;
  reviews?: number;
};

const DEMO_PRODUCTS: StoreProduct[] = [
  { id: "demo_1", name: "Clarity Affirmation Tote", description: "A daily reminder for steady growth.", price: 24.99, imageURLs: [], category: "Accessories", season: "All Season", rating: 4.8, reviews: 142 },
  { id: "demo_2", name: "Growth Journal Notebook", description: "A guided place for reflections and goals.", price: 18.99, imageURLs: [], category: "Stationery", season: "All Season", rating: 4.9, reviews: 287 },
  { id: "demo_3", name: "Bloom & Thrive Mug", description: "For calm starts and thoughtful resets.", price: 19.99, imageURLs: [], category: "Home", season: "All Season", rating: 4.7, reviews: 98 },
  { id: "demo_4", name: "Lavender Comfort Hoodie", description: "Soft apparel for reset days.", price: 49.99, imageURLs: [], category: "Apparel", season: "Winter", rating: 4.9, reviews: 321 },
  { id: "demo_5", name: "Clarity Circle Pin Set", description: "Small badges for big progress.", price: 12.99, imageURLs: [], category: "Accessories", season: "All Season", rating: 4.6, reviews: 56 },
  { id: "demo_6", name: "She's That Girl Tee", description: "A confidence tee for the work in progress.", price: 34.99, imageURLs: [], category: "Apparel", season: "Summer", rating: 4.8, reviews: 193 },
];

export default function StorePage() {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const realProducts = await getActiveProducts();
      setProducts(realProducts.length > 0 ? realProducts : DEMO_PRODUCTS);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const addToCart = (id: string) => setCart((c) => [...c, id]);
  const cartCount = cart.length;

  return (
    <div className="section-container py-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>The Shop</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Wear your growth.</p>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ backgroundColor: "var(--bg-subtle)" }}>
              <span className="text-amber-500">*</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{formatPoints(profile.points)} pts</span>
            </div>
          )}
          <button className="relative btn-secondary p-2.5 rounded-2xl">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blossom-500 text-white text-xs flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {profile && profile.points >= 5000 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            You have enough points for a <strong>$5 store discount!</strong> Applied at checkout.
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-lavender-500 text-white shadow-soft"
                : "btn-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <Card key={i} className="h-72 animate-pulse"><span className="sr-only">Loading product</span></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <Card key={product.id} className="group overflow-hidden p-0">
              <div className="h-40 flex items-center justify-center transition-transform group-hover:scale-105" style={{ backgroundColor: "var(--bg-subtle)" }}>
                {product.imageURLs[0]
                  ? <img src={product.imageURLs[0]} alt={product.name} className="h-full w-full object-cover" />
                  : <ShoppingBag className="w-12 h-12 text-lavender-300" />}
              </div>
              <div className="p-4 space-y-2">
                <Badge variant="lavender">{product.category}</Badge>
                <p className="font-semibold text-sm leading-snug" style={{ color: "var(--text-primary)" }}>{product.name}</p>
                <p className="text-xs line-clamp-2" style={{ color: "var(--text-muted)" }}>{product.description}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  <span className="text-xs font-medium text-amber-600">{product.rating ?? 4.8}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>({product.reviews ?? 0})</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lavender-600">${product.price.toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addToCart(product.id)}
                    leftIcon={<ShoppingBag className="w-3 h-3" />}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        All products are print-on-demand via Printify. Ships in 5-10 business days.
      </p>
    </div>
  );
}
