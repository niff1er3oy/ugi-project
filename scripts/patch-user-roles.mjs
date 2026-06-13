/**
 * One-off script: adds role:"officer" to every users/{uid} doc that has no role.
 * Run with: node scripts/patch-user-roles.mjs
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

// Parse .env.local manually
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim().replace(/^"|"$/g, "");
      return [key, val];
    })
);

initializeApp({
  credential: cert({
    projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore();

const snap = await db.collection("users").get();
let patched = 0;

for (const doc of snap.docs) {
  if (!doc.data().role) {
    await doc.ref.update({ role: "officer" });
    console.log(`Patched ${doc.id}`);
    patched++;
  } else {
    console.log(`Skipped ${doc.id} (already has role: "${doc.data().role}")`);
  }
}

console.log(`\nDone — patched ${patched} document(s).`);
