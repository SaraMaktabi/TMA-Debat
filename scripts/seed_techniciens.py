import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.technicien import Technicien
import uuid


SEED_SOURCE = "seed_techniciens"

techniciens_data = [
    {
        "nom": "Martin",
        "prenom": "Sophie",
        "email": "sophie.martin@techcorp.com",
        "competences": {"Python": 5, "FastAPI": 5, "PostgreSQL": 4, "Docker": 4},
        "cv_texte": "5 ans d'expérience backend Python. Spécialisée en APIs haute performance.",
    },
    {
        "nom": "Dubois",
        "prenom": "Thomas",
        "email": "thomas.dubois@techcorp.com",
        "competences": {"React": 5, "TypeScript": 5, "Node.js": 4, "Tailwind": 5},
        "cv_texte": "Expert frontend React/TypeScript. 4 ans sur applications complexes.",
    },
    {
        "nom": "Bernard",
        "prenom": "Julie",
        "email": "julie.bernard@techcorp.com",
        "competences": {"DevOps": 5, "Docker": 5, "Kubernetes": 4, "AWS": 5},
        "cv_texte": "Ingénieure DevOps confirmée. Infrastructure as Code.",
    },
    {
        "nom": "Petit",
        "prenom": "Nicolas",
        "email": "nicolas.petit@techcorp.com",
        "competences": {"Java": 5, "Spring Boot": 5, "Hibernate": 4, "Oracle": 4},
        "cv_texte": "Architecte Java back-end. 8 ans sur systèmes critiques.",
    },
]


def _build_competences(competences: dict) -> dict:
    base = competences if isinstance(competences, dict) else {}
    meta = {
        "role": "Technician",
        "source": SEED_SOURCE,
    }
    return {**base, "_meta": meta}

def seed():
    db = SessionLocal()
    try:
        # Insérer/mettre à jour seulement les profils seed techniciens
        inserted = 0
        updated = 0

        for data in techniciens_data:
            email = data["email"].strip().lower()
            existing = db.query(Technicien).filter(Technicien.email == email).first()

            if existing:
                existing.nom = data["nom"]
                existing.prenom = data["prenom"]
                existing.cv_texte = data["cv_texte"]
                existing.competences = _build_competences(data["competences"])
                existing.disponibilite = True
                existing.charge_actuelle = 0
                updated += 1
                continue

            tech = Technicien(
                id=uuid.uuid4(),
                nom=data["nom"],
                prenom=data["prenom"],
                email=email,
                competences=_build_competences(data["competences"]),
                cv_texte=data["cv_texte"],
                disponibilite=True,
                charge_actuelle=0,
            )
            db.add(tech)
            inserted += 1
        
        db.commit()
        print(f" {inserted} techniciens insérés")
        print(f" {updated} techniciens mis à jour")
        
        # Afficher uniquement les profils seed techniciens
        techs = db.query(Technicien).all()
        print("\n Liste des techniciens seed:")
        for t in techs:
            competences = t.competences if isinstance(t.competences, dict) else {}
            meta = competences.get("_meta", {}) if isinstance(competences.get("_meta", {}), dict) else {}
            if str(meta.get("source", "")).strip().lower() != SEED_SOURCE:
                continue
            print(f"   - {t.prenom} {t.nom} ({t.email})")
            
    except Exception as e:
        print(f" Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()