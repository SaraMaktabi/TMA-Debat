#!/usr/bin/env python3
from app.database import SessionLocal
from app.models.technicien import Technicien
from app.models.ticket import Ticket
from app.agents.profil import recommander_techniciens_detaillees


def main():
    db = SessionLocal()
    techs = db.query(Technicien).all()
    target = None
    for t in techs:
        name = f"{t.prenom or ''} {t.nom or ''}".strip().lower()
        if 'malak' in name or 'zahid' in name:
            target = t
            break

    if not target:
        print('TECHNICIEN NOT FOUND')
        return

    print('TECHNICIEN', target.id, f"{target.prenom} {target.nom}")
    tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).limit(200).all()
    any_found = False
    for tk in tickets:
        analyse = tk.analyse_nlp or {'titre': tk.titre, 'description': tk.description}
        try:
            res = recommander_techniciens_detaillees(analyse, db, limit=10)
        except Exception:
            continue
        for r in res:
            if r['id'] == str(target.id):
                any_found = True
                print('TICKET:', tk.titre)
                print(' SCORE:', r['score_compatibilite'])
                print(' TOP_COMPETENCES:', r.get('top_competences'))
                print(' HISTORIQUE:', r.get('historique'))
                print(' RAISONS:')
                for reason in r.get('raisons') or []:
                    print('  -', reason)
                print('----')

    if not any_found:
        print('No recommendation hits in last 200 tickets for this technician.')


if __name__ == '__main__':
    main()
