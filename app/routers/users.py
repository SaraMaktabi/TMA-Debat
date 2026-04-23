import base64
import hashlib
import hmac
import secrets
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.technicien import Technicien


router = APIRouter()


class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    password: str
    role: str | None = "Technician"
    department: str | None = "Support"
    phone: str | None = ""


class UserUpdate(BaseModel):
    nom: str | None = None
    prenom: str | None = None
    email: str | None = None
    role: str | None = None
    department: str | None = None
    phone: str | None = None
    password: str | None = None


class UserStatusUpdate(BaseModel):
    status: str


class UserLogin(BaseModel):
    email: str
    password: str


def _hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    digest_b64 = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256$100000${salt_b64}${digest_b64}"


def _verify_password(password: str, stored: str | None) -> bool:
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


def _get_user_or_404(user_id: UUID, db: Session) -> Technicien:
    user = db.query(Technicien).filter(Technicien.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user


def _merge_meta(technicien: Technicien, role: str | None, department: str | None, phone: str | None) -> dict:
    competences = technicien.competences if isinstance(technicien.competences, dict) else {}
    existing_meta = competences.get("_meta", {}) if isinstance(competences.get("_meta", {}), dict) else {}

    meta = {
        "role": role if role is not None else existing_meta.get("role", "Technician"),
        "department": (
            department if department is not None else existing_meta.get("department", "Support")
        ),
        "phone": phone if phone is not None else existing_meta.get("phone", ""),
    }

    return {**competences, "_meta": meta}


def _read_password_hash(technicien: Technicien) -> str | None:
    competences = technicien.competences if isinstance(technicien.competences, dict) else {}
    auth_meta = competences.get("_auth", {}) if isinstance(competences.get("_auth", {}), dict) else {}
    password_hash = auth_meta.get("password_hash")
    return password_hash if isinstance(password_hash, str) else None


def _set_password_hash(technicien: Technicien, password_hash: str) -> None:
    competences = technicien.competences if isinstance(technicien.competences, dict) else {}
    auth_meta = competences.get("_auth", {}) if isinstance(competences.get("_auth", {}), dict) else {}
    auth_meta["password_hash"] = password_hash
    technicien.competences = {**competences, "_auth": auth_meta}


def _serialize_user(technicien: Technicien) -> dict:
    competences = technicien.competences or {}
    meta = competences.get("_meta", {}) if isinstance(competences, dict) else {}

    return {
        "id": str(technicien.id),
        "name": f"{technicien.prenom} {technicien.nom}".strip(),
        "email": technicien.email,
        "phone": meta.get("phone", ""),
        "role": meta.get("role", "Technician"),
        "department": meta.get("department", "Support"),
        "status": "Active" if technicien.disponibilite else "Inactive",
        "joinDate": None,
        "lastActive": "N/A",
    }


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(Technicien).order_by(Technicien.prenom.asc(), Technicien.nom.asc()).all()
    return [_serialize_user(user) for user in users]


@router.post("/", status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(Technicien).filter(Technicien.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe deja")

    user = Technicien(
        id=uuid4(),
        nom=payload.nom.strip(),
        prenom=payload.prenom.strip(),
        email=payload.email.strip().lower(),
        competences={
            "_meta": {
                "role": payload.role or "Technician",
                "department": payload.department or "Support",
                "phone": payload.phone or "",
            }
        },
        cv_texte="",
        disponibilite=True,
        charge_actuelle=0,
    )

    if len(payload.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caracteres")

    _set_password_hash(user, _hash_password(payload.password.strip()))

    db.add(user)
    db.commit()
    db.refresh(user)

    return _serialize_user(user)


@router.put("/{user_id}")
def update_user(user_id: UUID, payload: UserUpdate, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)

    if payload.email is not None:
        normalized_email = payload.email.strip().lower()
        existing = (
            db.query(Technicien)
            .filter(Technicien.email == normalized_email, Technicien.id != user_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe deja")
        user.email = normalized_email

    if payload.nom is not None:
        user.nom = payload.nom.strip()
    if payload.prenom is not None:
        user.prenom = payload.prenom.strip()

    user.competences = _merge_meta(user, payload.role, payload.department, payload.phone)

    if payload.password is not None:
        trimmed_password = payload.password.strip()
        if len(trimmed_password) < 6:
            raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caracteres")
        _set_password_hash(user, _hash_password(trimmed_password))

    db.commit()
    db.refresh(user)

    return _serialize_user(user)


@router.patch("/{user_id}/status")
def update_user_status(user_id: UUID, payload: UserStatusUpdate, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)

    if payload.status not in {"Active", "Inactive"}:
        raise HTTPException(status_code=400, detail="Status invalide")

    user.disponibilite = payload.status == "Active"

    db.commit()
    db.refresh(user)

    return _serialize_user(user)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    user = _get_user_or_404(user_id, db)
    db.delete(user)
    db.commit()


@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(Technicien).filter(Technicien.email == payload.email.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    if not user.disponibilite:
        raise HTTPException(status_code=403, detail="Compte inactif")

    password_hash = _read_password_hash(user)
    if not _verify_password(payload.password, password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    serialized = _serialize_user(user)
    return {
        "message": "Connexion reussie",
        "user": serialized,
    }
