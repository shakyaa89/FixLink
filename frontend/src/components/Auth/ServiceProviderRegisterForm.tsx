import { Mail, Lock, User, Phone, Upload, Loader2, MapPin } from "lucide-react";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AuthApi, CLOUDINARY_UPLOAD_URL } from "../../api/Apis";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { CITIES, LOCATION_OPTIONS } from "../../utils/nepalLocations";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function ServiceProviderRegisterForm() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // state variables for form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const placeOptions = city ? LOCATION_OPTIONS[city] ?? [] : [];

  const uploadToCloudinary = async (file: File) => {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Image must be 2MB or smaller");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profileUpload");

    try {
      const { data } = await axios.post(
        CLOUDINARY_UPLOAD_URL,
        formData,
      );
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("called");

    if (!fullName || !email || !phoneNumber || !city || !address || !password || !profilePicture) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Invalid phone number");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agreeToTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      setLoading(true);

      // Upload profile image to Cloudinary
      let profileUrl = "";
      if (profilePicture) {
        console.log("Uploading profile picture...");
        profileUrl = await uploadToCloudinary(profilePicture);
      }

      // Send basic details to backend
      const response = await AuthApi.registerApi({
        fullName,
        email,
        phoneNumber,
        city,
        address,
        password,
        role: "serviceProvider",
        profilePicture: profileUrl,
      });

      toast.success(response?.data?.message);

      if (response?.data?.token) {
        localStorage.setItem("jwtToken", response.data.token);
      }

      if (response?.data?.user) {
        setUser(response.data.user);
      }

      // Reset form
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setCity("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");
      setProfilePicture(null);

      setAgreeToTerms(false);

      navigate("/serviceprovider/complete-profile");
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || err.message || "Registration failed"
          : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleRegisterSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Full Name<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Email<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            City<span className="text-red-500">*</span>
          </label>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setAddress("");
            }}
            className="w-full px-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600 bg-white"
          >
            <option value="">Select city</option>
            {CITIES.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>

        {/* Place */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Place<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <select
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!city}
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{city ? "Select place" : "Select city first"}</option>
              {placeOptions.map((placeOption) => (
                <option key={placeOption} value={placeOption}>
                  {placeOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Password<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Confirm Password<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-blue-600"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Profile Picture<span className="text-red-500">*</span>
          </label>
          <div
            className="border-2 border-dashed border-(--border) rounded-xl p-6 text-center cursor-pointer"
            onClick={() => document.getElementById("profile-input")?.click()}
          >
            <Upload className="w-8 h-8 text-(--muted) mx-auto mb-2" />
            <p className="text-sm text-(--text)">Click to upload</p>
            <input
              id="profile-input"
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;

                if (selectedFile && selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
                  toast.error("Image must be 2MB or smaller");
                  setProfilePicture(null);
                  e.target.value = "";
                  return;
                }

                setProfilePicture(selectedFile);
              }}
              accept="image/*"
              className="hidden"
            />
          </div>
          {profilePicture && (
            <p className="text-sm text-green-600 mt-2">{profilePicture.name}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-4 h-4 mt-1"
          />
          <span className="ml-2 text-sm text-(--text)">
            I agree to the{" "}
            <a className="text-(--accent) font-semibold">Terms</a> and{" "}
            <a className="text-(--accent) font-semibold">Privacy Policy</a>
            <span className="text-red-500">*</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-(--accent)  text-(--primary) py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              {uploading ? "Uploading..." : "Creating Account..."}
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </>
  );
}

export default ServiceProviderRegisterForm;
