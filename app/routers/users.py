import base64
import hashlib
import hmac
from io import BytesIO
import re
import secrets
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

try:
    from docx import Document
except ImportError:
    Document = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from app.database import get_db
from app.models.technicien import Technicien


router = APIRouter()


class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    password: str
    role: str | None = "Employee"
    department: str | None = "Support"
    phone: str | None = ""
    cv_texte: str | None = ""
    competences: str | None = ""


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


def _parse_competences_text(competences_text: str | None) -> dict:
    if not isinstance(competences_text, str):
        return {}

    competences: dict[str, int] = {}
    for chunk in re.split(r"[\n,;]+", competences_text):
        item = chunk.strip()
        if not item:
            continue

        if ":" in item:
            nom, niveau_text = item.split(":", 1)
        elif "=" in item:
            nom, niveau_text = item.split("=", 1)
        else:
            nom, niveau_text = item, "1"

        nom = nom.strip()
        niveau_text = niveau_text.strip()
        if not nom:
            continue

        try:
            niveau = int(float(niveau_text))
        except ValueError:
            continue

        competences[nom] = max(1, min(5, niveau))

    return competences


CV_SKILL_PATTERNS: dict[str, tuple[str, ...]] = {
    "Python": (r"\bpython\b", r"\bfastapi\b", r"\bdjango\b", r"\bflask\b", r"\bpandas\b", r"\bnumpy\b"),
    "JavaScript": (r"\bjavascript\b", r"\bnode\.?js\b", r"\breact\b", r"\bvue\b", r"\bangular\b"),
    "TypeScript": (r"\btypescript\b", r"\bts\b"),
    "React": (r"\breact\b", r"\bnext\.?js\b"),
    "SQL": (r"\bsql\b", r"\bpostgresql\b", r"\bmysql\b", r"\boracle\b"),
    "API": (r"\bapi\b", r"\brest\b", r"\bjson\b", r"\bmicroservices?\b"),
    "Docker": (r"\bdocker\b", r"\bkubernetes\b", r"\bcontainer\w*\b"),
    "Git": (r"\bgit\b", r"\bgithub\b", r"\bgitlab\b"),
    "Linux": (r"\blinux\b", r"\bubuntu\b", r"\bdebian\b"),
    "Windows": (r"\bwindows\b", r"\bactive directory\b"),
    "Réseau": (r"\br[eé]seau\b", r"\bnetwork\b", r"\brouter\b", r"\bswitch\b", r"\btcp/ip\b"),
    "Cybersécurité": (r"\bsecurity\b", r"\bcyber\w*\b", r"\bsiem\b", r"\bendpoint\b"),
    "Support": (r"\bsupport\b", r"\bhelpdesk\b", r"\bservice desk\b", r"\bd[ée]pannage\b", r"\btroubleshoot\w*\b"),
    "HTML": (r"\bhtml\b",),
    "CSS": (r"\bcss\b", r"\btailwind\b", r"\bsass\b"),
    "Java": (r"\bjava\b",),
    "C#": (r"\bc#\b", r"\b\.net\b", r"\basp\.net\b"),
    "PHP": (r"\bphp\b", r"\blaravel\b"),
}


def _extract_text_from_cv_upload(cv_file: UploadFile | None) -> str:
    if cv_file is None:
        return ""

    raw_bytes = cv_file.file.read()
    filename = (cv_file.filename or "").lower()
    content_type = (cv_file.content_type or "").lower()

    if not raw_bytes:
        return ""

    if (filename.endswith(".pdf") or content_type == "application/pdf") and PdfReader is not None:
        try:
            reader = PdfReader(BytesIO(raw_bytes))
            pages_text = []
            for page in reader.pages:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages_text.append(page_text)
            return "\n".join(pages_text).strip()
        except Exception:
            return raw_bytes.decode("utf-8", errors="ignore").strip()

    if (
        (filename.endswith((".docx", ".doc")) or content_type in {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        })
        and Document is not None
    ):
        try:
            document = Document(BytesIO(raw_bytes))
            paragraphs = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
            return "\n".join(paragraphs).strip()
        except Exception:
            return raw_bytes.decode("utf-8", errors="ignore").strip()

    return raw_bytes.decode("utf-8", errors="ignore").strip()


def _normaliser_cv_texte(texte: str) -> str:
    if not isinstance(texte, str):
        return ""

    cleaned = texte.replace("\u00a0", " ")
    cleaned = re.sub(r"(?<=[A-Za-zÀ-ÿ])\s+(?=[A-Za-zÀ-ÿ])", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def _extract_competences_from_cv_text(cv_text: str) -> dict:
    if not isinstance(cv_text, str):
        return {}

    lowered_text = _normaliser_cv_texte(cv_text).lower()
    competences: dict[str, int] = {}

    for skill, patterns in CV_SKILL_PATTERNS.items():
        matches = sum(1 for pattern in patterns if re.search(pattern, lowered_text, flags=re.IGNORECASE))
        if matches:
            competences[skill] = min(5, matches + 1)

    return competences


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


@router.post("/extract-cv-skills")
def extract_cv_skills(
    cv_texte: str = Form(""),
    cv_file: UploadFile | None = File(None),
):
    cv_texte_nettoye = cv_texte.strip() if isinstance(cv_texte, str) else ""
    cv_extrait = _extract_text_from_cv_upload(cv_file)
    texte_cv_final = cv_extrait or cv_texte_nettoye

    if not texte_cv_final:
        raise HTTPException(status_code=400, detail="Ajoutez un CV (fichier ou texte) pour extraire les competences")

    competences_cv = _extract_competences_from_cv_text(texte_cv_final)
    return {
        "competences": competences_cv,
        "cv_texte_extrait": texte_cv_final,
    }


@router.post("/", status_code=201)
def create_user(
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("Employee"),
    department: str = Form("Support"),
    phone: str = Form(""),
    cv_texte: str = Form(""),
    competences: str = Form(""),
    cv_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    role_normalized = (role or "Employee").strip() or "Employee"
    cv_texte_nettoye = cv_texte.strip() if isinstance(cv_texte, str) else ""
    competences_pro = _parse_competences_text(competences)
    cv_extrait = _extract_text_from_cv_upload(cv_file)
    texte_cv_final = cv_extrait or cv_texte_nettoye
    competences_cv = _extract_competences_from_cv_text(texte_cv_final)

    existing = db.query(Technicien).filter(Technicien.email == email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe deja")

    user = Technicien(
        id=uuid4(),
        nom=nom.strip(),
        prenom=prenom.strip(),
        email=email.strip().lower(),
        competences={
            **competences_cv,
            **competences_pro,
            "_meta": {
                "role": role_normalized,
                "department": department or "Support",
                "phone": phone or "",
            }
        },
        cv_texte=texte_cv_final,
        disponibilite=True,
        charge_actuelle=0,
    )

    if len(password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit contenir au moins 6 caracteres")

    _set_password_hash(user, _hash_password(password.strip()))

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
    email = payload.email.strip().lower()
    print(f"\n[LOGIN] Email recu: {email}")
    print(f"[LOGIN] Password recu: {'*' * len(payload.password)}")
    
    user = db.query(Technicien).filter(Technicien.email == email).first()
    if not user:
        print(f"[LOGIN] User NOT found for {email}")
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    print(f"[LOGIN] User found: {user.prenom} {user.nom}")
    
    if not user.disponibilite:
        raise HTTPException(status_code=403, detail="Compte inactif")

    password_hash = _read_password_hash(user)
    print(f"[LOGIN] Password hash exists: {password_hash is not None}")
    if password_hash:
        print(f"[LOGIN] Hash starts with: {password_hash[:40]}...")
    
    if not _verify_password(payload.password, password_hash):
        print(f"[LOGIN] Password verification FAILED")
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    print(f"[LOGIN] Password verification OK - Login successful")
    serialized = _serialize_user(user)
    return {
        "message": "Connexion reussie",
        "user": serialized,
    }
