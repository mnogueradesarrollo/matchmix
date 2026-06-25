import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Determinar si Firebase está configurado
export const USE_LOCAL_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

let app;
let db;
let auth;

if (!USE_LOCAL_MOCK) {
  try {
    app = initializeApp(firebaseConfig);
    // Configurar Firestore con detección automática de Long-Polling para evitar ERR_QUIC_PROTOCOL_ERROR
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true,
    });
    auth = getAuth(app);
    console.log("🔥 Firebase inicializado correctamente (Long Polling activo).");
  } catch (error) {
    console.error("❌ Error al inicializar Firebase. Usando Mock local.", error);
  }
} else {
  console.log("⚡ Ejecutando MatchMix en Modo Local (Mock Storage).");
}

export { db, auth };
