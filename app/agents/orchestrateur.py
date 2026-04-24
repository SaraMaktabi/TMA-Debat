from openai import OpenAI
from app.core.config import config

client = OpenAI(api_key=config.OPENAI_API_KEY)

class OrchestrateurDebat:
    def __init__(self, ticket, techniciens):
        self.ticket = ticket
        self.techniciens = techniciens  # Liste de 2 techniciens
        self.historique = []
        self.tour_actuel = 0
        self.max_tours = 3  # 3 échanges max
        
    async def generer_message(self, technicien) -> str:
        """Génère un message pour un technicien"""
        
        historique_texte = ""
        for msg in self.historique:
            historique_texte += f"{msg['agent_nom']}: {msg['contenu']}\n"
        
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
        {historique_texte if historique_texte else "Le débat commence. Sois le premier à argumenter."}
        
        RÈGLES:
        - Réponds de manière naturelle, comme dans une conversation WhatsApp
        - Sois concis (2-3 phrases maximum)
        - Mets en avant tes compétences spécifiques
        - Si tu vois une faiblesse chez l'autre, contre-argumente poliment
        
        Génère TA RÉPONSE MAINTENANT:
        """
        
        try:
            response = client.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Tu es un technicien expert qui argumente pour obtenir un ticket."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"❌ Erreur génération: {e}")
            return f"Je pense être adapté car je maîtrise les technologies requises pour ce ticket."
    
    async def ajouter_message(self, technicien, contenu: str):
        """Ajoute un message à l'historique"""
        from datetime import datetime
        self.historique.append({
            "agent_id": str(technicien.id),
            "agent_nom": f"{technicien.prenom} {technicien.nom}",
            "contenu": contenu,
            "tour": self.tour_actuel,
            "timestamp": datetime.now().isoformat()
        })
    
    def prochain_agent(self):
        """Retourne le prochain agent qui doit parler"""
        if len(self.historique) == 0:
            return self.techniciens[0]
        dernier = self.historique[-1]
        if dernier["agent_id"] == str(self.techniciens[0].id):
            return self.techniciens[1]
        return self.techniciens[0]
    
    def incrementer_tour(self):
        """Incrémente le tour après chaque échange complet"""
        if len(self.historique) >= 2 and len(self.historique) % 2 == 0:
            self.tour_actuel += 1
    
    def est_termine(self):
        return self.tour_actuel >= self.max_tours
