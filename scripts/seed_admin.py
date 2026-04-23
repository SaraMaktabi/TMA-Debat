import base64
import hashlib
import hmac
import os
import secrets
import sys
import uuid
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.technicien import Technicien


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    digest_b64 = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256$100000${salt_b64}${digest_b64}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored:
        return False

    try:
        algorithm, rounds_text, salt_b64, digest_b64 = stored.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        rounds = int(rounds_text)
        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_digest = base64.b64decode(digest_b64.encode("ascii"))
    except (ValueError, TypeError):
        return False

    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, rounds)
    return hmac.compare_digest(candidate, expected_digest)


def read_password_hash(user: Technicien) -> str | None:
    competences = user.competences if isinstance(user.competences, dict) else {}
    auth_meta = competences.get("_auth", {}) if isinstance(competences.get("_auth", {}), dict) else {}
    password_hash = auth_meta.get("password_hash")
    return password_hash if isinstance(password_hash, str) else None


def set_password_hash(user: Technicien, password_hash: str) -> None:
    competences = user.competences if isinstance(user.competences, dict) else {}
    auth_meta = competences.get("_auth", {}) if isinstance(competences.get("_auth", {}), dict) else {}
    auth_meta["password_hash"] = password_hash
    user.competences = {**competences, "_auth": auth_meta}


def seed_admin() -> None:
    admin_email = os.getenv("ADMIN_EMAIL", "admin@tma.local").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!").strip()
    admin_nom = os.getenv("ADMIN_NOM", "System")
    admin_prenom = os.getenv("ADMIN_PRENOM", "Admin")
    admin_phone = os.getenv("ADMIN_PHONE", "+212600000000")
    admin_department = os.getenv("ADMIN_DEPARTMENT", "Administration")

    if len(admin_password) < 6:
        raise ValueError("ADMIN_PASSWORD doit contenir au moins 6 caracteres")

    db = SessionLocal()
    try:
        user = db.query(Technicien).filter(Technicien.email == admin_email).first()

        if user is None:
            user = Technicien(
                id=uuid.uuid4(),
                nom=admin_nom,
                prenom=admin_prenom,
                email=admin_email,
                competences={},
                cv_texte="",
                disponibilite=True,
                charge_actuelle=0,
            )
            db.add(user)

        competences = user.competences if isinstance(user.competences, dict) else {}
        meta = competences.get("_meta", {}) if isinstance(competences.get("_meta", {}), dict) else {}
        meta["role"] = "Admin"
        meta["department"] = admin_department
        meta["phone"] = admin_phone
        user.competences = {**competences, "_meta": meta}
        user.nom = admin_nom
        user.prenom = admin_prenom
        user.disponibilite = True

        existing_hash = read_password_hash(user)
        if not verify_password(admin_password, existing_hash):
            set_password_hash(user, hash_password(admin_password))

        db.commit()
        db.refresh(user)

        print("Admin pret.")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
