# facturia — facturación sencilla para autónomos y pymes

SaaS de facturación por suscripción, listo para desplegar y cobrar. Crea facturas
profesionales con IVA e IRPF calculados automáticamente, numeración correlativa legal,
enlace público para el cliente y descarga en PDF.

## El producto

- **Landing** con propuesta de valor, funciones, precios y FAQ (`/`)
- **Registro y login** con sesiones firmadas y contraseñas hasheadas con bcrypt
- **Panel** con métricas: cobrado este mes, pendiente de cobro, clientes (`/panel`)
- **Clientes**: CRUD completo con NIF, email y dirección fiscal
- **Facturas**: líneas de concepto dinámicas, IVA/IRPF configurables, numeración
  correlativa automática por año (`F-2026-0001`), estados (borrador → enviada →
  pagada/vencida), notas de pago
- **Enlace público por factura** (`/f/<token>`): el cliente la ve sin registrarse y la
  descarga en PDF (impresión nativa del navegador, sin dependencias)
- **Monetización con Stripe**: checkout de suscripción, webhook de activación y portal
  de facturación para cambios/bajas
- **Límites por plan** aplicados en servidor: el plan Gratis permite 5 facturas/mes

## Modelo de negocio (objetivo: 200 000 €/mes)

| Plan | Precio | Límite |
|---|---|---|
| Gratis | 0 € | 5 facturas/mes, con marca Facturia |
| Pro | 19 €/mes | Ilimitado, sin marca |
| Negocio | 49 €/mes | Pro + equipo y exportación contable |

Las matemáticas: **200 000 €/mes ≈ 9 200 clientes Pro + 500 Negocio** (≈ 175k + 25k).
En España hay ~3,3 millones de autónomos; eso es una penetración del 0,3 %. Es un
objetivo ambicioso pero del orden correcto para este mercado. Palancas que ya trae el
producto:

1. **Bucle viral integrado**: cada factura del plan Gratis lleva la marca y el enlace
   público lleva un CTA "Crea facturas como esta gratis". Cada usuario gratuito hace
   marketing a sus propios clientes (que también facturan).
2. **Freemium con fricción real**: 5 facturas/mes se quedan cortas exactamente cuando
   el negocio del usuario va bien — el momento perfecto para pagar 19 €.
3. **SEO transaccional**: la landing está orientada a "crear factura online",
   "factura autónomo IVA IRPF", etc. Añadir páginas programáticas por nicho
   ("facturas para diseñadores", "para fontaneros"...) es el siguiente paso natural.
4. **Coste marginal ~0**: SQLite + un VPS aguantan decenas de miles de usuarios; el
   margen bruto es >95 %, así que casi todo el MRR es beneficio operativo.

Nada de esto garantiza ingresos: hace falta tráfico y ejecución comercial. Pero el
producto, el pricing y la mecánica de crecimiento están montados.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · SQLite (better-sqlite3) · Stripe.
Sin servicios externos obligatorios: `npm install && npm run dev` y funciona.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # rellena AUTH_SECRET como mínimo
npm run dev            # http://localhost:3000
```

Producción:

```bash
npm run build
npm start
```

Despliega en cualquier VPS/contenedor con disco persistente (la base de datos vive en
`./data`, configurable con `FACTURIA_DATA_DIR`). En plataformas sin disco persistente
(Vercel, etc.) monta un volumen o migra `lib/db.ts` a Postgres — el resto del código no
cambia.

## Activar cobros (Stripe)

1. Crea dos productos con precio recurrente mensual en el dashboard de Stripe:
   Pro (19 €/mes) y Negocio (49 €/mes).
2. Copia `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO` y `STRIPE_PRICE_NEGOCIO` al `.env`.
3. Crea un webhook hacia `https://tudominio.com/api/stripe/webhook` con los eventos
   `checkout.session.completed` y `customer.subscription.deleted`, y copia su secreto
   a `STRIPE_WEBHOOK_SECRET`.
4. Define `APP_URL=https://tudominio.com`.

Sin estas variables la app funciona igual (plan Gratis); la página de ajustes lo avisa.

## Estructura

```
app/
  page.tsx                 # landing + precios
  (auth)/login, registro   # autenticación
  panel/                   # dashboard, facturas, clientes, ajustes
  f/[token]/               # vista pública de factura (PDF)
  api/stripe/              # checkout, portal, webhook
components/                # formularios y documento de factura
lib/
  db.ts                    # esquema SQLite y acceso a datos
  auth.ts                  # sesiones HMAC + bcrypt
  actions.ts               # server actions (CRUD completo)
  plans.ts                 # planes y límites
  stripe.ts, format.ts
```
