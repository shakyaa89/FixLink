import { useState } from "react";
import {
    Mail,
    Lock,
    User,
    Phone,
    MapPin,
    Upload,
    Link2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthApi } from "../../api/Apis";
import { useNavigate } from "react-router-dom";

const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function EditProfilePage() {
    const { user, setUser } = useAuthStore();

    const [uploading, setUploading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    const [fullName, setFullName] = useState(user.fullName);
    const [email, setEmail] = useState(user.email);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const [city, setCity] = useState(user.city);
    // const [password, setPassword] = useState("");
    // const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState(user.address);
    const [addressDescription, setAddressDescription] = useState(user.addressDescription);
    const [addressUrl, setAddressUrl] = useState(user.addressURL || user.addressUrl || "");
    const [profilePicture, setProfilePicture] = useState<File | null>();

    const uploadToCloudinary = async (file: File) => {
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            throw new Error("Image must be 2MB or smaller");
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_upload");

        try {
            const { data } = await axios.post(
                "https://api.cloudinary.com/v1_1/diocl7ilu/image/upload",
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setUpdating(true);
            if (
                !fullName ||
                !email ||
                !phoneNumber ||
                !city ||
                !address ||
                !addressDescription
            ) {
                toast.error("Please fill in all required fields");
                return;
            }

            const profilePictureUrl = profilePicture ? await uploadToCloudinary(profilePicture) : user.profilePicture;

            const updatePayload = {
                fullName,
                email,
                phoneNumber,
                city,
                address,
                addressDescription,
                addressURL: addressUrl,
                profilePicture: profilePictureUrl
            }

            const response = await AuthApi.updateUserProfileApi(updatePayload);

            toast.success(response.data.message);

            setUser(response.data.updatedUser);

            navigate("/profile");

        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || "Updating failed";
            toast.error(message);
        }finally{
            setUpdating(false);
        }
    }

    return (
        <div className="flex min-h-screen bg-(--primary)">
            <Sidebar />
            <main className="flex-1 py-8 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-(--text)">Edit Profile</h1>
                        <p className="text-(--muted) mt-2">
                            Update your personal information
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Profile Picture */}
                        <div className="bg-(--primary) border border-(--border) rounded-2xl p-6">
                            <label className="block text-(--text) font-semibold mb-4">
                                Profile Picture
                            </label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Preview */}
                                <div className="shrink-0">
                                    <div className="w-32 h-32 rounded-xl border-2 border-(--border) overflow-hidden bg-(--secondary) flex items-center justify-center">
                                        <img src={user.profilePicture} alt="user-profile-pic" className="w-32 h-32 object-cover" />
                                    </div>
                                </div>

                                {/* Upload */}
                                <div className="flex-1">
                                    <label htmlFor="profile-input" className="cursor-pointer">
                                        <div className="border-2 border-dashed border-(--border) rounded-xl p-6 text-center hover:border-(--accent) transition bg-(--secondary)">
                                            <Upload className="w-8 h-8 text-(--muted) mx-auto mb-2" />
                                            <p className="text-sm text-(--text) font-medium">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-(--muted) mt-1">
                                                PNG, JPG or WEBP
                                            </p>
                                        </div>
                                        <input
                                            id="profile-input"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
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
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="bg-(--primary) border border-(--border) rounded-2xl p-6">
                            <h2 className="text-(--text) font-semibold text-lg mb-6">
                                Basic Information
                            </h2>
                            <div className="space-y-5">
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
                                            className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                        />
                                    </div>
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                                className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                            />
                                        </div>
                                    </div>

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
                                                className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-semibold text-(--text) mb-2">
                                        City<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text) font-medium"
                                    >
                                        <option value="">Select city</option>
                                        {CITIES.map((cityOption) => (
                                            <option key={cityOption} value={cityOption}>
                                                {cityOption}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-(--primary) border border-(--border) rounded-2xl p-6">
                            <h2 className="text-(--text) font-semibold text-lg mb-6">
                                Address Information
                            </h2>
                            <div className="space-y-5">
                                {/* Address */}
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
                                            className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                        />
                                    </div>
                                </div>

                                {/* Address Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-(--text) mb-2">
                                        Address Description<span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={addressDescription}
                                        onChange={(e) => setAddressDescription(e.target.value)}
                                        placeholder="Describe your address (e.g., near landmark, apartment number, etc.)"
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text) resize-none font-medium"
                                    />
                                </div>

                                {/* Address URL */}
                                <div>
                                    <label className="block text-sm font-semibold text-(--text) mb-2">
                                        Address URL
                                        <span className="text-(--muted) font-normal text-xs ml-2">
                                            (Optional)
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
                                        <input
                                            type="text"
                                            value={addressUrl}
                                            onChange={(e) => setAddressUrl(e.target.value)}
                                            placeholder="https://www.google.com/maps/@?api=1&map_action=map"
                                            className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-(--primary) border border-(--border) rounded-2xl p-6">
                            <h2 className="text-(--text) font-semibold text-lg mb-6">
                                Change Password
                                <span className="text-(--muted) font-normal text-sm ml-2">
                                    (Optional)
                                </span>
                            </h2>
                            <div className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-(--text) mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
                                        <input
                                            type="password"
                                            // value={password}
                                            placeholder="Enter new password"
                                            className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-(--text) mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
                                        <input
                                            type="password"
                                            // value={confirmPassword}
                                            placeholder="Confirm new password"
                                            className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent) bg-(--secondary) text-(--text)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={uploading || updating}
                                className="flex-1 bg-(--accent) text-(--primary) py-4 rounded-xl font-semibold hover:bg-(--accent-hover) transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? "Uploading Profile Picture..." : updating ? "Updating Details..." : "Update Profile"}
                            </button> 
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}