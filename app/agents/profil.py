from sqlalchemy.orm import Session
from app.models.technicien import Technicien

def recommander_techniciens(analyse_nlp: dict, db: Session, limit=2):
    """Recommande des techniciens basé sur technologies ET systemes_impactes"""
    
    technologies = analyse_nlp.get("technologies", [])
    systemes_impactes = analyse_nlp.get("systemes_impactes", [])
    
    print(f"🔍 Technologies détectées: {technologies}")
    print(f"🔍 Systèmes impactés: {systemes_impactes}")
    
    tous_techniciens = db.query(Technicien).filter(
        Technicien.disponibilite == True,
        Technicien.charge_actuelle < 5
    ).all()
    
    scores = []
    for tech in tous_techniciens:
        score = 0
        competences_tech = tech.competences or {}
        
        # 1. Matching sur les technologies
        for tech_demandee in technologies:
            tech_lower = tech_demandee.lower()
            for comp, niveau in competences_tech.items():
                comp_lower = comp.lower()
                if tech_lower in comp_lower or comp_lower in tech_lower:
                    score += niveau * 10
                    print(f"   ✅ {tech.prenom} match {tech_demandee} → +{niveau*10}")
        
        # 2. Matching sur les systèmes impactés
        for systeme in systemes_impactes:
            systeme_lower = systeme.lower()
            if systeme_lower == "frontend" and any(c in competences_tech for c in ["React", "Vue", "Angular", "Tailwind", "TypeScript"]):
                score += 30
                print(f"   ✅ {tech.prenom} expert frontend → +30")
            if systeme_lower == "backend" and any(c in competences_tech for c in ["Python", "FastAPI", "Node.js", "Java"]):
                score += 30
            if systeme_lower == "database" and any(c in competences_tech for c in ["PostgreSQL", "SQL", "Oracle"]):
                score += 30
        
        scores.append({"technicien": tech, "score": min(100, score)})
    
    scores.sort(key=lambda x: x["score"], reverse=True)
    return [s["technicien"] for s in scores[:limit]]
