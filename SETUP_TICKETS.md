# 📚 Guide Complet: Système de Tickets Fonctionnel

## 🎯 Flux Complet (Client → Backend → Admin)

### **1️⃣ CLIENT ENVOIE UN TICKET**

#### Frontend (Tickets.tsx - Formulaire)
```
Client remplissage le formulaire:
├─ Titre: "L'API retourne des erreurs 500"
├─ Description: "Depuis ce matin, l'API crash..."
├─ Priorité: "P1" (Critique)
├─ Environnement: "PROD"
└─ Application: "API Gateway"

↓

boutton "Créer le ticket avec analyse IA" cliqué
↓

Appel API: ticketAPI.create(ticketData)
  └─ POST /api/tickets
     ├─ titre: "L'API retourne des erreurs 500"
     ├─ description: "Depuis ce matin, l'API crash..."
     ├─ priorite: "P1"
     ├─ environnement: "PROD"
     └─ application: "API Gateway"
```

---

### **2️⃣ BACKEND REÇOIT & TRAITE**

#### Backend (app/routers/tickets.py)
```
POST /api/tickets
  ├─ Crée un ticket en BD avec statut="NOUVEAU"
  ├─ Retourne immediately l'ID du ticket au client
  └─ Lance en arrière-plan:
     ├─ Agent ANALYSEUR (analyseur.py)
     │   ├─ Extrait les technologies (Frontend, API, etc)
     │   ├─ Détecte le type d'incident (bug, performance, etc)
     │   ├─ Identifie les systèmes impactés
     │   └─ Retourne: {technologies, type_incident, urgence_percue}
     │
     └─ Agent SCORER (scorer.py)
         ├─ Calcule score de difficulté 0-100
         ├─ Prend en compte:
         │   ├─ Priorité (P1=+30 pts)
         │   ├─ Environnement (PROD=+20 pts)
         │   ├─ Complexité du titre/description
         │   └─ Historique si disponible
         └─ Retourne: {score: 75, facteurs: ["connexion_db", "haute_charge"]}

↓
Une fois analysé et scoré → Met à jour le ticket en BD:
  ├─ score_difficulte = 75
  ├─ facteurs_score = ["facteur1", "facteur2"]
  ├─ analyse_nlp = {technologies: [...], type_incident: "bug", ...}
  └─ statut reste "NOUVEAU"
```

---

### **3️⃣ ADMIN VOIT LE TICKET DANS LA LISTE**

#### Frontend (Tickets.tsx - Liste)
```
GET /api/tickets
  ├─ Récupère tous les tickets (ordonnés par date DESC)
  │
  └─ Pour chaque ticket affiche:
     ├─ Titre
     ├─ Score (si disponible) - ex: "75/100" en rouge
     ├─ Statut: "Nouveau"
     ├─ Priorité: "P1"
     ├─ Technologies détectées (badges violets)
     ├─ Créé le: "22 avril 2026"
     └─ Bouton "Voir les détails et résultats IA"
```

---

### **4️⃣ ADMIN CLIQUE "VOIR LES DÉTAILS"**

#### Frontend (TicketDetails.tsx)
```
Clique sur "Voir les détails" → /ticket/{ticketId}

GET /api/tickets/{ticketId}
  ├─ Récupère le ticket complet avec:
  │   ├─ titre
  │   ├─ description
  │   ├─ priorite
  │   ├─ score_difficulte: 75
  │   ├─ facteurs_score: ["connexion_db", "haute_charge"]
  │   └─ analyse_nlp: {
  │       ├─ technologies: ["API", "PostgreSQL"]
  │       ├─ type_incident: "bug"
  │       ├─ systemes_impactes: ["backend", "database"]
  │       └─ urgence_percue: "haute"
  │     }
  │
  ↓
  Affichage TicketDetails montre:
  ├─ En-tête avec Titre + ID
  ├─ Quick Info: Priorité, Environnement, App, Date
  ├─ Description complète
  ├─ SCORE EN GROS (75/100 - difficulté moyenne-haute)
  ├─ Facteurs de complexité (badges gris)
  ├─ Type d'Incident: 🐛 Bug
  ├─ Technologies Détectées: API, PostgreSQL (badges violets)
  ├─ Systèmes Impactés: backend, database (badges bleus)
  └─ Urgence Perçue: HAUTE (badge orange)

💡 Si score n'existe pas = Affiche "⏳ Analyse en cours..."
   et raffraîchit automatiquement toutes les 5 secondes
```

---

## 🔧 CONFIGURATION NECESSAIRE

### Backend (déjà fait):

1. ✅ Modèle `Ticket` (app/models/ticket.py)
   - Stocke: titre, description, score, facteurs, analyse_nlp, etc.

2. ✅ Router Tickets (app/routers/tickets.py)
   - `POST /api/tickets` → Crée ticket + lance analyse/score en arrière-plan
   - `GET /api/tickets` → Liste tous les tickets
   - `GET /api/tickets/{id}` → Détail d'un ticket
   - `POST /api/tickets/{id}/score` → Recalcule score manuellement

3. ✅ Agents IA:
   - `analyseur.py` → Extrait technologies, type incident, urgence
   - `scorer.py` → Calcule score difficulté 0-100

### Frontend (À faire absolument):

1. ✅ API Client (src/api/client.ts)
   ```typescript
   ticketAPI.create(data)      // Créer ticket
   ticketAPI.list()            // Lister tous tickets
   ticketAPI.getById(id)       // Détail ticket
   ticketAPI.recalculateScore(id)  // Recalculer score
   ```

2. ✅ Tickets.tsx
   - ✅ Formulaire création
   - ✅ Liste tickets avec score
   - ✅ Bouton "Voir détails"

3. ✅ TicketDetails.tsx
   - ✅ Affiche score + facteurs
   - ✅ Affiche technologies détectées
   - ✅ Affiche type incident
   - ✅ Affiche urgence percue
   - ✅ Rafraîchissement automatique si pas de score

---

## ✅ CHECKLIST POUR DÉMARRER

- [ ] Backend lancé: `uv run uvicorn app.main:app --reload --port 8000`
- [ ] Frontend lancé: `cd tma-frontend && npm run dev`
- [ ] Base de données créée/migrée
- [ ] Variables d'environnement backend (OPENAI_API_KEY, etc.)
- [ ] Tester flux:
  1. Aller sur http://localhost:5173/tickets
  2. Créer un ticket "Test"
  3. Voir dans la liste
  4. Cliquer "Voir détails"
  5. Voir score/analyse après quelques secondes

---

## 🐛 Troubleshooting

### Le score n'apparaît pas?
- ✅ Attendre 5-10 secondes (analyse en cours)
- ✅ Vérifier console backend pour erreurs OpenAI
- ✅ Vérifier OPENAI_API_KEY est valide

### Impossible de créer ticket?
- ✅ Vérifier GET /api/tickets fonctionne d'abord
- ✅ Vérifier console du navigateur pour erreur CORS
- ✅ Vérifier backend est actif

### Les détails vides?
- ✅ Vérifier endpoint GET /api/tickets/{id} retourne les données
- ✅ Vérifier ID ticket est exact dans l'URL

---

## 📊 Structure Données Ticket

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "titre": "L'API retourne des erreurs 500",
  "description": "Depuis ce matin, l'API crash quand...",
  "priorite": "P1",
  "statut": "NOUVEAU",
  "environnement": "PROD",
  "application": "API Gateway",
  "score_difficulte": 75,
  "facteurs_score": [
    "connexion_db_probleme",
    "haute_charge",
    "prod_environment"
  ],
  "analyse_nlp": {
    "technologies": ["API", "PostgreSQL", "Backend"],
    "type_incident": "bug",
    "systemes_impactes": ["backend", "database"],
    "urgence_percue": "haute"
  },
  "created_at": "2026-04-22T14:30:00",
  "updated_at": "2026-04-22T14:35:00"
}
```

---

## 🚀 C'est prêt! Teste maintenant!
