"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  usePendingIdentityVerification,
  useReviewAgentIdentity,
  type IdentityPendingAgent,
} from "@/lib/queries/agents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loading } from "@/components/common/loading";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AgentsVerification() {
  const { data: agents = [], isLoading } = usePendingIdentityVerification();
  const review = useReviewAgentIdentity();

  const [selected, setSelected] = useState<IdentityPendingAgent | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  function openAgent(agent: IdentityPendingAgent) {
    setSelected(agent);
    setRejectionReason("");
    setShowRejectInput(false);
  }

  async function handleApprove() {
    if (!selected) return;
    try {
      await review.mutateAsync({ id: selected.id, approved: true });
      toast.success(`${selected.name} approuvé — document vérifié`);
      setSelected(null);
    } catch {
      toast.error("Erreur lors de l'approbation");
    }
  }

  async function handleReject() {
    if (!selected) return;
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    try {
      await review.mutateAsync({
        id: selected.id,
        approved: false,
        reason: rejectionReason.trim() || "Non conforme",
      });
      toast.success(`Document de ${selected.name} refusé`);
      setSelected(null);
    } catch {
      toast.error("Erreur lors du refus");
    }
  }

  if (isLoading) return <Loading label="Chargement des vérifications…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-1 h-6 bg-brand-blue rounded-full" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Vérification d'identité</h2>
          <p className="text-xs text-muted-foreground">
            {agents.length === 0 ? "Aucun dossier en attente" : `${agents.length} dossier${agents.length > 1 ? "s" : ""} en attente`}
          </p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="border rounded-xl p-10 text-center text-muted-foreground text-sm">
          Aucun agent n'a soumis de documents pour l'instant.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date soumission</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => openAgent(agent)}
                >
                  <td className="px-4 py-3 font-medium">{agent.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{agent.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{agent.agentType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(agent.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                      En attente
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Agent detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dossier — {selected?.name}</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5">
              {/* Identity details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Date de naissance</p>
                  <p className="font-medium">{formatDate(selected.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Commune de résidence</p>
                  <p className="font-medium">{selected.residenceCommune ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Type d'agent</p>
                  <p className="font-medium">{selected.agentType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Communes d'opération</p>
                  <p className="font-medium">{selected.communes.join(", ") || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Email</p>
                  <p className="font-medium">{selected.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Téléphone</p>
                  <p className="font-medium">{selected.phoneNumber ?? "—"}</p>
                </div>
              </div>

              {/* ID card photo */}
              {selected.idDocumentUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Photo de la carte d'identité</p>
                  <a href={selected.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.idDocumentUrl}
                      alt="Carte d'identité"
                      className="rounded-lg border max-h-52 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <p className="text-xs text-blue-500 mt-1">Ouvrir en plein écran →</p>
                  </a>
                </div>
              )}

              {/* Selfie */}
              {selected.selfieUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Selfie tenant la carte</p>
                  <a href={selected.selfieUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.selfieUrl}
                      alt="Selfie"
                      className="rounded-lg border max-h-52 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <p className="text-xs text-blue-500 mt-1">Ouvrir en plein écran →</p>
                  </a>
                </div>
              )}

              {/* Rejection reason input */}
              {showRejectInput && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Motif du refus</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                    rows={3}
                    placeholder="Ex: Photo floue, carte expirée, identité non lisible…"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleApprove}
                  disabled={review.isPending || showRejectInput}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {review.isPending ? "En cours…" : "✓ Approuver"}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={review.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  {showRejectInput ? "Confirmer le refus" : "✗ Refuser"}
                </Button>
                {showRejectInput && (
                  <Button
                    variant="outline"
                    onClick={() => { setShowRejectInput(false); setRejectionReason(""); }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
