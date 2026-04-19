import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminOfferData } from "../../api/Apis";

const resolveJobLabel = (jobId?: AdminOfferData["jobId"]) => {
  if (!jobId) return "-";
  // API may return populated job object or plain job id.
  if (typeof jobId === "string") return jobId;
  return jobId.title || jobId._id || "-";
};

const resolveProviderLabel = (provider?: AdminOfferData["serviceProviderId"]) => {
  if (!provider) return "-";
  // API may return populated provider object or plain provider id.
  if (typeof provider === "string") return provider;
  return provider.fullName || provider.email || provider._id || "-";
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<AdminOfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchOffers();
      setOffers(response.data.offers || []);
    } catch (err) {
      console.error("Failed to load offers", err);
      setError("Unable to load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusUpdate = async (
    offerId: string,
    status: "pending" | "accepted" | "rejected",
  ) => {
    try {
      setUpdatingId(offerId);
      setError(null);
      await AdminApi.updateOffer(offerId, { status });
      // Refresh list to reflect latest offer status from backend.
      await fetchOffers();
    } catch (err) {
      console.error("Failed to update offer", err);
      setError("Unable to update offer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (offerId: string) => {
    setDeleteTarget(offerId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget);
      setError(null);
      await AdminApi.deleteOffer(deleteTarget);
      // Re-fetch to remove deleted offer from current table.
      await fetchOffers();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete offer", err);
      setError("Unable to delete offer.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <p className="text-(--muted) text-sm">Admin Console</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">Offers Moderation</h1>
          </div>

          {error && (
            <div className="bg-(--danger-bg) text-(--danger) border border-(--border) rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-(--accent) animate-spin" />
            </div>
          ) : (
            <div className="bg-(--primary) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--secondary)">
                <h2 className="text-lg font-semibold text-(--text)">All Offers</h2>
                <span className="text-sm text-(--muted)">{offers.length} offers</span>
              </div>

              <div className="divide-y divide-(--border)">
                {offers.length === 0 && (
                  <div className="px-6 py-6 text-sm text-(--muted)">No offers found.</div>
                )}
                {offers.map((offer) => (
                  <div key={offer._id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 py-4 items-center">
                    <div>
                      <p className="text-xs text-(--muted)">Offer ID</p>
                      <p className="text-sm text-(--text)">{offer._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Job</p>
                      <p className="text-sm text-(--text)">{resolveJobLabel(offer.jobId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Provider</p>
                      <p className="text-sm text-(--text)">{resolveProviderLabel(offer.serviceProviderId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Price</p>
                      <p className="text-sm text-(--text)">{offer.offeredPrice ?? "-"}</p>
                    </div>
                    <div>
                      <select
                        value={offer.status || "pending"}
                        disabled={!offer._id || updatingId === offer._id}
                        onChange={(event) =>
                          offer._id &&
                          handleStatusUpdate(
                            offer._id,
                            event.target.value as "pending" | "accepted" | "rejected",
                          )
                        }
                        className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-(--secondary) text-(--muted) border border-(--border)"
                      >
                        <option value="pending">pending</option>
                        <option value="accepted">accepted</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </div>
                    <div className="flex justify-start lg:justify-end">
                      <button
                        type="button"
                        disabled={!offer._id || deletingId === offer._id}
                        onClick={() => offer._id && handleDelete(offer._id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
                      >
                        {deletingId === offer._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Delete Offer</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete this offer? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
