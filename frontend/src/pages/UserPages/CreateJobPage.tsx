import { Upload, Loader2, Check, Briefcase } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import { JobApi } from "../../api/Apis";
import toast from "react-hot-toast";
import axios from "axios";

export default function CreateJobPage() {
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [userPrice, setUserPrice] = useState(0);
  const [location, setLocation] = useState("");
  const [locationURL, setLocationURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setImages(files);
  };

  const uploadMultipleToCloudinary = async (files: File[]) => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "job_image_upload");

        const { data } = await axios.post(
          "https://api.cloudinary.com/v1_1/diocl7ilu/image/upload",
          formData
        );

        urls.push(data.secure_url);
      }

      console.log(urls);

      return urls;
    } catch (err) {
      console.error("Cloudinary multiple upload failed:", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !jobCategory ||
      !userPrice ||
      !location ||
      images.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const imageUrls = await uploadMultipleToCloudinary(images);

      setLoading(true);
      const payload = {
        userId: user?._id,
        title,
        description,
        jobCategory,
        userPrice,
        location,
        locationURL,
        images: imageUrls,
      };

      const response = await JobApi.createJobApi(payload);

      toast.success(response?.data?.message);

      setTitle("");
      setDescription("");
      setJobCategory("");
      setUserPrice(0);
      setLocation("");
      setLocationURL("");
      setImages([]);
    } catch (error) {
      console.log(error);
      toast.error("Error creating job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <Sidebar />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-(--accent) rounded-xl items-center justify-center hidden sm:flex">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
                  Create a New Job
                </h1>
                <p className="text-(--muted) mt-1">
                  Post your service request and receive offers from providers
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
                <label className="block text-(--text) font-semibold mb-3">
                  Job Title<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Fix leaking sink"
                  className="w-full p-3 rounded-lg border border-(--border) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none bg-(--secondary) text-(--text)"
                />
              </div>

              <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
                <label className="block text-(--text) font-semibold mb-3">
                  Service Category<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full p-3 rounded-lg border border-(--border) text-(--text) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none bg-(--secondary) cursor-pointer"
                >
                  <option value="">Select a Category</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Carpentry</option>
                  <option>Painting</option>
                  <option>Landscaping</option>
                  <option>General Repairs</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
              <label className="block text-(--text) font-semibold mb-3">
                Description<span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service needs..."
                rows={5}
                className="w-full p-3 rounded-lg border border-(--border) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none resize-none bg-(--secondary) text-(--text)"
              ></textarea>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
                <label className="block text-(--text) font-semibold mb-3">
                  Your Price (Rs)<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  value={userPrice}
                  onChange={(e) => setUserPrice(parseInt(e.target.value))}
                  placeholder="Ex: 1200"
                  className="w-full p-3 rounded-lg border border-(--border) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none bg-(--secondary) text-(--text)"
                />
              </div>

              <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
                <label className="block text-(--text) font-semibold mb-3">
                  Location<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                  className="w-full p-3 rounded-lg border border-(--border) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none bg-(--secondary) text-(--text)"
                />
              </div>
            </div>

            {/* Location URL */}
            <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
              <label className="block text-(--text) font-semibold mb-3">
                Location URL{" "}
                <span className="text-(--muted) font-normal text-sm">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                value={locationURL}
                onChange={(e) => setLocationURL(e.target.value)}
                placeholder="https://www.google.com/maps/@?api=1&map_action=map"
                className="w-full p-3 rounded-lg border border-(--border) focus:ring-2 focus:ring-(--accent) focus:border-transparent outline-none bg-(--secondary) text-(--text)"
              />
            </div>

            {/* Image Upload */}
            <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
              <label className="block text-(--text) font-semibold mb-3">
                Upload Images<span className="text-red-500 ml-1">*</span>
              </label>

              <label htmlFor="imageUpload" className="cursor-pointer">
                <div className="border-2 border-dashed border-(--border) rounded-xl p-8 text-center hover:border-(--accent) transition bg-(--secondary)">
                  <div className="flex flex-col items-center space-y-3">
                    <Upload className="w-10 h-10 text-(--accent)" />
                    <div>
                      <p className="text-(--text) font-medium">
                        Click to upload images
                      </p>
                      <p className="text-(--muted) text-sm mt-1">
                        PNG, JPG, or WEBP
                      </p>
                    </div>
                  </div>
                  <input
                    id="imageUpload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </label>

              {/* File List */}
              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-(--muted) font-medium">
                    {images.length} {images.length === 1 ? "file" : "files"}{" "}
                    selected:
                  </p>
                  <ul className="space-y-2">
                    {images.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-3 p-2 bg-(--secondary) rounded-lg border border-(--border)"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Check
                            size={16}
                            className="text-green-600 shrink-0"
                          />
                          <span className="text-sm text-(--text) truncate">
                            {file.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="bg-(--primary) border border-(--border) rounded-xl p-5">
              <button
                type="submit"
                disabled={
                  loading ||
                  uploading ||
                  !images.length ||
                  !userPrice ||
                  !location ||
                  !title ||
                  !description ||
                  !jobCategory
                }
                className="w-full bg-(--accent) text-white text-lg font-semibold py-4 rounded-lg hover:bg-(--accent-hover) transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Uploading images...
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Submitting job...
                  </span>
                ) : (
                  "Submit Job"
                )}
              </button>

              {(!title ||
                !description ||
                !jobCategory ||
                !userPrice ||
                !location ||
                !images.length) && (
                <p className="text-(--muted) text-sm text-center mt-3">
                  Please complete all required fields to submit
                </p>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
