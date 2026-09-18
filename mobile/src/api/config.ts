import { Platform } from "react-native";

// En développement :
// - Web (expo start --web) : localhost fonctionne directement.
// - Émulateur Android : remplacez par 10.0.2.2 (alias de localhost sur l'hôte).
// - Appareil physique : remplacez par l'adresse IP locale de votre ordinateur (ex: 192.168.1.20).
const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const API_BASE_URL = `http://${LOCALHOST}:4000`;
