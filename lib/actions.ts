"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getDb, Client, Invoice } from "./db";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "./auth";
import { invoiceLimitFor } from "./plans";

// ---------- Auth ----------

export async function registerAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) return { error: "Todos los campos son obligatorios." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email no válido." };

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return { error: "Ya existe una cuenta con ese email." };

  const hash = await hashPassword(password);
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name, business_name) VALUES (?, ?, ?, ?)")
    .run(email, hash, name, name);

  await setSessionCookie(Number(result.lastInsertRowid));
  redirect("/panel");
}

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | { id: number; password_hash: string }
    | undefined;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Email o contraseña incorrectos." };
  }

  await setSessionCookie(user.id);
  redirect("/panel");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// ---------- Clientes ----------

export async function createClientAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  getDb()
    .prepare("INSERT INTO clients (user_id, name, nif, email, address) VALUES (?, ?, ?, ?, ?)")
    .run(
      user.id,
      name,
      String(formData.get("nif") || "").trim() || null,
      String(formData.get("email") || "").trim() || null,
      String(formData.get("address") || "").trim() || null
    );

  revalidatePath("/panel/clientes");
  redirect("/panel/clientes");
}

export async function updateClientAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  getDb()
    .prepare(
      "UPDATE clients SET name = ?, nif = ?, email = ?, address = ? WHERE id = ? AND user_id = ?"
    )
    .run(
      name,
      String(formData.get("nif") || "").trim() || null,
      String(formData.get("email") || "").trim() || null,
      String(formData.get("address") || "").trim() || null,
      id,
      user.id
    );

  revalidatePath("/panel/clientes");
  redirect("/panel/clientes");
}

export async function deleteClientAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const db = getDb();
  const hasInvoices = db
    .prepare("SELECT id FROM invoices WHERE client_id = ? AND user_id = ? LIMIT 1")
    .get(id, user.id);
  if (!hasInvoices) {
    db.prepare("DELETE FROM clients WHERE id = ? AND user_id = ?").run(id, user.id);
  }
  revalidatePath("/panel/clientes");
}

// ---------- Facturas ----------

function invoicesThisMonth(userId: number): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM invoices WHERE user_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"
    )
    .get(userId) as { n: number };
  return row.n;
}

function nextInvoiceNumber(userId: number, prefix: string): string {
  const year = new Date().getFullYear();
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM invoices WHERE user_id = ? AND number LIKE ?")
    .get(userId, `${prefix}-${year}-%`) as { n: number };
  return `${prefix}-${year}-${String(row.n + 1).padStart(4, "0")}`;
}

export async function createInvoiceAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await requireUser();
  const db = getDb();

  const limit = invoiceLimitFor(user.plan);
  if (limit !== null && invoicesThisMonth(user.id) >= limit) {
    return {
      error: `Has alcanzado el límite de ${limit} facturas este mes del plan Gratis. Pásate a Pro para facturar sin límites.`,
    };
  }

  const clientId = Number(formData.get("client_id"));
  const client = db
    .prepare("SELECT id FROM clients WHERE id = ? AND user_id = ?")
    .get(clientId, user.id);
  if (!client) return { error: "Selecciona un cliente válido." };

  const itemsRaw = String(formData.get("items_json") || "[]");
  let items: { description: string; quantity: number; unit_price: number }[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Conceptos no válidos." };
  }
  items = items.filter((it) => it.description.trim() !== "");
  if (items.length === 0) return { error: "Añade al menos un concepto." };

  const issueDate = String(formData.get("issue_date") || "").slice(0, 10);
  const dueDate = String(formData.get("due_date") || "").slice(0, 10) || null;
  const ivaPct = Math.max(0, Number(formData.get("iva_pct") || 0));
  const irpfPct = Math.max(0, Number(formData.get("irpf_pct") || 0));
  const notes = String(formData.get("notes") || "").trim() || null;

  const number = nextInvoiceNumber(user.id, user.invoice_prefix || "F");
  const shareToken = randomBytes(16).toString("hex");

  let invoiceId = 0;
  db.transaction(() => {
    const res = db
      .prepare(
        `INSERT INTO invoices (user_id, client_id, number, status, issue_date, due_date, iva_pct, irpf_pct, notes, share_token)
         VALUES (?, ?, ?, 'borrador', ?, ?, ?, ?, ?, ?)`
      )
      .run(user.id, clientId, number, issueDate, dueDate, ivaPct, irpfPct, notes, shareToken);
    invoiceId = Number(res.lastInsertRowid);
    const insertItem = db.prepare(
      "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, position) VALUES (?, ?, ?, ?, ?)"
    );
    items.forEach((it, i) =>
      insertItem.run(invoiceId, it.description.trim(), it.quantity || 1, it.unit_price || 0, i)
    );
  })();

  revalidatePath("/panel/facturas");
  redirect(`/panel/facturas/${invoiceId}`);
}

export async function setInvoiceStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["borrador", "enviada", "pagada", "vencida"].includes(status)) return;
  getDb()
    .prepare("UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?")
    .run(status, id, user.id);
  revalidatePath(`/panel/facturas/${id}`);
  revalidatePath("/panel/facturas");
  revalidatePath("/panel");
}

export async function deleteInvoiceAction(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  getDb().prepare("DELETE FROM invoices WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/panel/facturas");
  redirect("/panel/facturas");
}

// ---------- Ajustes ----------

export async function updateSettingsAction(
  _prev: { error?: string; ok?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const user = await requireUser();
  const prefix = String(formData.get("invoice_prefix") || "F")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  getDb()
    .prepare(
      `UPDATE users SET business_name = ?, business_nif = ?, business_address = ?,
       business_email = ?, business_phone = ?, invoice_prefix = ?, default_iva = ?, default_irpf = ?
       WHERE id = ?`
    )
    .run(
      String(formData.get("business_name") || "").trim() || null,
      String(formData.get("business_nif") || "").trim() || null,
      String(formData.get("business_address") || "").trim() || null,
      String(formData.get("business_email") || "").trim() || null,
      String(formData.get("business_phone") || "").trim() || null,
      prefix || "F",
      Math.max(0, Number(formData.get("default_iva") || 21)),
      Math.max(0, Number(formData.get("default_irpf") || 0)),
      user.id
    );

  revalidatePath("/panel/ajustes");
  return { ok: true };
}

// ---------- Datos para páginas ----------

export async function getClientsFor(userId: number): Promise<Client[]> {
  return getDb()
    .prepare("SELECT * FROM clients WHERE user_id = ? ORDER BY name COLLATE NOCASE")
    .all(userId) as Client[];
}

export async function getInvoicesFor(userId: number): Promise<(Invoice & { client_name: string })[]> {
  return getDb()
    .prepare(
      `SELECT i.*, c.name AS client_name FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ? ORDER BY i.created_at DESC, i.id DESC`
    )
    .all(userId) as (Invoice & { client_name: string })[];
}
