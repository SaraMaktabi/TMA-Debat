import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    api.get("/tickets").then((res) => setTickets(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Tickets</h1>

      {tickets.map((t: any) => (
        <div key={t.id} className="border p-3 mt-2">
          <p>{t.title}</p>
        </div>
      ))}
    </div>
  );
}