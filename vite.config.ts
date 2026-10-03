import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const SEED_ORDERS_DATA = [
  {
    orderNumber: "NS-ORD-882190",
    customer: {
      email: "adebayo.adeleke@gmail.com",
      phoneWhatsApp: "+234 803 555 0192",
      city: "Lagos",
      country: "Nigeria"
    },
    status: "At Workbench (Lasting)",
    trackingNumber: "DHL-99418290",
    items: [
      {
        product: { name: "The Sovereign Wholecut", primaryImage: "/images/hero-bespoke-oxford.jpg" },
        size: 42,
        quantity: 1,
        isBespokeFitting: true
      }
    ]
  },
  {
    orderNumber: "NS-ORD-449120",
    customer: {
      email: "femi.olatunji@hospital.ng",
      phoneWhatsApp: "+234 802 111 8839",
      city: "Abuja",
      country: "Nigeria"
    },
    status: "Delivered",
    trackingNumber: "DHL-88129031",
    items: [
      {
        product: { name: "The Èkó Tassel Loafer", primaryImage: "/images/product-tassel-loafer.jpg" },
        size: 44,
        quantity: 1,
        isBespokeFitting: false
      }
    ]
  }
];

const STAGES = [
  { status: 'Pending Confirmation', label: 'Commission Initiated', description: 'Bespoke dossier received and confirmed by atelier concierge.', percent: 15 },
  { status: 'At Workbench (Lasting)', label: 'Last Selected & Leather Cut', description: 'Beechwood anatomical last chosen; box calfskin hand-clicked.', percent: 35 },
  { status: 'Welt Inseam Stitching', label: 'Upper Stitched & Welting', description: 'Goodyear / Hand-welted inseam stitching secured to insole.', percent: 55 },
  { status: 'Patina & Glacage', label: 'Hand-Burnished Patina & Glacage', description: 'Multi-layer artisanal dyeing, beeswax nourishment, and mirror finish.', percent: 75 },
  { status: 'Quality Inspection', label: 'Master Quality Inspection', description: 'Rigorous structural assessment and cordwainer certification.', percent: 90 },
  { status: 'Dispatched', label: 'Dispatched via DHL Express', description: 'Insured international transit with climate-shield packaging.', percent: 98 },
  { status: 'Delivered', label: 'Delivered to Client', description: 'Commission safely received. Lifetime atelier care active.', percent: 100 }
];

function orderTrackingApiPlugin(): Plugin {
  return {
    name: 'order-tracking-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/verify-order', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
        req.on('end', () => {
          let body: { orderReference?: string; email?: string; phone?: string } = {};
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          } catch {
            body = {};
          }

          const cleanRef = (body.orderReference || '').trim();
          const cleanEmail = (body.email || '').trim().toLowerCase();
          const cleanPhone = (body.phone || '').replace(/[\s\-\(\)\.]/g, '');

          if (!cleanRef || (!cleanEmail && !cleanPhone)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing required order reference or customer contact identifier.' }));
            return;
          }

          const match = SEED_ORDERS_DATA.find(o => o.orderNumber.toUpperCase() === cleanRef.toUpperCase());
          const GENERIC_ERROR = "We couldn't verify those order details. Please check your Order Reference and contact information and try again.";

          if (!match) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: GENERIC_ERROR }));
            return;
          }

          const storedEmail = match.customer.email.toLowerCase();
          const storedPhone = match.customer.phoneWhatsApp.replace(/[\s\-\(\)\.]/g, '');

          let verified = false;
          if (cleanEmail && cleanEmail === storedEmail) {
            verified = true;
          } else if (cleanPhone) {
            const digitsInput = cleanPhone.replace(/^\+/, '').replace(/^00/, '');
            const digitsStored = storedPhone.replace(/^\+/, '').replace(/^00/, '');
            if (digitsInput === digitsStored || (digitsInput.length >= 10 && digitsStored.length >= 10 && digitsInput.slice(-10) === digitsStored.slice(-10))) {
              verified = true;
            }
          }

          if (!verified) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: GENERIC_ERROR }));
            return;
          }

          const currentIdx = STAGES.findIndex(s => s.status === match.status);
          const activeIdx = currentIdx >= 0 ? currentIdx : 0;
          const currentStage = STAGES[activeIdx];

          const sanitized = {
            orderReference: match.orderNumber,
            status: match.status,
            statusLabel: currentStage.label,
            timeline: STAGES.map((s, idx) => ({
              status: s.status,
              label: s.label,
              description: s.description,
              completed: idx <= activeIdx,
              current: idx === activeIdx
            })),
            progressPercent: currentStage.percent,
            trackingNumber: match.trackingNumber,
            carrier: match.trackingNumber ? 'DHL Express' : null,
            destinationCity: `${match.customer.city}, ${match.customer.country}`,
            items: match.items.map(i => ({
              productName: i.product.name,
              primaryImage: i.product.primaryImage,
              size: i.size,
              quantity: i.quantity,
              isBespokeFitting: i.isBespokeFitting
            })),
            verifiedAt: new Date().toISOString()
          };

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: sanitized }));
        });
      });

      server.middlewares.use('/api/claim-order', (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
          return;
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Authentication required. Please sign in.' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', chunk => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
        req.on('end', () => {
          let body: { orderReference?: string; email?: string; phone?: string } = {};
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          } catch {
            body = {};
          }

          const cleanRef = (body.orderReference || '').replace(/^#/, '').trim().toUpperCase();
          const cleanEmail = (body.email || '').trim().toLowerCase();
          const cleanPhone = (body.phone || '').replace(/[\s\-\(\)\.]/g, '');

          if (!cleanRef || (!cleanEmail && !cleanPhone)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Missing required order reference or customer contact identifier.' }));
            return;
          }

          const match = SEED_ORDERS_DATA.find(o => o.orderNumber.toUpperCase() === cleanRef);
          if (!match) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'No order matching this reference was found.' }));
            return;
          }

          const storedEmail = match.customer.email.toLowerCase();
          const storedPhone = match.customer.phoneWhatsApp.replace(/[\s\-\(\)\.]/g, '');

          let verified = false;
          if (cleanEmail && cleanEmail === storedEmail) {
            verified = true;
          } else if (cleanPhone) {
            const digitsInput = cleanPhone.replace(/^\+/, '').replace(/^00/, '');
            const digitsStored = storedPhone.replace(/^\+/, '').replace(/^00/, '');
            if (digitsInput === digitsStored || (digitsInput.length >= 10 && digitsStored.length >= 10 && digitsInput.slice(-10) === digitsStored.slice(-10))) {
              verified = true;
            }
          }

          if (!verified) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'The email address or phone number provided does not match the contact details on file for this order.' }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            message: 'Order successfully linked to your customer account.',
            order: {
              id: `ord-${cleanRef.toLowerCase()}`,
              orderNumber: match.orderNumber,
              status: match.status,
              createdAt: new Date().toISOString()
            }
          }));
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), orderTrackingApiPlugin()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
})
