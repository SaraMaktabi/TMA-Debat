"""
Orchestrateur de débat hybride : GPT-4o-mini (cloud) + Qwen3 (local via Ollama)
Version avec support des questions admin
"""
import aiohttp
import json
from openai import OpenAI
from app.core.config import config

class OrchestrateurHybride:
    def __init__(self, ticket, techniciens):
        self.ticket = ticket
        self.techniciens = techniciens
        self.historique = []
        self.tour_actuel = 0
        self.max_tours = 3
        
        self.openai_client = OpenAI(api_key=config.OPENAI_API_KEY)
        self.ollama_url = "http://localhost:11434/api/generate"
        self.qwen_model = "qwen3:8b"
        
    async def generer_message(self, technicien, question_context: str = None) -> str:
        """
        Génère un message pour un technicien
        Si question_context est fourni, l'agent répond spécifiquement à cette question
        """
        historique_texte = self.formater_historique()
        
        # Ajouter la question de l'admin si présente
        contexte_question = ""
        if question_context:
            contexte_question = f"""
⚠️ L'ADMINISTRATEUR VOUS POSE UNE QUESTION:
{question_context}

Tu dois y répondre directement et précisément.
"""
        
        prompt = f"""
Tu es {technicien.prenom} {technicien.nom}, technicien spécialisé.

TON PROFIL:
- Compétences: {technicien.competences}
- Expérience: {technicien.cv_texte}

TICKET À DÉBATTRE:
Titre: {self.ticket.titre}
Description: {self.ticket.description}
Score: {self.ticket.score_difficulte}/100

HISTORIQUE DU DÉBAT:
{historique_texte if historique_texte else "Début du débat."}

{contexte_question}

RÈGLES:
- Réponds de manière naturelle (conversation WhatsApp)
- Sois concis (2-3 phrases)
- Mets en avant tes compétences spécifiques
- Si une question t'est posée, réponds-y précisément

Réponse:
"""
        
        if technicien.prenom == "Sophie":
            return await self._appel_gpt(prompt)
        else:
            return await self._appel_qwen(prompt)
    
    async def _appel_gpt(self, prompt: str) -> str:
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Tu es un technicien expert backend. Réponds de manière concise et précise."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=300
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ Erreur GPT: {e}")
            return "Je peux résoudre ce ticket avec mon expertise backend."
    
    async def _appel_qwen(self, prompt: str) -> str:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.ollama_url,
                    json={
                        "model": self.qwen_model,
                        "prompt": prompt,
                        "stream": False,
                        "temperature": 0.8,
                        "max_tokens": 300
                    }
                ) as response:
                    resultat = await response.json()
                    return resultat.get("response", "Je peux aider avec ce ticket.").strip()
        except Exception as e:
            print(f"❌ Erreur Qwen3: {e}")
            return "Je peux aider avec ce ticket grâce à mon expertise frontend."
    
    def formater_historique(self) -> str:
        if not self.historique:
            return ""
        texte = ""
        for msg in self.historique:
            texte += f"{msg['agent_nom']}: {msg['contenu']}\n"
        return texte
    
    async def ajouter_message(self, technicien, contenu: str):
        from datetime import datetime
        self.historique.append({
            "agent_id": str(technicien.id),
            "agent_nom": f"{technicien.prenom} {technicien.nom}",
            "contenu": contenu,
            "tour": self.tour_actuel,
            "timestamp": datetime.now().isoformat(),
            "llm": "GPT-4o-mini" if technicien.prenom == "Sophie" else "Qwen3-8B"
        })
    
    async def ajouter_reponse_question(self, technicien, contenu: str, question: str):
        """Ajoute une réponse à une question admin avec contexte"""
        from datetime import datetime
        self.historique.append({
            "agent_id": str(technicien.id),
            "agent_nom": f"{technicien.prenom} {technicien.nom}",
            "contenu": contenu,
            "en_reponse_a": question,
            "type": "reponse_question",
            "tour": self.tour_actuel,
            "timestamp": datetime.now().isoformat(),
            "llm": "GPT-4o-mini" if technicien.prenom == "Sophie" else "Qwen3-8B"
        })
    
    def prochain_agent(self):
        if len(self.historique) == 0:
            return self.techniciens[0]
        dernier = self.historique[-1]
        if dernier["agent_id"] == str(self.techniciens[0].id):
            return self.techniciens[1]
        return self.techniciens[0]
    
    def incrementer_tour(self):
        if len(self.historique) >= 2 and len(self.historique) % 2 == 0:
            self.tour_actuel += 1
    
    def est_termine(self):
        return self.tour_actuel >= self.max_tours
