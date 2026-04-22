from openai import OpenAI
import json
from app.core.config import config

client = OpenAI(api_key=config.OPENAI_API_KEY)

async def analyser_technologies(titre: str, description: str) -> dict:
    prompt = f"""
    Analyse ce ticket d'incident et extrais les informations techniques.
    
    TITRE: {titre}
    DESCRIPTION: {description}
    
    EXTRACTION DES TECHNOLOGIES - Sois précis:
    - Si ticket parle d'interface, frontend, thème, CSS, React, Vue, Angular → technologies: ["Frontend", "React"] (ou la technologie mentionnée)
    - Si ticket parle de base de données, SQL, PostgreSQL → technologies: ["PostgreSQL", "SQL"]
    - Si ticket parle d'API, backend, Python, FastAPI → technologies: ["API", "Python", "FastAPI"]
    - Si ticket parle de Docker, déploiement → technologies: ["Docker"]
    
    Réponds UNIQUEMENT au format JSON:
    {{
        "technologies": ["techno1", "techno2"],
        "type_incident": "bug|performance|securite|donnees|question|autre",
        "systemes_impactes": ["frontend", "backend", "database", "api"],
        "urgence_percue": "basse|moyenne|haute|critique"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        resultat = json.loads(response.choices[0].message.content)
        print(f"✅ OpenAI Analyseur réponse: {resultat}")
        return {
            "technologies": resultat.get("technologies", []),
            "type_incident": resultat.get("type_incident", "autre"),
            "systemes_impactes": resultat.get("systemes_impactes", []),
            "urgence_percue": resultat.get("urgence_percue", "moyenne")
        }
    except Exception as e:
        print(f"❌ Erreur analyseur OpenAI: {e}")
        # Fallback basé sur mots-clés
        print(f"⚠️ Utilisation du fallback pour analyseur")
        technologies = []
        texte = (titre + " " + description).lower()
        
        # Détection technologies
        if any(word in texte for word in ["front", "interface", "theme", "react", "css", "ui"]):
            technologies.append("Frontend")
        if any(word in texte for word in ["postgresql", "sql", "base de donnee", "bdd"]):
            technologies.append("PostgreSQL")
        if any(word in texte for word in ["api", "backend", "python", "fastapi"]):
            technologies.append("API")
        if any(word in texte for word in ["docker", "deploiement", "container"]):
            technologies.append("Docker")
        
        # Détection type incident
        type_incident = "autre"
        if any(word in texte for word in ["bug", "erreur", "crash", "fonctionne pas", "ne marche pas"]):
            type_incident = "bug"
        elif any(word in texte for word in ["lent", "performance", "timeout", "ralentit", "lag"]):
            type_incident = "performance"
        elif any(word in texte for word in ["securite", "hack", "faille", "injection", "auth"]):
            type_incident = "securite"
        elif any(word in texte for word in ["donnee", "data", "corruption", "perte", "backup"]):
            type_incident = "donnees"
        elif any(word in texte for word in ["?", "question", "comment", "quoi", "pourquoi", "aide"]):
            type_incident = "question"
        
        # Détection systèmes impactés
        systemes_impactes = []
        if any(word in texte for word in ["frontend", "interface", "ui"]):
            systemes_impactes.append("frontend")
        if any(word in texte for word in ["backend", "api", "serveur"]):
            systemes_impactes.append("backend")
        if any(word in texte for word in ["database", "postgres", "sql", "bdd"]):
            systemes_impactes.append("database")
        
        # Détection urgence
        urgence = "moyenne"
        if any(word in texte for word in ["critique", "urgent", "down", "cassé", "bloquant", "production"]):
            urgence = "critique"
        elif any(word in texte for word in ["urgent", "important", "vite"]):
            urgence = "haute"
        elif any(word in texte for word in ["lent", "bug mineur", "cosmétique"]):
            urgence = "basse"
        
        resultat = {
            "technologies": technologies if technologies else ["general"],
            "type_incident": type_incident,
            "systemes_impactes": systemes_impactes if systemes_impactes else ["general"],
            "urgence_percue": urgence
        }
        print(f"✅ Fallback retourne: {resultat}")
        return resultat
