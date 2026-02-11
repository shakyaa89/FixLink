import { useState } from "react";
import { MapPin, Upload, Loader2, Link2, FileText } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [providerCategory, setProviderCategory] = useState("");
  const [address, setAddress] = useState("");
  const [addressDescription, setAddressDescription] = useState("");
  const [addressURL, setAddressURL] = useState("");

  const [verificationProofFile, setVerificationProofFile] =
    useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const uploadToCloudinary = async (file: File, preset: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    try {
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/ddmyk2hd6/image/upload",
        formData
      );
      return data.secure_url as string;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!providerCategory || !address || !verificationProofFile || !idProofFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const verificationProofURL = await uploadToCloudinary(
        verificationProofFile,
        "verificationUpload"
      );
      const idURL = await uploadToCloudinary(idProofFile, "idUpload");

      const response = await AuthApi.completeServiceProviderProfile({
        providerCategory,
        address,
        addressDescription,
        addressURL,
        verificationProofURL,
        idURL,
      });

      toast.success(response?.data?.message || "Profile completed");

      if (response?.data?.user) {
        setUser(response.data.user);
      }

      navigate("/serviceprovider/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Update failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--primary) flex justify-center p-4 pt-20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-(--accent) rounded-full mb-4">
            <FileText className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-3xl font-bold text-(--text)">
            Complete Your Profile
          </h1>
          <p className="text-(--muted) mt-2">
            Upload required documents to continue.
          </p>
        </div>

        <div className="bg-(--primary) rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Service Category<span className="text-red-500">*</span>
              </label>
              <select
                value={providerCategory}
                onChange={(e) => setProviderCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
              >
                <option value="">Select a category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Landscaping">Landscaping</option>
                <option value="General Repairs">General Repairs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Address<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Address Description (Optional)
              </label>
              <textarea
                value={addressDescription}
                onChange={(e) => setAddressDescription(e.target.value)}
                placeholder="Additional details"
                rows={3}
                className="w-full p-4 border-2 border-(--border) rounded-xl focus:border-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Address URL (Map Link) (Optional)
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
                <input
                  type="url"
                  value={addressURL}
                  onChange={(e) => setAddressURL(e.target.value)}
                  placeholder="Enter address URL"
                  className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Service License or Other Document
                <span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-(--border) rounded-xl p-6 text-center cursor-pointer"
                onClick={() =>
                  document.getElementById("verification-input")?.click()
                }
              >
                <Upload className="w-8 h-8 text-(--muted) mx-auto mb-2" />
                <p className="text-sm text-(--text)">Click to upload</p>
                <input
                  id="verification-input"
                  type="file"
                  onChange={(e) =>
                    setVerificationProofFile(e.target.files?.[0] || null)
                  }
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {verificationProofFile && (
                <p className="text-sm text-green-600 mt-2">
                  {verificationProofFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-(--text) mb-2">
                Citizenship Picture<span className="text-red-500">*</span>
              </label>
              <div
                className="border-2 border-dashed border-(--border) rounded-xl p-6 text-center cursor-pointer"
                onClick={() => document.getElementById("id-input")?.click()}
              >
                <Upload className="w-8 h-8 text-(--muted) mx-auto mb-2" />
                <p className="text-sm text-(--text)">Click to upload</p>
                <input
                  id="id-input"
                  type="file"
                  onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {idProofFile && (
                <p className="text-sm text-green-600 mt-2">
                  {idProofFile.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-(--accent) text-(--primary) py-3 rounded-xl font-semibold disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  {uploading ? "Uploading..." : "Saving..."}
                </span>
              ) : (
                "Submit Documents"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
