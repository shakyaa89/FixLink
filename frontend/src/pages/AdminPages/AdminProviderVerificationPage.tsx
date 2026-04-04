import { useEffect, useState } from "react";
import { FileCheck2, ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminProviderData } from "../../api/Apis";

export default function AdminProviderVerificationPage() {
  const [providers, setProviders] = useState<AdminProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    providerId: string;
    providerName: string;
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  } | null>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchServiceProviders();
      const fetchedProviders = response.data.providers || [];
      setProviders(fetchedProviders);
    } catch (err) {
      console.error("Failed to load providers", err);
      setError("Unable to load service provider documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    providerId: string,
    status: "pending" | "verified" | "rejected",
    rejectionReason?: string,
  ) => {
    try {
      setUpdatingId(providerId);
      await AdminApi.updateServiceProviderVerification(
        providerId,
        status,
        rejectionReason,
      );
      fetchProviders();
    } catch (err) {
      console.error("Failed to update verification", err);
      setError("Unable to update verification status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleConfirmUpdate = async () => {
    if (!confirmation) return;
    if (confirmation.status === "rejected") {
      const reason = confirmation.rejectionReason?.trim();
      if (!reason) {
        setRejectionError("Please provide a rejection reason.");
        return;
      }
    }
    setRejectionError(null);
    await handleUpdate(
      confirmation.providerId,
      confirmation.status,
      confirmation.rejectionReason?.trim(),
    );
    setConfirmation(null);
  };

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-(--muted) text-sm">Admin Console</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
                Provider Verification
              </h1>
              <p className="text-(--muted) mt-2">
                Review uploaded documents and approve or reject service
                providers.
              </p>
            </div>
            <div className="flex items-center gap-2 text-(--accent)">
              <FileCheck2 className="w-5 h-5" />
              <span className="text-sm font-medium">Verification queue</span>
            </div>
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
                <h2 className="text-lg font-semibold text-(--text)">
                  Service Providers
                </h2>
                <span className="text-sm text-(--muted)">
                  {`${providers.length} providers`}
                </span>
              </div>

              <div className="divide-y divide-(--border)">
                {providers.length === 0 && (
                  <div className="px-6 py-6 text-sm text-(--muted)">
                    No service providers found.
                  </div>
                )}

                {providers.map((provider) => (
                  <div
                    key={provider._id}
                    className="grid grid-cols-1 lg:grid-cols-8 gap-4 px-6 py-4 items-center"
                  >
                    <div className="lg:col-span-2 flex items-center gap-3">
                      <img
                        src={
                          provider.profilePicture ||
                          "https://via.placeholder.com/40"
                        }
                        alt={provider.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-(--border)"
                      />
                      <div>
                        <p className="text-(--text) font-semibold">
                          {provider.fullName}
                        </p>
                        <p className="text-xs text-(--muted)">{provider.email}</p>
                        <p className="text-xs text-(--muted)">
                          {provider.providerCategory || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-(--muted)">Submitted</p>
                      <p className="text-sm text-(--text)">
                        {new Date(provider.createdAt!).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize bg-(--secondary) text-(--muted) border border-(--border)">
                        {provider.verificationStatus}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-(--muted)">Address</p>
                      <p className="text-sm text-(--text)">
                        {provider.address || "-"}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {provider.addressDescription || ""}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-(--muted)">Documents</p>
                      <div className="flex flex-col gap-2">
                        {provider.verificationProofURL ? (
                          <a
                            href={provider.verificationProofURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-(--accent) underline"
                          >
                            Verification Proof
                          </a>
                        ) : (
                          <span className="text-sm text-(--muted)">No proof</span>
                        )}
                        {provider.idProofURL ? (
                          <a
                            href={provider.idProofURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-(--accent) underline"
                          >
                            ID Proof
                          </a>
                        ) : (
                          <span className="text-sm text-(--muted)">No ID</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:col-span-2">
                      {provider.verificationStatus !== "verified" && (
                        <button
                          onClick={() =>
                            provider._id &&
                            setConfirmation({
                              providerId: provider._id,
                              providerName: provider.fullName,
                              status: "verified",
                            })
                          }
                          disabled={!provider._id || updatingId === provider._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--success-bg) text-(--success) border border-(--border) transition disabled:opacity-60"
                        >
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Approve
                          </span>
                        </button>
                      )}
                      {provider.verificationStatus !== "pending" && (
                        <button
                          onClick={() =>
                            provider._id &&
                            setConfirmation({
                              providerId: provider._id,
                              providerName: provider.fullName,
                              status: "pending",
                            })
                          }
                          disabled={!provider._id || updatingId === provider._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition disabled:opacity-60"
                        >
                          Pending
                        </button>
                      )}
                      {provider.verificationStatus !== "rejected" && (
                        <button
                          onClick={() =>
                            provider._id &&
                            setConfirmation({
                              providerId: provider._id,
                              providerName: provider.fullName,
                              status: "rejected",
                              rejectionReason: "",
                            })
                          }
                          disabled={!provider._id || updatingId === provider._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) transition disabled:opacity-60"
                        >
                          <span className="flex items-center gap-1">
                            <ShieldX className="w-4 h-4" /> Reject
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {confirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-(--text)">
              Confirm {confirmation.status === "verified" ? "approval" : confirmation.status === "rejected" ? "rejection" : "pending"}
            </h2>
            <p className="mt-3 text-sm text-(--muted)">
              Are you sure you want to {confirmation.status === "verified" ? "approve" : confirmation.status === "rejected" ? "reject" : "mark as pending"}{" "}
              {confirmation.providerName}?
            </p>

            {confirmation.status === "rejected" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-(--text) mb-2">
                  Rejection reason
                </label>
                <textarea
                  value={confirmation.rejectionReason || ""}
                  onChange={(event) =>
                    setConfirmation((prev) =>
                      prev
                        ? { ...prev, rejectionReason: event.target.value }
                        : prev,
                    )
                  }
                  rows={4}
                  className="w-full border border-(--border) rounded-lg px-3 py-2 bg-(--primary) text-(--text)"
                  placeholder="Explain why this provider was rejected"
                />
                {rejectionError && (
                  <p className="text-sm text-(--danger) mt-2">{rejectionError}</p>
                )}
              </div>
            )}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={updatingId === confirmation.providerId}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                disabled={updatingId === confirmation.providerId}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition disabled:opacity-60"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
