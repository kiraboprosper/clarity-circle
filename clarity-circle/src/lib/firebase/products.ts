import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { Order, OrderItem, Product, ShippingAddress } from "../types";

export async function getActiveProducts(): Promise<Product[]> {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export async function createOrder(
  userId: string,
  items: OrderItem[],
  shippingAddress: ShippingAddress,
  pointsUsed = 0
): Promise<string> {
  const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const discountApplied = pointsUsed >= 5000 ? 5 : 0;
  const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), {
    userId,
    items,
    total: Math.max(0, subtotal - discountApplied),
    discountApplied,
    pointsUsed,
    status: "pending",
    shippingAddress,
    printifyOrderId: null,
    createdAt: serverTimestamp(),
  } satisfies Omit<Order, "id" | "createdAt"> & { createdAt: unknown });

  if (pointsUsed > 0) {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      points: increment(-pointsUsed),
    });
  }

  return ref.id;
}
