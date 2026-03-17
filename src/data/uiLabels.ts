/**
 * Centralized UI labels for recurring French text strings.
 * Used across the platform for consistency.
 *
 * NOTE: The platform UI is French-first. These labels centralize
 * the most commonly reused strings to avoid duplication.
 * The "FR toggle" system is for showing French translations
 * of German pedagogical content, not for translating the UI itself.
 */

// ── Common action labels ──────────────────────────────────────
export const ACTION_LABELS = {
  retry: "Reessayer",
  back: "Retour",
  next: "Suivant",
  finish: "Terminer",
  start: "Lancer",
  pause: "Pause",
  reset: "Reinitialiser",
  cancel: "Annuler",
  submit: "Soumettre",
  save: "Sauvegarder",
  copy: "Copier",
  copied: "Copie",
  close: "Fermer",
  open: "Ouvrir",
  loading: "Chargement...",
  signOut: "Sortir",
} as const;

// ── Status / state labels ─────────────────────────────────────
export const STATUS_LABELS = {
  offline: "Mode hors-ligne",
  offlineDetail: "Progression sauvegardee localement. Connecte-toi pour synchroniser.",
  error: "Erreur inattendue",
  errorSaved: "Tes donnees et ta progression sont sauvegardees.",
  reloadApp: "Recharger l'application",
  sectionError: "Cette section a rencontre une erreur",
  sectionErrorDetail: "Ta progression est sauvegardee. Essaie de changer d'onglet ou de recharger.",
  initializing: "Initialisation...",
  notFound: "Zone introuvable",
  notFoundDetail: "Cette salle n'existe pas encore dans ton univers. Retourne au QG pour continuer ta progression.",
  backToHQ: "Retour au QG",
} as const;

// ── WebGL / 3D fallback labels ────────────────────────────────
export const WEBGL_LABELS = {
  sceneInterrupted: "Scene 3D interrompue",
  reloadScene: "Recharger la scene",
  loadingProtocol: "Chargement du Protocole Lazarus...",
  webglUnavailable: "WebGL non disponible",
  contextLost: "Contexte WebGL perdu",
  shaderFailure: "Echec de compilation des shaders",
  lowGpu: "GPU insuffisant pour la 3D",
  lowMemory: "Memoire insuffisante",
  postProcessingDisabled: "Post-traitement desactive",
  reducedMotion: "Mouvement reduit prefere",
  runtimeError: "Erreur d'execution survenue",
  unknownFallback: "Mode de secours inconnu",
} as const;

// ── Auth error messages ───────────────────────────────────────
export const AUTH_ERRORS = {
  invalidCredentials: "Email ou mot de passe incorrect.",
  emailNotConfirmed: "Ton email n'est pas encore confirme. Verifie ta boite de reception.",
  rateLimited: "Trop de tentatives. Reessaie dans quelques minutes.",
  alreadyRegistered: "Cet email est deja enregistre. Essaie de te connecter.",
  passwordTooShort: "Le mot de passe doit contenir au moins 6 caracteres.",
  networkError: "Erreur reseau. Verifie ta connexion internet et reessaie.",
  serviceUnavailable: "Le service d'authentification est temporairement indisponible. Reessaie plus tard.",
  sessionExpired: "Ta session a expire. Reconnecte-toi pour continuer.",
} as const;

// ── AI coach fallback labels ──────────────────────────────────
export const AI_LABELS = {
  creditsExhausted: "Credits IA epuises — mode pedagogique local active.",
  rateLimited: "Coach IA temporairement sature — feedback local active.",
  networkError: "Connexion au coach IA interrompue — mode hors-ligne active.",
  genericError: "Coach IA indisponible — feedback local active.",
  localEvaluation: "Utiliser l'evaluation locale",
  analyzing: "Le Conseil analyse ta reponse...",
  evaluating5d: "Evaluation sur 5 dimensions",
} as const;

// ── Translation toggle labels ─────────────────────────────────
export const TRANSLATION_LABELS = {
  showFr: "Afficher les traductions françaises",
  frOn: "FR ON",
  fr: "FR",
  translate: "Traduire",
  seeTranslation: "Voir la traduction française",
  hideTranslation: "Masquer la traduction",
} as const;

export type ActionLabel = keyof typeof ACTION_LABELS;
export type StatusLabel = keyof typeof STATUS_LABELS;
