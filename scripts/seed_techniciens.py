import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.technicien import Technicien
import uuid

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

def seed():
    db = SessionLocal()
    try:
        # Vider la table existante
        deleted = db.query(Technicien).delete()
        print(f"🗑️  {deleted} techniciens supprimés")
        
        # Insérer les nouveaux
        for data in techniciens_data:
            tech = Technicien(
                id=uuid.uuid4(),
                **data,
                disponibilite=True,
                charge_actuelle=0
            )
            db.add(tech)
        
        db.commit()
        print(f"✅ {len(techniciens_data)} techniciens insérés")
        
        # Afficher la liste
        techs = db.query(Technicien).all()
        print("\n📋 Liste des techniciens:")
        for t in techs:
            print(f"   - {t.prenom} {t.nom} ({t.email})")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()