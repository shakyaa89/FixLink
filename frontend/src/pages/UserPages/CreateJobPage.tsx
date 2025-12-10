import { Upload } from "lucide-react";
import Sidebar from "../../components/Navbar/Sidebar";

export default function CreateJobPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 py-5 px-4 md:px-8">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-left">
            Create a New Job
          </h1>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Job Title */}
            <div className="col-span-1">
              <label className="block text-gray-800 font-semibold mb-2">
                Job Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Fix leaking sink"
                className="w-full p-3 md:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="col-span-1">
              <label className="block text-gray-800 font-semibold mb-2">
                Service Category<span className="text-red-500">*</span>
              </label>
              <select className="w-full p-3 md:p-4 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
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
              <label className="block text-gray-800 font-semibold mb-2">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Describe your service needs..."
                rows={5}
                className="w-full p-3 md:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>

            {/* Budget */}
            <div className="col-span-1">
              <label className="block text-gray-800 font-semibold mb-2">
                Your Price (Rs)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Ex: 1200"
                className="w-full p-3 md:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Address */}
            <div className="col-span-1">
              <label className="block text-gray-800 font-semibold mb-2">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter your location"
                className="w-full p-3 md:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Address URL */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-800 font-semibold mb-2">
                Address URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://www.google.com/maps/@?api=1&map_action=map"
                className="w-full p-3 md:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Image Upload */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-800 font-semibold mb-2">
                Upload Images<span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 md:p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <div className="flex flex-col items-center space-y-2 md:space-y-3">
                  <Upload className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                  <p className="text-gray-600 font-medium text-sm md:text-base">
                    Click to upload images
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold py-3 md:py-4 rounded-lg hover:shadow-xl transition"
              >
                Submit Job
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
