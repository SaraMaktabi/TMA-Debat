"""
Gestionnaire de sessions persistantes (stockées en base)
"""
import pickle
from sqlalchemy import text
from app.database import SessionLocal

class SessionManager:
    """Gère les sessions d'orchestrateur avec persistance"""
    
    _sessions_cache = {}  # Cache mémoire pour performance
    
    @classmethod
    def save(cls, session_id: str, orchestrateur):
        """Sauvegarde une session en base et en cache"""
        # Sauvegarder en cache
        cls._sessions_cache[session_id] = orchestrateur
        
        # Sauvegarder en base (sérialisation)
        db = SessionLocal()
        try:
            session_data = pickle.dumps(orchestrateur)
            db.execute(
                text("""
                    INSERT INTO sessions_actives (session_id, session_data, updated_at)
                    VALUES (:sid, :data, NOW())
                    ON CONFLICT (session_id) 
                    DO UPDATE SET session_data = :data, updated_at = NOW()
                """),
                {"sid": session_id, "data": session_data}
            )
            db.commit()
        except Exception as e:
            print(f"❌ Erreur sauvegarde session: {e}")
            db.rollback()
        finally:
            db.close()
    
    @classmethod
    def get(cls, session_id: str):
        """Récupère une session (cache d'abord, puis base)"""
        # Vérifier le cache
        if session_id in cls._sessions_cache:
            return cls._sessions_cache[session_id]
        
        # Récupérer depuis la base
        db = SessionLocal()
        try:
            result = db.execute(
                text("SELECT session_data FROM sessions_actives WHERE session_id = :sid"),
                {"sid": session_id}
            ).fetchone()
            
            if result:
                orchestrateur = pickle.loads(result[0])
                cls._sessions_cache[session_id] = orchestrateur
                return orchestrateur
        except Exception as e:
            print(f"❌ Erreur récupération session: {e}")
        finally:
            db.close()
        
        return None
    
    @classmethod
    def delete(cls, session_id: str):
        """Supprime une session"""
        # Supprimer du cache
        if session_id in cls._sessions_cache:
            del cls._sessions_cache[session_id]
        
        # Supprimer de la base
        db = SessionLocal()
        try:
            db.execute(
                text("DELETE FROM sessions_actives WHERE session_id = :sid"),
                {"sid": session_id}
            )
            db.commit()
        except Exception as e:
            print(f"❌ Erreur suppression session: {e}")
        finally:
            db.close()
    
    @classmethod
    def restore_all(cls):
        """Restaure toutes les sessions au démarrage"""
        db = SessionLocal()
        try:
            results = db.execute(text("SELECT session_id, session_data FROM sessions_actives"))
            for row in results:
                session_id, data = row
                try:
                    orchestrateur = pickle.loads(data)
                    cls._sessions_cache[session_id] = orchestrateur
                    print(f"✅ Session restaurée: {session_id}")
                except Exception as e:
                    print(f"⚠️ Erreur restauration {session_id}: {e}")
        except Exception as e:
            print(f"⚠️ Table sessions_actives peut-être pas encore créée: {e}")
        finally:
            db.close()
