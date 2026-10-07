import fs from 'node:fs';

/**
 * NELSON SHOES — ADMIN USER PROVISIONING SCRIPT
 * With automatic clock-skew compensation for Google OAuth2
 */

async function autoSyncClock() {
  try {
    const res = await fetch('https://www.google.com');
    const headerDate = res.headers.get('date');
    if (headerDate) {
      const serverTime = new Date(headerDate).getTime();
      const localTime = Date.now();
      const skew = localTime - serverTime;
      if (Math.abs(skew) > 30000) { // If skewed by > 30 seconds
        console.log(`⏱️ Calibrating clock skew (${Math.round(skew / 1000 / 60)} minutes detected)...`);
        const origNow = Date.now;
        Date.now = function() { return origNow() - skew; };
        const OrigDate = Date;
        global.Date = class extends OrigDate {
          constructor(...args) {
            if (args.length === 0) {
              super(origNow() - skew);
            } else {
              super(...args);
            }
          }
          static now() {
            return origNow() - skew;
          }
        };
      }
    }
  } catch (err) {
    // If offline, continue without skew adjustment
  }
}

async function run() {
  await autoSyncClock();

  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  const targetIdentifier = process.argv[2] || 'admin@nelsonshoes.com';
  const targetRole = process.argv[3] || 'master_artisan';

  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf-8'));
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else if (fs.existsSync('./service-account.json')) {
    serviceAccount = JSON.parse(fs.readFileSync('./service-account.json', 'utf-8'));
  }

  if (!serviceAccount) {
    console.error(`❌ Firebase Admin Service Account credentials not found.`);
    process.exit(1);
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth(app);

  let userRecord;
  try {
    if (targetIdentifier.includes('@')) {
      userRecord = await auth.getUserByEmail(targetIdentifier.trim());
    } else {
      userRecord = await auth.getUser(targetIdentifier.trim());
    }
  } catch (err) {
    console.error(`❌ User lookup error:`, err?.message || err);
    process.exit(1);
  }

  const claims = {
    admin: true,
    role: targetRole,
  };

  await auth.setCustomUserClaims(userRecord.uid, claims);

  console.log(`
=============================================================
✨ SUCCESS! MASTER ARTISAN CLAIMS APPLIED
=============================================================
   UID:     ${userRecord.uid}
   Email:   ${userRecord.email}
   Role:    ${targetRole}
   Claims:  ${JSON.stringify(claims)}

The user ${userRecord.email} is now fully provisioned as a Master Artisan!
You can now sign in at https://nelson-shoes.vercel.app/admin with this account.
=============================================================
`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
