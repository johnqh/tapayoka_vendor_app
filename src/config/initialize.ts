import { initializeWebApp } from "@sudobility/di_web";
import { FIREBASE_CONFIG } from "./constants";
import { initializeI18n } from "../i18n";

export async function initializeApp(): Promise<void> {
  await initializeWebApp({
    firebaseConfig: FIREBASE_CONFIG,
    initializeI18n,
    registerServiceWorker: false,
  });
}
