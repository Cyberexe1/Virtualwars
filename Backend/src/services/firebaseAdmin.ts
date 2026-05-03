import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialise Firebase Admin SDK once (singleton guard)
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required');
  }

  try {
    // Use service account key file if provided, otherwise fall back to
    // Application Default Credentials (ADC) for Cloud environments
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (credPath) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(credPath.startsWith('.')
        ? `${process.cwd()}/${credPath}`
        : credPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
    }

    console.log(`[Firebase Admin] Initialised for project: ${projectId}`);
  } catch (err) {
    console.error('[Firebase Admin] Initialisation failed:', err);
    throw err;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

// Configure Firestore settings
adminDb.settings({ ignoreUndefinedProperties: true });
