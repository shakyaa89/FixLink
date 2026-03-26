import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi } from "../../api/Apis";

const initialState = {
  userId: "",
  title: "",
  description: "",
  jobCategory: "Plumbing",
  userPrice: "",
  location: "",
};

export default function AdminCreateJobPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number(form.userPrice);

    if (
      !form.userId.trim() ||
      !form.title.trim() ||
      !form.description.trim() ||
      !form.location.trim() ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      setError("Please enter valid job details.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AdminApi.createJob({
        userId: form.userId.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        jobCategory: form.jobCategory,
        userPrice: parsedPrice,
        location: form.location.trim(),
      });
      navigate("/admin/jobs");
    } catch (err) {
      console.error("Failed to create job", err);
      setError("Unable to create job. Verify owner user ID and fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <p className="text-(--muted) text-sm">Admin Console</p>
            <h1 className="text-3xl font-bold text-(--text)">Create Job</h1>
          </div>

          {error && (
            <div className="bg-(--danger-bg) text-(--danger) border border-(--border) rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-(--primary) border border-(--border) rounded-2xl p-6 space-y-4"
          >
            <input
              type="text"
              value={form.userId}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, userId: event.target.value }))
              }
              placeholder="Owner user id"
              className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
            />
            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, title: event.target.value }))
              }
              placeholder="Title"
              className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, description: event.target.value }))
              }
              placeholder="Description"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={form.jobCategory}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, jobCategory: event.target.value }))
                }
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Landscaping">Landscaping</option>
                <option value="General Repairs">General Repairs</option>
              </select>
              <input
                type="number"
                min={1}
                value={form.userPrice}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, userPrice: event.target.value }))
                }
                placeholder="Price"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
              />
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, location: event.target.value }))
                }
                placeholder="Location"
                className="px-3 py-2 rounded-lg border border-(--border) bg-(--secondary) text-(--text) text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/jobs")}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border)"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
