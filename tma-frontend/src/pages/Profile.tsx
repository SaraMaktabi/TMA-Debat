import { useState } from "react";
import { getSession, saveSession } from "../utils/auth";
import { userAPI } from "../api/client";
import Swal from "sweetalert2";

export default function Profile() {
  const session = getSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto mt-24 p-6">
        <p className="text-center text-gray-600">Vous devez être connecté pour voir votre profil.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const payload = {
        nom: name,
        prenom: "",
        email,
        role: session.role || "Client",
        department: "",
        phone: "",
      };

      const updated = await userAPI.update(session.id, payload as any);

      const updatedSession = { ...session, name: updated.name, email: updated.email };
      saveSession(updatedSession);

      Swal.fire({ icon: "success", title: "Profil mis à jour", timer: 1400, showConfirmButton: false, toast: true, position: "top-end" });
      setEditing(false);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Erreur", text: err?.message || "Impossible de mettre à jour le profil" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6">
      <h1 className="text-2xl font-semibold mb-4">Mon profil</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className={`mt-1 block w-full rounded-md border-gray-200 ${editing ? "bg-white" : "bg-gray-50"}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className={`mt-1 block w-full rounded-md border-gray-200 ${editing ? "bg-white" : "bg-gray-50"}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <div className="mt-1 text-gray-700">{session.role}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-[var(--edu-primary)] text-white rounded-lg">Modifier</button>
          ) : (
            <>
              <button onClick={handleSave} className="px-4 py-2 bg-[var(--edu-primary)] text-white rounded-lg">Enregistrer</button>
              <button onClick={() => { setEditing(false); setName(session.name); setEmail(session.email); }} className="px-4 py-2 border rounded-lg">Annuler</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
