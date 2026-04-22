# 🎟️ SYSTÈME DE TICKETS FONCTIONNEL - README

## 📌 État du Système

✅ **COMPLET ET FONCTIONNEL** - Prêt à tester!

---

## 🎯 Qu'est-ce qui a été fait?

### ✅ Backend (Déjà existant, confirmé fonctionnel)
- `POST /api/tickets` - Crée un ticket
- `GET /api/tickets` - Liste tous les tickets
- `GET /api/tickets/{id}` - Détail d'un ticket
- Agents IA en arrière-plan (Scorer + Analyseur)
- BD avec stockage du score et analyse NLP

### ✅ Frontend - Fichiers Modifiés

#### 1. **`src/api/client.ts`**
Création d'un API client TypeScript avec méthodes dédiées:
```typescript
ticketAPI.create(data)              // POST /api/tickets
ticketAPI.list()                    // GET /api/tickets
ticketAPI.getById(id)               // GET /api/tickets/{id}
ticketAPI.recalculateScore(id)      // POST /api/tickets/{id}/score
ticketAPI.getRecommendations(id)    // GET /api/tickets/{id}/recommandations
```

#### 2. **`src/pages/Tickets.tsx`** - Page Créer/Lister Tickets
**Tab "Créer un nouveau ticket":**
- Formulaire complet avec validation
- Champs: Titre, Description, Priorité, Environnement, Application
- Envoi au backend via `ticketAPI.create()`
- Confirmation SweetAlert avec ID du ticket
- Réinitialisation automatique du formulaire

**Tab "Suivre les tickets":**
- Liste tous les tickets avec `ticketAPI.list()`
- Affichage immédiat après création
- Chaque ticket montre:
  - Titre
  - Priorité (couleur code: P1=rouge, P2=orange, etc)
  - Statut (Nouveau, En analyse, Affecté, Résolu)
  - Score quand disponible (avec affichage: "En cours..." ou "75/100")
  - Technologies détectées par l'IA
  - Suggestion IA selon la priorité
- Bouton "Voir les détails et résultats IA" pour chaque ticket

#### 3. **`src/pages/TicketDetails.tsx`** - Page Détails du Ticket (RECRÉÉE)
- Charge les données réelles du backend avec `ticketAPI.getById(id)`
- Affiche les informations complètes:
  - En-tête: Titre, ID, Statut en gros
  - Quick Info: Priorité, Environnement, App, Date
  - Section Description complète
  - **Section Score et Analyse IA:**
    - Score de difficulté 0-100 avec progressbar visualisée
    - Couleur code: 80+ rouge, 60-79 orange, 40-59 jaune, <40 vert
    - Facteurs de complexité (badges)
  - **Section Analyse Détaillée:**
    - Type d'incident (Bug, Performance, Sécurité, etc)
    - Technologies détectées
    - Systèmes impactés
    - Urgence perçue
- Actualisation automatique:
  - Si score n'existe pas → Affiche "⏳ Analyse en cours..."
  - Rafraîchit auto toutes les 5 secondes jusqu'à apparition du score
  - Toggle "Actualiser automatiquement" quand pas de score
  - Bouton "Actualiser" manuel
- Sidebar avec infos rapides

---

## 🚀 Comment démarrer?

### Option 1: Démarrage Rapide (Windows)
```batch
cd c:\Users\Malak\OneDrive\Documents\S2_EMSI\PFA\TMA-Debat
START.bat
```
Choisissez option 3 pour démarrer Backend + Frontend en même temps

### Option 2: Démarrage Manuel (PowerShell)

**Terminal 1 - Backend:**
```powershell
cd c:\Users\Malak\OneDrive\Documents\S2_EMSI\PFA\TMA-Debat
uv run uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\Malak\OneDrive\Documents\S2_EMSI\PFA\TMA-Debat\tma-frontend
npm run dev
```

---

## ✅ Pour tester le flux complet:

1. **Backend démarre:**
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

2. **Frontend démarre:**
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ➜  press h to show help
   ```

3. **Ouvrir le navigateur:**
   ```
   http://localhost:5173/tickets
   ```

4. **Tester le flux:**
   - Cliquer "Créer un nouveau ticket"
   - Remplir le formulaire:
     - Titre: "Test API erreurs 500"
     - Description: "L'API retourne des erreurs depuis ce matin"
     - Priorité: "P1"
     - Environnement: "PROD"
     - Application: "API Gateway"
   - Cliquer "Créer le ticket avec analyse IA"
   - SweetAlert confirme: "Ticket créé avec succès"
   - Cliquer "OK"
   - Passer à l'onglet "Suivre les tickets"
   - Le ticket s'affiche immédiatement
   - Score affiche: "⏳ En cours..."
   - Attendre 5-10 secondes...
   - Score apparaît: "75/100" (par exemple)
   - Cliquer "Voir les détails et résultats IA"
   - Page TicketDetails affiche:
     ```
     Test API erreurs 500
     Score: 75/100 [██████░░]
     
     Facteurs: [connexion_db_probleme] [haute_charge] [prod_environment]
     
     Type d'Incident: 🐛 Bug
     Technologies: [API] [PostgreSQL] [Backend]
     Systèmes Impactés: [backend] [database]
     Urgence Perçue: HAUTE
     ```

---

## 🔧 Configuration Requise

### Backend:
```
OPENAI_API_KEY=sk-... (Requis pour Scorer + Analyseur)
DATABASE_URL=postgresql://... (BD PostgreSQL)
OPENAI_MODEL=gpt-4 (ou gpt-3.5-turbo)
```

### Frontend:
```
Node.js: v16+
npm: v7+
Framework: React + TypeScript + Vite
```

---

## 📊 Architecture Flux Complet

```
CLIENT
  ↓
Tickets.tsx (Formulaire)
  ↓├─ Valide données
  ├─ Appelle: ticketAPI.create(data)
  └─ POST /api/tickets
     ↓
BACKEND
  ├─ Crée ticket en BD (statut="NOUVEAU")
  ├─ Lance en arrière-plan:
  │  ├─ analyseur.py → Extrait technologies, urgence, etc
  │  └─ scorer.py → Calcule score 0-100
  └─ Retourne: {id: "...", message: "..."}
     ↓
CLIENT (Confirmation)
  ├─ Affiche: "Ticket créé"
  ├─ Rafraîchit liste
  └─ Passe à "Suivre les tickets"
     ↓
Tickets.tsx (Liste)
  ├─ Appelle: ticketAPI.list()
  ├─ GET /api/tickets
  └─ Affiche tous les tickets avec score "En cours..."
     ↓ (Après 5-10s quand IA finit)
     ├─ Score apparaît
     └─ Admin clique "Voir les détails"
        ↓
ADMIN
  ├─ TicketDetails.tsx charge
  ├─ Appelle: ticketAPI.getById(id)
  ├─ GET /api/tickets/{id}
  └─ Affiche:
     ├─ Score complet
     ├─ Facteurs de difficulté
     ├─ Type incident
     ├─ Technologies
     ├─ Systèmes impactés
     └─ Urgence perçue
```

---

## 🔍 Points clés

### ⚡ Performance
- Analyse IA lancée **en arrière-plan** (non-bloquant)
- Frontend ne attend pas le score
- Actualisation auto si pas de score

### 🛡️ Robustesse
- Validation des champs côté frontend
- Gestion des erreurs API
- Fallback si OpenAI échoue (score estimé)
- Types TypeScript stricts

### 🎨 UX/UI
- SweetAlert pour les confirmations
- Couleurs pour la priorité et le score
- Badges pour les technologies
- Loading states
- Responsive design

---

## 📝 Fichiers clés créés/modifiés

```
tma-frontend/src/
├─ api/
│  └─ client.ts ✏️ (API client TypeScript)
├─ pages/
│  ├─ Tickets.tsx ✏️ (Formulaire + Liste)
│  └─ TicketDetails.tsx 🆕 (Détails + Analyse IA)
└─ routes/
   └─ AppRouter.tsx ✓ (Routing déjà configuré)

Root/
├─ SETUP_TICKETS.md 📖 (Guide détaillé)
├─ MODIFICATIONS.md 📝 (Résumé changements)
├─ START.bat 🚀 (Démarrage Windows)
├─ START.ps1 🚀 (Démarrage PowerShell)
└─ README_TICKETS.md 📘 (Ce fichier)
```

---

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| **Score n'apparaît pas** | Attendre 10s, vérifier console backend pour erreurs OpenAI |
| **API CORS error** | Vérifier backend démarre avec `add_middleware(CORSMiddleware, ...)" |
| **Ticket ne s'affiche pas en liste** | Rafraîchir page manuellement ou attendre 5s |
| **TicketDetails affiche "Ticket introuvable"** | Vérifier ID dans URL, vérifier GET /api/tickets/{id} fonctionne |
| **Base de données error** | Lancer migrations: `alembic upgrade head` |
| **OPENAI_API_KEY invalide** | Vérifier clé API est valide et définie |

---

## 🎓 Prochaines améliorations optionnelles

- [ ] Statut éditable (Admin peut changer Nouveau → En analyse → Affecté)
- [ ] Assignation de techniciens
- [ ] Commentaires sur les tickets
- [ ] Notifications WebSocket temps réel
- [ ] Export PDF
- [ ] Filtrage/Recherche avancée
- [ ] Dashboard avec statistiques

---

## 📞 Support

Vérifiez:
1. Console du navigateur pour les erreurs côté frontend
2. Terminal backend pour les erreurs serveur
3. Que les ports 8000 et 5173 ne sont pas utilisés
4. Que les variables d'environnement sont définies

---

**✅ Système prêt à l'emploi!**

Lancez `START.bat` (ou `START.ps1`) et testez! 🚀
