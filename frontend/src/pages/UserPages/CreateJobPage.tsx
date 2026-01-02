import { Upload, Loader2, Check } from "lucide-react";
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
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 py-5 px-4 md:px-8 bg-(--primary)">
        <div className="max-w-6xl mx-auto my-10">
          <h1 className="text-4xl md:text-5xl font-bold text-(--text) mb-6 md:mb-8 text-left">
            Create a New Job
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {/* Job Title */}
            <div className="col-span-1">
              <label className="block text-(--text) font-semibold mb-2">
                Job Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Fix leaking sink"
                className="w-full p-3 md:p-4 rounded-lg border border-(--border) focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="col-span-1">
              <label className="block text-(--text) font-semibold mb-2">
                Service Category<span className="text-red-500">*</span>
              </label>
              <select
                value={jobCategory}
                onChange={(e) => setJobCategory(e.target.value)}
                className="bg-(--primary) w-full p-3 md:p-4 rounded-lg border border-(--border) text-(--text) focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Select a Category</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Carpentry</option>
                <option>Painting</option>
                <option>Landscaping</option>
                <option>General Repairs</option>
              </select>
            </div>

            {/* Description */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-(--text) font-semibold mb-2">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service needs..."
                rows={5}
                className="w-full p-3 md:p-4 rounded-lg border border-(--border) focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            {/* Budget */}
            <div className="col-span-1">
              <label className="block text-(--text) font-semibold mb-2">
                Your Price (Rs)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={userPrice}
                onChange={(e) => setUserPrice(parseInt(e.target.value))}
                placeholder="Ex: 1200"
                className="w-full p-3 md:p-4 rounded-lg border border-(--border) focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Location */}
            <div className="col-span-1">
              <label className="block text-(--text) font-semibold mb-2">
                Location<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="w-full p-3 md:p-4 rounded-lg border border-(--border) focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Location URL */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-(--text) font-semibold mb-2">
                Location URL (Optional)
              </label>
              <input
                type="text"
                value={locationURL}
                onChange={(e) => setLocationURL(e.target.value)}
                placeholder="https://www.google.com/maps/@?api=1&map_action=map"
                className="w-full p-3 md:p-4 rounded-lg border border-(--border) focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-(--text) font-semibold mb-2">
                Upload Images<span className="text-red-500">*</span>
              </label>
              <label htmlFor="imageUpload">
                <div className="border-2 border-dashed border-(--border) rounded-xl p-6 md:p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <div className="flex flex-col items-center space-y-2 md:space-y-3">
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-(--accent)" />
                    <p className="text-(--text) font-medium text-sm md:text-base">
                      Click to upload images
                    </p>
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
            </div>

            <ul className=" space-y-1 text-sm text-(--text)">
              {images.map((file, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check size={18} className="text-green-500" />{" "}
                  <span>{file.name}</span>
                </li>
              ))}
            </ul>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2">
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
                className="w-full bg-(--accent) text-white text-lg font-semibold py-3 md:py-4 rounded-lg hover:shadow-xl transition disabled:opacity-60"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Uploading images...
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Submitting job...
                  </span>
                ) : (
                  "Submit Job"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
