#!/bin/bash

echo "========================================="
echo "🎭 DÉBAT HYBRIDE - TEST COMPLET"
echo "========================================="

# 1. Lancer le débat
echo ""
echo "🚀 Lancement du débat hybride..."
RESPONSE=$(curl -s -X POST "http://localhost:8000/api/debat/lancer-hybride/af0caeb6-e0ae-4b0d-ac99-fba13b06dbba")
SESSION_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('session_id', ''))")

if [ -z "$SESSION_ID" ]; then
    echo "❌ Erreur: $RESPONSE"
    exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo "📝 Premier message: $(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['historique'][0]['contenu'][:100])...")"

# 2. Réponse de Thomas (Qwen3)
echo ""
echo "💬 Thomas (Qwen3-8B) répond..."
sleep 2
REPONSE2=$(curl -s -X POST "http://localhost:8000/api/debat/hybride/$SESSION_ID/repondre")
echo "$REPONSE2" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   {d['agent']} ({d['llm']}): {d['message'][:150]}...\")"

# 3. Réponse de Sophie (GPT)
echo ""
echo "💬 Sophie (GPT-4o-mini) répond..."
sleep 2
REPONSE3=$(curl -s -X POST "http://localhost:8000/api/debat/hybride/$SESSION_ID/repondre")
echo "$REPONSE3" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   {d['agent']} ({d['llm']}): {d['message'][:150]}...\")"

# 4. Terminer
echo ""
echo "⚖️ Appel à l'Agent Juge..."
sleep 2
TERMINE=$(curl -s -X POST "http://localhost:8000/api/debat/hybride/$SESSION_ID/terminer")
echo "$TERMINE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   🏆 Gagnant proposé: {d['proposition'].get('gagnant_nom', 'inconnu')}\")"
echo "$TERMINE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"   📝 Raison: {d['proposition'].get('justification', '')[:200]}...\")"

# 5. Valider
echo ""
echo "✅ Validation par l'administrateur..."
curl -s -X POST "http://localhost:8000/api/debat/hybride/$SESSION_ID/valider" \
  -H "Content-Type: application/json" \
  -d '{
    "technicien_id": "6ff4c08d-e0b3-431e-83ca-45da17cad411",
    "raison": "Expertise backend requise pour erreur 500 API",
    "admin_nom": "Chef Projet"
  }' | python3 -m json.tool

echo ""
echo "========================================="
echo "🏁 TEST HYBRIDE TERMINÉ"
echo "========================================="
