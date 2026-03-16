// ===== ESCAPE GAME UNIVERSE: "LE COMPLEXE MÉDICAL" =====
// The platform is now a locked medical complex. Each zone is a wing,
// each room is a challenge chamber. Creation unlocks doors, not just XP.

export type RoomStatus = "undiscovered" | "discovered" | "locked" | "accessible" | "in_progress" | "solved" | "secret";

export type FragmentType = "key_fragment" | "code_digit" | "medical_rune" | "vocal_seal" | "clinical_artifact" | "sonic_rune" | "archive_piece" | "master_sigil";

export interface EscapeFragment {
  id: string;
  type: FragmentType;
  name: string;
  icon: string;
  description: string;
  roomSource: string; // which room it came from
  obtainedAt?: string; // ISO date
  usedFor?: string; // which door/mechanism it was used for
}

export interface EscapeKey {
  id: string;
  name: string;
  icon: string;
  fragments: string[]; // fragment IDs needed to forge this key
  forged: boolean;
  unlocksRoom?: string; // room ID this key opens
  description: string;
}

export interface EscapeCode {
  id: string;
  name: string;
  digits: number; // how many elements needed
  collectedDigits: number;
  complete: boolean;
  unlocksRoom?: string;
  description: string;
}

export interface EscapeRoom {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  zoneId: string;
  status: RoomStatus;
  description: string;
  challenge: string; // what the player must do
  reward: { type: FragmentType; name: string; icon: string; description: string };
  unlockRequirement: {
    type: "none" | "fragments" | "key" | "code" | "rooms_solved" | "artifacts_count";
    details: string;
    fragmentIds?: string[];
    keyId?: string;
    codeId?: string;
    roomIds?: string[];
    count?: number;
  };
  artifactTypes: string[]; // which artifact types count as solving
  solveThreshold: number; // how many artifacts needed to solve
  narrativeOnSolve: string; // narrative text when solved
  narrativeOnDiscover: string; // narrative text when discovered
}

export interface EscapeZone {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  narrative: string; // story context
  rooms: EscapeRoom[];
  unlockRequirement: {
    type: "none" | "zones_cleared" | "fragments_count" | "key";
    details: string;
    zoneIds?: string[];
    count?: number;
    keyId?: string;
  };
}

export interface MissionChapter {
  id: string;
  name: string;
  description: string;
  icon: string;
  zones: string[]; // zone IDs in this chapter
  narrativeIntro: string;
  narrativeComplete: string;
  unlockRequirement: {
    type: "none" | "chapters_complete";
    chapterIds?: string[];
  };
}

// ===== THE CENTRAL MISSION =====
export const CENTRAL_MISSION = {
  title: "Protocole Lazarus",
  subtitle: "Reanimer le Complexe Medical",
  description: "Le Complexe Medical de Biel est verrouille depuis l'incident. Les systemes sont hors ligne, les archives scellees, les protocoles effaces. Tu es la seule personne capable de reactiver chaque aile, restaurer les dossiers, et rouvrir le centre. Chaque salle que tu resous revele un fragment du code maitre. Assemble-les tous pour deverrouiller le Protocole Lazarus et prendre ta place au Gefasszentrum.",
  icon: "🏥",
};

// ===== NARRATIVE ELEMENTS =====
export const NARRATIVE = {
  worldContext: "Le Spitalzentrum Biel a ete mis en quarantaine numerique. Tous les systemes medicaux, les archives et les protocoles ont ete verrouilles par un mecanisme de securite defaillant. Pour reactiver le complexe, il faut traverser chaque aile, resoudre les epreuves, et collecter les fragments du Code Maitre.",
  playerRole: "En tant que future medecin du Gefasszentrum, tu es la seule habilitee a reactiver les systemes. Chaque epreuve resolue prouve ta competence et deverrouille la suite du complexe.",
  ultimateGoal: "Rassembler les 6 Sigils de Maitrise pour forger la Cle du Protocole Lazarus et rouvrir definitivement le Complexe Medical.",
};

// ===== FEEDBACK MESSAGES =====
export const ESCAPE_FEEDBACK = {
  fragmentObtained: "Fragment obtenu",
  doorUnlocked: "Porte deverrouillee",
  roomRevealed: "Salle revelee",
  mechanismActivated: "Mecanisme active",
  clueDiscovered: "Indice decouvert",
  keyForged: "Cle forgee",
  codeComplete: "Code complet",
  sealBroken: "Sceau brise",
  roomSolved: "Salle resolue",
  zoneClear: "Aile securisee",
  chapterComplete: "Chapitre termine",
  sigilObtained: "Sigil de Maitrise obtenu",
};

// ===== ZONE & ROOM DEFINITIONS =====
export const ESCAPE_ZONES: EscapeZone[] = [
  {
    id: "forge",
    name: "Aile de la Forge Linguistique",
    subtitle: "Forge les fondations du langage medical",
    icon: "🔨",
    color: "amber",
    description: "L'aile ouest du complexe — la ou le vocabulaire medical est forge et affute.",
    narrative: "Les terminaux linguistiques sont hors ligne. Les bases de donnees de vocabulaire sont corrompues. Seule la creation manuelle de phrases et definitions peut reactiver les systemes de communication du complexe.",
    unlockRequirement: { type: "none", details: "Toujours accessible — c'est le point d'entree" },
    rooms: [
      {
        id: "forge-anvil",
        name: "L'Enclume a Mots",
        subtitle: "Forge tes premiers mots medicaux",
        icon: "📖",
        zoneId: "forge",
        status: "accessible",
        description: "Le terminal de base du vocabulaire medical. Chaque carte retournee reactive un mot dans le systeme.",
        challenge: "Etudie les flashcards medicales et memorise le vocabulaire de base",
        reward: { type: "key_fragment", name: "Fragment d'Enclume", icon: "🔑", description: "Un fragment de la Cle de la Forge" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: ["phrase_forged", "definition_written"],
        solveThreshold: 5,
        narrativeOnSolve: "Les terminaux de vocabulaire clignotent et se rallument. Le systeme de communication basique est restaure. Un fragment de cle tombe du mecanisme central.",
        narrativeOnDiscover: "L'Enclume a Mots — le coeur de la forge linguistique. Les ecrans sont eteints, mais le clavier attend tes premieres frappes.",
      },
      {
        id: "forge-workbench",
        name: "L'Etabli de Phrases",
        subtitle: "Assemble des phrases medicales completes",
        icon: "✍️",
        zoneId: "forge",
        status: "locked",
        description: "L'etabli ou les mots deviennent des phrases. Chaque phrase validee active un nouveau circuit linguistique.",
        challenge: "Forge des phrases medicales completes — chaque phrase validee active un circuit",
        reward: { type: "key_fragment", name: "Fragment d'Etabli", icon: "🔧", description: "Un deuxieme fragment de la Cle de la Forge" },
        unlockRequirement: { type: "rooms_solved", details: "Resous l'Enclume a Mots", roomIds: ["forge-anvil"] },
        artifactTypes: ["phrase_forged", "phrase_assembled"],
        solveThreshold: 10,
        narrativeOnSolve: "L'Etabli vibre — les circuits de phrases sont actifs. Le deuxieme fragment de cle emerge du mecanisme. La Salle du Maitre Forgeron commence a emettre une lueur...",
        narrativeOnDiscover: "Un etabli massif domine la piece. Des outils linguistiques sont alignes, prets a forger des phrases completes.",
      },
      {
        id: "forge-master",
        name: "Salle du Maitre Forgeron",
        subtitle: "Maitrise la forge linguistique",
        icon: "⚒️",
        zoneId: "forge",
        status: "locked",
        description: "La salle secrete du maitre forgeron. Seuls les linguistes confirmes peuvent y acceder.",
        challenge: "Demontre ta maitrise avec 20 phrases forgees — le Sigil de la Forge t'attend",
        reward: { type: "master_sigil", name: "Sigil de la Forge", icon: "🏅", description: "Le premier des 6 Sigils de Maitrise — preuve de ta competence linguistique" },
        unlockRequirement: { type: "rooms_solved", details: "Resous l'Etabli de Phrases", roomIds: ["forge-workbench"] },
        artifactTypes: ["phrase_forged", "definition_written", "phrase_assembled"],
        solveThreshold: 20,
        narrativeOnSolve: "Le Maitre Forgeron te reconnait. Le Sigil de la Forge brille dans ta main — le premier des six. L'Arbre des Regles tremble au loin... une nouvelle aile s'eveille.",
        narrativeOnDiscover: "La salle du Maitre Forgeron. L'air est charge d'energie. Un mecanisme complexe attend d'etre active par un veritable artisan du langage.",
      },
    ],
  },
  {
    id: "grammar",
    name: "Aile de l'Arbre des Regles",
    subtitle: "Deverrouille l'architecture grammaticale",
    icon: "🌳",
    color: "emerald",
    description: "L'aile nord — ou la grammaire allemande se deploie comme un arbre vivant.",
    narrative: "L'Arbre des Regles est en dormance. Ses racines, branches et canopee sont deconnectees. Chaque regle reconstruite fait repousser une branche et reactive un systeme de verification linguistique.",
    unlockRequirement: { type: "zones_cleared", details: "Resous au moins 1 salle de la Forge", zoneIds: ["forge"], count: 1 },
    rooms: [
      {
        id: "gram-roots",
        name: "Salle des Racines",
        subtitle: "Les fondations de la grammaire",
        icon: "🌱",
        zoneId: "grammar",
        status: "locked",
        description: "Les racines de l'arbre grammatical. Construis les premieres regles pour faire germer le systeme.",
        challenge: "Construis 3 regles de grammaire pour faire repousser les racines",
        reward: { type: "key_fragment", name: "Racine d'Or", icon: "🌿", description: "Fragment de la Cle de l'Arbre" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: ["grammar_phrase", "grammar_rule", "grammar_transform"],
        solveThreshold: 3,
        narrativeOnSolve: "Les racines s'illuminent de vert. L'arbre commence a respirer. Les branches s'eveillent...",
        narrativeOnDiscover: "La salle des racines. Des symboles grammaticaux sont graves dans le sol, attendant d'etre actives.",
      },
      {
        id: "gram-branches",
        name: "Salle des Branches",
        subtitle: "Deploie ta grammaire",
        icon: "🌿",
        zoneId: "grammar",
        status: "locked",
        description: "Les branches de l'arbre. Chaque regle construite fait pousser une nouvelle branche.",
        challenge: "Construis 8 elements grammaticaux pour deployer les branches",
        reward: { type: "code_digit", name: "Rune de Branche", icon: "🔣", description: "Un element du Code de l'Arbre" },
        unlockRequirement: { type: "rooms_solved", details: "Resous la Salle des Racines", roomIds: ["gram-roots"] },
        artifactTypes: ["grammar_phrase", "grammar_rule", "grammar_transform"],
        solveThreshold: 8,
        narrativeOnSolve: "Les branches se deploient majestueusement. La canopee scintille au-dessus — presque accessible...",
        narrativeOnDiscover: "Les branches de l'arbre montent vers la lumiere. Des connexions grammaticales attendent d'etre etablies.",
      },
      {
        id: "gram-canopy",
        name: "La Canopee",
        subtitle: "Maitrise l'arbre grammatical",
        icon: "🌲",
        zoneId: "grammar",
        status: "locked",
        description: "Le sommet de l'arbre. La maitrise grammaticale complete donne acces a une vue d'ensemble.",
        challenge: "15 constructions grammaticales pour atteindre la canopee et obtenir le Sigil",
        reward: { type: "master_sigil", name: "Sigil de l'Arbre", icon: "🏅", description: "Le deuxieme Sigil de Maitrise — preuve de ta maitrise grammaticale" },
        unlockRequirement: { type: "rooms_solved", details: "Resous la Salle des Branches", roomIds: ["gram-branches"] },
        artifactTypes: ["grammar_phrase", "grammar_rule", "grammar_transform"],
        solveThreshold: 15,
        narrativeOnSolve: "L'Arbre resplendit. Depuis la canopee, tu vois tout le complexe. Le Sigil de l'Arbre est a toi. Le Studio d'Oral Clinique reagit dans l'aile sud...",
        narrativeOnDiscover: "La canopee de l'arbre. Un panorama grammatical extraordinaire s'offre a toi... si tu parviens a grimper jusque-la.",
      },
    ],
  },
  {
    id: "studio",
    name: "Aile du Studio d'Oral Clinique",
    subtitle: "Forge ta voix medicale",
    icon: "🎙️",
    color: "violet",
    description: "L'aile sud — le studio d'entrainement a l'oral medical et aux entretiens.",
    narrative: "Le studio d'enregistrement est muet. Les microphones sont coupes, les scenarios d'entretien effaces. Reconstitue tes reponses pour reactiver le systeme de communication orale du complexe.",
    unlockRequirement: { type: "zones_cleared", details: "Resous au moins 1 salle de l'Arbre des Regles", zoneIds: ["grammar"], count: 1 },
    rooms: [
      {
        id: "studio-prep",
        name: "Salle de Preparation",
        subtitle: "Prepare tes reponses d'entretien",
        icon: "📝",
        zoneId: "studio",
        status: "locked",
        description: "La salle de preparation — ecris et peaufine tes reponses aux questions d'entretien.",
        challenge: "Cree 5 reponses d'entretien pour reactiver les systemes de communication",
        reward: { type: "vocal_seal", name: "Sceau Vocal Alpha", icon: "🔊", description: "Le premier sceau vocal — preuve de ta capacite orale" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: ["interview_answer"],
        solveThreshold: 5,
        narrativeOnSolve: "Le premier microphone se rallume. Ta voix resonne dans le studio. Le Sceau Vocal est forge — le studio d'enregistrement est proche...",
        narrativeOnDiscover: "La salle de preparation. Des fiches de questions sont eparpillees sur le bureau. Les ecrans attendent tes reponses.",
      },
      {
        id: "studio-record",
        name: "Studio d'Enregistrement",
        subtitle: "Enregistre et perfectionne",
        icon: "🎙️",
        zoneId: "studio",
        status: "locked",
        description: "Le studio d'enregistrement. Enregistre ta voix et perfectionne ta prononciation.",
        challenge: "10 reponses d'entretien et enregistrements vocaux pour activer le studio",
        reward: { type: "vocal_seal", name: "Sceau Vocal Beta", icon: "🎤", description: "Le deuxieme sceau — ta voix gagne en autorite" },
        unlockRequirement: { type: "rooms_solved", details: "Resous la Salle de Preparation", roomIds: ["studio-prep"] },
        artifactTypes: ["interview_answer", "recording"],
        solveThreshold: 10,
        narrativeOnSolve: "Tous les microphones sont actifs. Ta voix resonne avec autorite. La Salle de Conference reveille ses lumieres...",
        narrativeOnDiscover: "Le studio d'enregistrement professionnel. Des microphones attendent, les niveaux sonores clignotent faiblement.",
      },
      {
        id: "studio-conference",
        name: "Salle de Conference",
        subtitle: "Maitrise la communication orale",
        icon: "🏛️",
        zoneId: "studio",
        status: "locked",
        description: "La salle de conference — ou les meilleurs orateurs cliniques sont reconnus.",
        challenge: "Couvre 15 questions uniques d'entretien pour obtenir le Sigil du Studio",
        reward: { type: "master_sigil", name: "Sigil de la Voix", icon: "🏅", description: "Le troisieme Sigil — ta voix medicale est reconnue" },
        unlockRequirement: { type: "rooms_solved", details: "Resous le Studio d'Enregistrement", roomIds: ["studio-record"] },
        artifactTypes: ["interview_answer", "recording"],
        solveThreshold: 15,
        narrativeOnSolve: "La Salle de Conference s'illumine. Tu es reconnue comme communicante medicale. Le Sigil de la Voix brille — l'Hopital d'Investigation s'ouvre...",
        narrativeOnDiscover: "La grande salle de conference. Des rangees de sieges font face a un podium eclaire. C'est ici que la maitrise orale est jugee.",
      },
    ],
  },
  {
    id: "clinical",
    name: "Aile d'Investigation Clinique",
    subtitle: "Raisonnement medical en allemand",
    icon: "🏥",
    color: "rose",
    description: "L'aile est — le centre de raisonnement clinique et de diagnostic.",
    narrative: "L'hopital est en mode urgence. Les dossiers patients sont corrompus, les diagnostics perdus. Reconstruis les protocoles cliniques pour stabiliser le complexe.",
    unlockRequirement: { type: "zones_cleared", details: "Resous au moins 1 salle du Studio", zoneIds: ["studio"], count: 1 },
    rooms: [
      {
        id: "clin-triage",
        name: "Salle de Triage",
        subtitle: "Premiers diagnostics",
        icon: "🚑",
        zoneId: "clinical",
        status: "locked",
        description: "Le triage — ou les premiers diagnostics sont poses et les priorites etablies.",
        challenge: "Construis 3 diagnostics ou notes cliniques pour stabiliser le triage",
        reward: { type: "clinical_artifact", name: "Badge de Triage", icon: "🩺", description: "Le badge du triagiste — tu sais prioriser" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: ["diagnostic", "clinical_note"],
        solveThreshold: 3,
        narrativeOnSolve: "Le triage est stabilise. Les ecrans de monitoring clignotent en vert. Le service general est accessible...",
        narrativeOnDiscover: "La salle de triage. Des brancards vides, des ecrans de monitoring eteints. Le systeme attend tes diagnostics.",
      },
      {
        id: "clin-ward",
        name: "Le Service",
        subtitle: "Gestion clinique approfondie",
        icon: "🩺",
        zoneId: "clinical",
        status: "locked",
        description: "Le service hospitalier — gestion complete des patients et documentation clinique.",
        challenge: "6 dossiers cliniques complets (diagnostics, notes, cas patients)",
        reward: { type: "clinical_artifact", name: "Dossier du Chef", icon: "📋", description: "Le dossier du chef de service — ta competence clinique est prouvee" },
        unlockRequirement: { type: "rooms_solved", details: "Resous la Salle de Triage", roomIds: ["clin-triage"] },
        artifactTypes: ["diagnostic", "clinical_note", "case_patient"],
        solveThreshold: 6,
        narrativeOnSolve: "Le service tourne a plein regime. Les dossiers sont reconstitues. Le bureau du Chefarzt s'illumine au fond du couloir...",
        narrativeOnDiscover: "Le service hospitalier. Des lits vides, des dossiers eparpilles. Le systeme de gestion clinique est a reconstruire.",
      },
      {
        id: "clin-chief",
        name: "Bureau du Chefarzt",
        subtitle: "Maitrise clinique absolue",
        icon: "👨‍⚕️",
        zoneId: "clinical",
        status: "locked",
        description: "Le bureau du chef de service — seuls les cliniciens confirmes y accedent.",
        challenge: "10 dossiers cliniques complets pour le Sigil Clinique",
        reward: { type: "master_sigil", name: "Sigil Clinique", icon: "🏅", description: "Le quatrieme Sigil — ta competence clinique est reconnue" },
        unlockRequirement: { type: "rooms_solved", details: "Resous le Service", roomIds: ["clin-ward"] },
        artifactTypes: ["diagnostic", "clinical_note", "case_patient"],
        solveThreshold: 10,
        narrativeOnSolve: "Le bureau du Chefarzt s'ouvre. Les ecrans affichent 'Acces autorise'. Le Sigil Clinique est forge. Le Laboratoire de Creation Avancee detecte ta presence...",
        narrativeOnDiscover: "Le bureau du chef. Un fauteuil en cuir, des ecrans de surveillance, un coffre verrouille. Ici, seule la maitrise compte.",
      },
    ],
  },
  {
    id: "laboratory",
    name: "Laboratoire de Creation Avancee",
    subtitle: "Les 9 ateliers de production",
    icon: "⚗️",
    color: "blue",
    description: "L'aile centrale — le laboratoire aux 9 salles de creation specialisees.",
    narrative: "Le Laboratoire est le coeur du complexe. Ses 9 salles de creation sont les outils les plus puissants pour reconstruire les protocoles medicaux. Chaque atelier produit un type d'artefact unique.",
    unlockRequirement: { type: "zones_cleared", details: "Resous au moins 1 salle de l'Hopital", zoneIds: ["clinical"], count: 1 },
    rooms: [
      {
        id: "lab-basic",
        name: "Labo de Base",
        subtitle: "Ateliers fondamentaux",
        icon: "🧪",
        zoneId: "laboratory",
        status: "locked",
        description: "Les ateliers de base — phrases, scripts et premieres productions medicales.",
        challenge: "Produis 10 artefacts dans les ateliers de base",
        reward: { type: "key_fragment", name: "Reactif Alpha", icon: "🧬", description: "Reactif de laboratoire — active les ateliers avances" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: ["phrase_forged", "script", "document", "recording"],
        solveThreshold: 10,
        narrativeOnSolve: "Le labo de base est operationnel. Les reactifs circulent. Les ateliers avances se deverrouillent...",
        narrativeOnDiscover: "Le laboratoire de base. Des eprouvettes vides, des ecrans de production eteints. Tout est pret pour etre reactive.",
      },
      {
        id: "lab-advanced",
        name: "Labo Avance",
        subtitle: "Production specialisee",
        icon: "⚡",
        zoneId: "laboratory",
        status: "locked",
        description: "Les ateliers avances — diagnostics complexes, cas patients, documents professionnels.",
        challenge: "Produis 25 artefacts au total pour activer le labo avance",
        reward: { type: "key_fragment", name: "Reactif Beta", icon: "💎", description: "Reactif avance — ouvre l'atelier du Maitre" },
        unlockRequirement: { type: "rooms_solved", details: "Resous le Labo de Base", roomIds: ["lab-basic"] },
        artifactTypes: ["diagnostic", "clinical_note", "case_patient", "script", "document"],
        solveThreshold: 25,
        narrativeOnSolve: "Les ateliers avances bourdonnent d'energie. Le Labo du Maitre se revele dans les profondeurs du complexe...",
        narrativeOnDiscover: "Le labo avance. Des equipements sophistiques, des protocoles complexes. Ici, la production est d'elite.",
      },
      {
        id: "lab-master",
        name: "Labo du Maitre",
        subtitle: "Maitrise de la creation",
        icon: "👑",
        zoneId: "laboratory",
        status: "locked",
        description: "L'atelier supreme — ou les maitres createurs forgent les artefacts les plus puissants.",
        challenge: "50 artefacts totaux pour le Sigil du Laboratoire",
        reward: { type: "master_sigil", name: "Sigil du Laboratoire", icon: "🏅", description: "Le cinquieme Sigil — ta maitrise creative est absolue" },
        unlockRequirement: { type: "rooms_solved", details: "Resous le Labo Avance", roomIds: ["lab-advanced"] },
        artifactTypes: [],
        solveThreshold: 50,
        narrativeOnSolve: "Le Labo du Maitre reconnait ta maitrise. Le Sigil du Laboratoire est forge. Les Archives Centrales tremblent — la derniere aile s'eveille...",
        narrativeOnDiscover: "Le labo du maitre. Un sanctuaire de creation. L'air vibre de potentiel. Seuls les plus prolifiques y accedent.",
      },
    ],
  },
  {
    id: "archive",
    name: "Archives Centrales",
    subtitle: "Ton heritage de connaissances",
    icon: "📚",
    color: "cyan",
    description: "Le sous-sol du complexe — ou tout ce que tu as construit est preserve et analyse.",
    narrative: "Les Archives Centrales sont le coeur de memoire du complexe. Chaque artefact cree y est enregistre. Mais les systemes d'analyse sont verrouilles. Reactive-les pour obtenir le dernier Sigil et acceder au Protocole Lazarus.",
    unlockRequirement: { type: "zones_cleared", details: "Resous au moins 1 salle du Laboratoire", zoneIds: ["laboratory"], count: 1 },
    rooms: [
      {
        id: "arch-gallery",
        name: "La Galerie",
        subtitle: "Collection d'artefacts",
        icon: "🖼️",
        zoneId: "archive",
        status: "locked",
        description: "La galerie de tes creations — chaque artefact y est expose et catalogue.",
        challenge: "Accumule 30 artefacts pour activer la Galerie",
        reward: { type: "archive_piece", name: "Catalogue Alpha", icon: "📖", description: "Le premier catalogue — tes creations sont organisees" },
        unlockRequirement: { type: "none", details: "" },
        artifactTypes: [],
        solveThreshold: 30,
        narrativeOnSolve: "La Galerie s'illumine. Tes creations sont exposees sur les murs. L'Observatoire detecte ton activite...",
        narrativeOnDiscover: "La galerie des archives. Des cadres vides attendent tes creations. Chaque mur est un temoignage potentiel.",
      },
      {
        id: "arch-observatory",
        name: "L'Observatoire",
        subtitle: "Analyse de progression",
        icon: "📊",
        zoneId: "archive",
        status: "locked",
        description: "L'observatoire statistique — analyse ta progression et identifie tes forces.",
        challenge: "Accumule 50 artefacts pour activer l'Observatoire",
        reward: { type: "archive_piece", name: "Rapport de Progression", icon: "📈", description: "Le rapport complet — ta trajectoire est visible" },
        unlockRequirement: { type: "rooms_solved", details: "Resous la Galerie", roomIds: ["arch-gallery"] },
        artifactTypes: [],
        solveThreshold: 50,
        narrativeOnSolve: "L'Observatoire s'active. Les graphiques s'animent. Ta progression est visible et impressionnante. Le Hall of Fame attend...",
        narrativeOnDiscover: "L'observatoire. Des ecrans circulaires, des courbes vierges. Ici, ta progression sera analysee et celebree.",
      },
      {
        id: "arch-hall",
        name: "Hall of Fame",
        subtitle: "Le pantheon des maitres",
        icon: "🏆",
        zoneId: "archive",
        status: "locked",
        description: "Le Hall of Fame — ou les maitres du complexe sont immortalises.",
        challenge: "75 artefacts et tous les Sigils pour le dernier Sigil",
        reward: { type: "master_sigil", name: "Sigil des Archives", icon: "🏅", description: "Le sixieme et dernier Sigil — tu as domine chaque aile du complexe" },
        unlockRequirement: { type: "rooms_solved", details: "Resous l'Observatoire", roomIds: ["arch-observatory"] },
        artifactTypes: [],
        solveThreshold: 75,
        narrativeOnSolve: "Le Hall of Fame t'accueille. Ton nom est grave dans les archives. Le sixieme Sigil est forge. Le Protocole Lazarus est a portee de main...",
        narrativeOnDiscover: "Le Hall of Fame. Des noms graves dans la pierre, des lumieres tamisees. Le sommet de la reconnaissance t'attend.",
      },
    ],
  },
];

// ===== CHAPTERS =====
export const CHAPTERS: MissionChapter[] = [
  {
    id: "ch1",
    name: "Chapitre 1 : Premiers Pas",
    description: "Reactive les systemes de base du complexe",
    icon: "📖",
    zones: ["forge", "grammar"],
    narrativeIntro: "Le complexe est silencieux. Les lumieres vacillent. Commence par la Forge Linguistique — c'est le seul acces encore ouvert. Chaque mot forge reactive un systeme.",
    narrativeComplete: "Les ailes de la Forge et de l'Arbre sont actives. Le complexe reprend vie. Mais il reste tant de portes a ouvrir...",
    unlockRequirement: { type: "none" },
  },
  {
    id: "ch2",
    name: "Chapitre 2 : La Voix du Complexe",
    description: "Reactive les systemes de communication",
    icon: "📖",
    zones: ["studio"],
    narrativeIntro: "Les mots sont forges, la grammaire reconstruite. Mais le complexe est muet. Il faut reactiver les systemes de communication orale — le Studio d'Oral Clinique t'attend.",
    narrativeComplete: "Ta voix resonne dans tout le complexe. Les systemes de communication sont en ligne. L'Hopital peut maintenant etre reactive...",
    unlockRequirement: { type: "chapters_complete", chapterIds: ["ch1"] },
  },
  {
    id: "ch3",
    name: "Chapitre 3 : Protocoles Cliniques",
    description: "Restaure les dossiers medicaux",
    icon: "📖",
    zones: ["clinical"],
    narrativeIntro: "L'hopital est en etat critique. Les dossiers patients sont corrompus, les diagnostics effaces. Reconstruis les protocoles cliniques pour stabiliser le complexe.",
    narrativeComplete: "L'hopital tourne a nouveau. Les diagnostics sont en ligne, les patients pris en charge. Le coeur du complexe est proche...",
    unlockRequirement: { type: "chapters_complete", chapterIds: ["ch2"] },
  },
  {
    id: "ch4",
    name: "Chapitre 4 : Le Laboratoire",
    description: "Active le coeur creatif du complexe",
    icon: "📖",
    zones: ["laboratory"],
    narrativeIntro: "Le Laboratoire de Creation Avancee — le coeur battant du complexe. Ses 9 salles contiennent les outils les plus puissants. Active-les toutes pour forger le cinquieme Sigil.",
    narrativeComplete: "Le Laboratoire bourdonne. Les 9 ateliers sont operationnels. Tu es devenue une creatrice d'elite. Les Archives attendent...",
    unlockRequirement: { type: "chapters_complete", chapterIds: ["ch3"] },
  },
  {
    id: "ch5",
    name: "Chapitre 5 : Protocole Lazarus",
    description: "Le denouement — rassemble les 6 Sigils",
    icon: "📖",
    zones: ["archive"],
    narrativeIntro: "Le moment final approche. Les Archives Centrales contiennent le mecanisme du Protocole Lazarus. Rassemble les 6 Sigils de Maitrise pour l'activer et rouvrir definitivement le complexe.",
    narrativeComplete: "Le Protocole Lazarus est active. Le Complexe Medical de Biel est rouvert. Tu es la Medecin qui a tout reconstruit. Le Gefasszentrum t'attend.",
    unlockRequirement: { type: "chapters_complete", chapterIds: ["ch4"] },
  },
];

// ===== ROOM-TO-TAB MAPPING =====
export const ZONE_TAB_MAP: Record<string, string> = {
  forge: "vocab",
  grammar: "gram",
  studio: "iv",
  clinical: "sim",
  laboratory: "atelier",
  archive: "portfolio",
};

// ===== COLOR SYSTEM =====
export const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string; accent: string; gradient: string }> = {
  amber: { bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25", text: "text-amber-400", glow: "shadow-amber-500/20", accent: "bg-amber-500", gradient: "from-amber-500/60 to-amber-400/30" },
  emerald: { bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25", text: "text-emerald-400", glow: "shadow-emerald-500/20", accent: "bg-emerald-500", gradient: "from-emerald-500/60 to-emerald-400/30" },
  violet: { bg: "from-violet-500/15 to-violet-500/5", border: "border-violet-500/25", text: "text-violet-400", glow: "shadow-violet-500/20", accent: "bg-violet-500", gradient: "from-violet-500/60 to-violet-400/30" },
  rose: { bg: "from-rose-500/15 to-rose-500/5", border: "border-rose-500/25", text: "text-rose-400", glow: "shadow-rose-500/20", accent: "bg-rose-500", gradient: "from-rose-500/60 to-rose-400/30" },
  blue: { bg: "from-blue-500/15 to-blue-500/5", border: "border-blue-500/25", text: "text-blue-400", glow: "shadow-blue-500/20", accent: "bg-blue-500", gradient: "from-blue-500/60 to-blue-400/30" },
  cyan: { bg: "from-cyan-500/15 to-cyan-500/5", border: "border-cyan-500/25", text: "text-cyan-400", glow: "shadow-cyan-500/20", accent: "bg-cyan-500", gradient: "from-cyan-500/60 to-cyan-400/30" },
};

// ===== HELPER: Compute room solve progress =====
export function computeRoomProgress(room: EscapeRoom, artifacts: Array<{ type: string }>): { current: number; threshold: number; percentage: number; solved: boolean } {
  let current: number;
  if (room.artifactTypes.length === 0) {
    // Any artifact counts
    current = artifacts.length;
  } else {
    current = artifacts.filter(a => room.artifactTypes.includes(a.type)).length;
  }
  const percentage = Math.min(100, Math.round((current / room.solveThreshold) * 100));
  return { current, threshold: room.solveThreshold, percentage, solved: current >= room.solveThreshold };
}

// ===== HELPER: Get escape room status dynamically =====
export function computeRoomStatus(
  room: EscapeRoom,
  solvedRoomIds: string[],
  artifacts: Array<{ type: string; length?: number }>,
  totalArtifacts: number,
): RoomStatus {
  // Check if already solved
  if (solvedRoomIds.includes(room.id)) return "solved";

  // Check unlock requirements
  const req = room.unlockRequirement;
  let canAccess = false;

  switch (req.type) {
    case "none":
      canAccess = true;
      break;
    case "rooms_solved":
      canAccess = (req.roomIds || []).every(id => solvedRoomIds.includes(id));
      break;
    case "artifacts_count":
      canAccess = totalArtifacts >= (req.count || 0);
      break;
    case "fragments":
    case "key":
    case "code":
      canAccess = false; // Will be handled by inventory system
      break;
  }

  if (!canAccess) return "locked";

  // Check if in progress (has some artifacts but not enough)
  const progress = computeRoomProgress(room, artifacts as Array<{ type: string }>);
  if (progress.current > 0 && !progress.solved) return "in_progress";
  if (progress.solved) return "solved";

  return "accessible";
}

// ===== HELPER: Get zone unlock status =====
export function computeZoneStatus(
  zone: EscapeZone,
  solvedRoomIds: string[],
  artifacts: Array<{ type: string }>,
): { unlocked: boolean; roomsSolved: number; totalRooms: number; progress: number } {
  const req = zone.unlockRequirement;
  let unlocked = false;

  switch (req.type) {
    case "none":
      unlocked = true;
      break;
    case "zones_cleared": {
      const requiredZoneIds = req.zoneIds || [];
      const minCount = req.count || 1;
      // Count how many of the required zones have at least 1 solved room
      const clearedCount = requiredZoneIds.filter(zoneId => {
        const targetZone = ESCAPE_ZONES.find(z => z.id === zoneId);
        if (!targetZone) return false;
        return targetZone.rooms.some(r => solvedRoomIds.includes(r.id));
      }).length;
      unlocked = clearedCount >= minCount;
      break;
    }
    case "fragments_count":
      unlocked = false; // Will be handled by inventory
      break;
    case "key":
      unlocked = false; // Will be handled by inventory
      break;
  }

  const roomsSolved = zone.rooms.filter(r => solvedRoomIds.includes(r.id)).length;
  const totalRooms = zone.rooms.length;
  const progress = totalRooms > 0 ? roomsSolved / totalRooms : 0;

  return { unlocked, roomsSolved, totalRooms, progress };
}
