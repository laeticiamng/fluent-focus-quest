

# Audit & Blindage Complet — Operation Bienne

After thorough review of every component, here are the **gaps and blind spots** I've identified, organized by priority:

---

## ANGLES MORTS IDENTIFES

### 1. CONTENU MANQUANT CRITIQUE
- **Pas de deck "Nombres, Dates & Temps"** — indispensable en contexte médical (Geburtsdatum, Uhrzeit, Dosierung)
- **Pas de deck "Médicaments & Prescriptions"** — vocabulaire vital pour le quotidien hospitalier
- **Pas de deck "Verbes médicaux au Perfekt"** — conjugaison des 20 verbes les plus utilisés
- **Questions d'entretien incomplètes** — manquent: faiblesses, conflits d'équipe, pourquoi quitter votre poste actuel, salaire, pourquoi la Suisse
- **Pas de template Befundbericht** — modèle de rapport médical en allemand
- **Pas de template email de remerciement** — crucial pour le soir du 30 mars
- **Pas de template lettre de motivation DE** — référencée dans la checklist mais absente
- **Pas de section "Übergabe SBAR"** — template structuré pour les transmissions

### 2. FONCTIONNALITES MANQUANTES
- **Pas de quiz inversé FR→DE** — le plus utile pour la production orale
- **Pas de mode "Quiz tous les decks"** — révision globale mixte
- **Pas de compteur de streak** (jours consécutifs)
- **Pas de statistiques** — score moyen quiz, mots maîtrisés, progression par deck
- **Pas de mode shuffle flashcards** — toujours le même ordre = mémorisation de position
- **Grammaire 100% passive** — pas d'exercices interactifs, juste de la lecture
- **Dashboard ne montre pas les tâches du jour** — oblige à naviguer vers "Jour"
- **Pas de section Notes personnelles** — pour écrire ses propres phrases/notes

### 3. UX MANQUANTE
- **Pomodoro sans son** à la fin — on rate la fin si on ne regarde pas l'écran
- **Pas de célébration/confetti** sur les milestones (100 XP, niveau up, journée complète)
- **Pas de récap quotidien** sur le dashboard

---

## PLAN D'IMPLEMENTATION

### A. Enrichir les données (`content.ts`)
- Ajouter 3 nouveaux decks: **Nombres/Temps** (16 cartes), **Médicaments** (16 cartes), **Verbes Perfekt** (20 cartes)
- Ajouter 5 questions d'entretien supplémentaires (Schwächen, Teamkonflikte, Warum Schweiz, Gehaltsvorstellungen, Warum Stellenwechsel)
- Ajouter templates: email remerciement, Befundbericht, lettre de motivation, Übergabe SBAR
- Total vocabulaire: ~98 → ~148 mots

### B. Nouveau composant `WritingTemplates.tsx`
- Section avec 4 templates (email, Befundbericht, lettre de motivation, SBAR)
- Chaque template affichable avec texte DE + traduction FR
- Intégré dans l'onglet Outils

### C. Enrichir `Vocab.tsx`
- Ajouter mode quiz inversé **FR→DE** (bouton toggle)
- Ajouter mode **shuffle** pour les flashcards
- Ajouter mode **"Quiz global"** mélangeant tous les decks
- Tracker de difficulté par carte (facile/difficile marqué par l'utilisateur)

### D. Enrichir `Grammar.tsx` → exercices interactifs
- Ajouter des mini-exercices: phrases à trous ("Ich ___ den Patienten untersucht" → habe)
- 3-4 exercices par fiche de grammaire, avec feedback immédiat

### E. Enrichir `Interview.tsx`
- Ajouter les 5 nouvelles questions
- Ajouter un mode **simulation chronométrée**: timer de 2 min par question, enchaînement auto
- Ajouter progress bar des questions évaluées

### F. Enrichir le Dashboard (`Index.tsx`)
- Ajouter **aperçu des tâches du jour** directement sur le dashboard
- Ajouter **compteur de streak** (jours consécutifs avec au moins 1 tâche)
- Ajouter **stats rapides**: score moyen quiz, dernière session

### G. Enrichir `Tools.tsx`
- Ajouter **alerte sonore** quand le Pomodoro finit (Web Audio API beep)
- Ajouter section **Notes personnelles** (textarea + localStorage)
- Intégrer les templates d'écriture

### H. Section Stats (`Stats.tsx`) — nouveau composant
- Score moyen par deck de quiz
- Mots maîtrisés vs à revoir
- Graphique de progression XP (recharts, déjà installé)
- Nombre de sessions Pomodoro complétées

### I. Persistance étendue (`useProgress.ts`)
- Tracker les scores de quiz par deck
- Tracker les cartes marquées "difficiles"
- Tracker le streak (dernière date d'activité)
- Tracker les sessions Pomodoro complétées
- Tracker les notes personnelles

---

## FICHIERS MODIFIES
1. `src/data/content.ts` — +3 decks, +5 questions entretien, +templates écriture, +exercices grammaire
2. `src/hooks/useProgress.ts` — streak, quiz scores, notes, stats
3. `src/components/Vocab.tsx` — quiz inversé, shuffle, quiz global, marquage difficulté
4. `src/components/Grammar.tsx` — exercices interactifs à trous
5. `src/components/Interview.tsx` — +5 questions, mode simulation chrono, progress bar
6. `src/components/Clinical.tsx` — vocabulaire lié à chaque scénario
7. `src/components/Tools.tsx` — son Pomodoro, notes personnelles, templates
8. `src/components/Stats.tsx` — **nouveau** composant stats avec graphiques recharts
9. `src/pages/Index.tsx` — aperçu tâches du jour, streak, stats rapides, nouvel onglet stats

Aucune nouvelle dépendance requise (recharts déjà installé, Web Audio API natif).

