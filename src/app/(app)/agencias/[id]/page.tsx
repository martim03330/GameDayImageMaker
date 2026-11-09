import { notFound } from "next/navigation";
import { agencyPlayers, TRIAL_PLAYERS, weekEdits, weekLook } from "@/lib/agencies/clients";
import { getAgency } from "@/lib/agencies/store";
import { fileUrl } from "@/lib/storage";
import { TEMPLATES } from "@/templates";
import { AgencyClient } from "./AgencyClient";

export const dynamic = "force-dynamic";

/** One client agency (free trial or paying): logo, players, this week's look and edits. */
export default async function AgencyClientPage({ params }: { params: Promise<{ id: string }> }) {
  const a = getAgency((await params).id);
  if (!a) notFound();
  const wl = weekLook(a.id);
  const label = (id: string) => TEMPLATES.find((t) => t.id === id)?.label ?? id;
  return (
    <AgencyClient
      agency={{ id: a.id, name: a.name, status: a.status, instagram: a.instagram, players: a.players, logo: fileUrl(a.logo), logoWhite: fileUrl(a.logo_white) }}
      linked={agencyPlayers(a.id)}
      trialLimit={a.status === "teste" ? TRIAL_PLAYERS : null}
      week={{ ...wl, free: wl.free.map((id) => ({ id, label: label(id) })), bookedLabel: wl.booked ? label(wl.booked) : null, suggestedLabel: wl.suggested ? label(wl.suggested) : null }}
      edits={weekEdits(a.id, wl.week)}
    />
  );
}
