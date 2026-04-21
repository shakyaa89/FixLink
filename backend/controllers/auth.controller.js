// Auth controller for register, login, and profile actions
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  deleteCloudinaryImagesByUrls,
  getRemovedCloudinaryUrls,
} from "../lib/cloudinary.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

// Validate email format
const isValidEmail = (value) =>
  typeof value === "string" && EMAIL_REGEX.test(value.trim());

// Validate phone number format
const isValidPhoneNumber = (value) =>
  typeof value === "string" && PHONE_REGEX.test(value.trim());

// Validate password strength
const isValidPassword = (value) =>
  typeof value === "string" && PASSWORD_REGEX.test(value);

const ALLOWED_REGISTRATION_ROLES = ["user", "serviceProvider"];

// Register new user account
export async function registerController(req, res) {
  // Read registration payload fields.
  const {
    fullName,
    email,
    phoneNumber,
    city,
    password,
    role,
    address,
    addressDescription,
    addressURL,
    profilePicture,
    verificationProofURL,
    providerCategory,
    idURL,
  } = req.body;

  try {
    // Default role to normal user when not provided.
    const allowedRole = role || "user";

    if (!ALLOWED_REGISTRATION_ROLES.includes(allowedRole)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    // Enable extra fields only for service providers.
    const isServiceProvider = allowedRole === "serviceProvider";
    const allowedCities = ["Kathmandu", "Lalitpur", "Bhaktapur"];

    if (!fullName || !email || !phoneNumber || !city || !password || !profilePicture) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: "Invalid city selected" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    if (!isValidPassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters and include letters and numbers" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const phoneUser = await User.findOne({ phoneNumber });
    if (phoneUser) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user document with role-specific fields.
    const user = new User({
      fullName,
      email,
      phoneNumber,
      city,
      password: hashedPassword,
      role: allowedRole,
      address,
      addressDescription,
      addressURL,

      profilePicture: profilePicture || "",

      verificationStatus: isServiceProvider ? "pending" : "",
      verificationProofURL: isServiceProvider ? verificationProofURL || "" : "",
      providerCategory: isServiceProvider ? providerCategory || "" : "",
      idProofURL: isServiceProvider ? idURL || "" : "",
    });

    await user.save();

    // Issue JWT token after successful signup.
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Complete service provider profile details
export async function completeServiceProviderProfile(req, res) {
  // Read provider profile completion fields.
  const {
    verificationProofURL,
    providerCategory,
    idURL,
    address,
    addressDescription,
    addressURL,
    verificationStatus,
    rejectionReason
  } = req.body;

  try {
    // Get current authenticated user id.
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "serviceProvider") {
      return res.status(403).json({ message: "User not authorized" });
    }

    if (!verificationProofURL || !idURL || !providerCategory || !address) {
      return res
        .status(400)
        .json({ message: "All documents and details are required" });
    }

    // Keep old docs to remove replaced cloud files.
    const previousImageUrls = [
      user.verificationProofURL,
      user.idProofURL,
      user.addressURL,
    ];

    user.verificationProofURL = verificationProofURL;
    user.idProofURL = idURL;
    user.providerCategory = providerCategory;
    user.address = address;
    user.addressDescription = addressDescription || user.addressDescription;
    user.addressURL = addressURL || user.addressURL;
    user.verificationStatus = verificationStatus ?? "pending";
    user.rejectionReason = rejectionReason;

    await user.save();

    // Remove replaced old document images from cloud storage.
    const removedImageUrls = getRemovedCloudinaryUrls(previousImageUrls, [
      user.verificationProofURL,
      user.idProofURL,
      user.addressURL,
    ]);
    await deleteCloudinaryImagesByUrls(removedImageUrls);

    return res.status(200).json({
      message: "Service provider profile completed",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Log in user and return auth token
export async function loginController(req, res) {
  // Read login credentials.
  const { email, password } = req.body;

  try {
    // Validate required credentials.
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const lowerEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create new login token for this session.
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Handle user logout request
export async function logoutController(req, res) {
  try {
    // Return success for logout request.
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Return current authenticated user
export async function checkAuth(req, res) {
  try {
    // Used to restore session on app load.
    return res.status(200).json(req.user);
  } catch (err) {
    console.log("ERROR in checkAuth");
    return res.status(500).json({ message: "erorr in checkAuth" });
  }
}

// Change user password after validation
export async function changePasswordController(req, res) {
  try {
    // Read current and new password fields.
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password must match" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include letters and numbers",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const isSameAsOldPassword = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOldPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    // Hash and save the new password.
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Update user profile information
export async function updateUserProfile(req, res){
  try {
    // Read editable profile fields.
    const {fullName, email,
    phoneNumber,
    city,
    address,
    addressDescription,
    addressURL,
    addressUrl,
    profilePicture} = req.body;

    const currentUser = req.user;
    // Track old images to delete replaced files.
    const previousImageUrls = [currentUser.profilePicture, currentUser.addressURL];

    if(!fullName || !email || !phoneNumber || !city || !address || !addressDescription ){
      return res.status(400).json({message: "All fields are required!"});
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const emailCheck = await User.findOne({ email, _id: { $ne: currentUser._id } })

    if(emailCheck){
      return res.status(400).json({message: "User with this email already exists!"})
    }

    const phoneNumberCheck = await User.findOne({ phoneNumber,  _id: { $ne: currentUser._id } });

    if(phoneNumberCheck){
      return res.status(400).json({message: "User with this phone number already exists!"})
    }

    // Apply validated updates on current user.
    currentUser.fullName = fullName;
    currentUser.email = email;
    currentUser.phoneNumber = phoneNumber;
    currentUser.city = city;
    currentUser.address = address;
    currentUser.addressDescription = addressDescription;
    // Accept both addressURL and addressUrl from clients.
    const normalizedAddressURL = addressURL ?? addressUrl;
    if (normalizedAddressURL !== undefined) {
      currentUser.addressURL = normalizedAddressURL;
    }
    currentUser.profilePicture = profilePicture;

    await currentUser.save();

    // Remove old files that are no longer referenced.
    const removedImageUrls = getRemovedCloudinaryUrls(previousImageUrls, [
      currentUser.profilePicture,
      currentUser.addressURL,
    ]);
    await deleteCloudinaryImagesByUrls(removedImageUrls);

    return res.status(200).json({message: "User updated successfully!", updatedUser: currentUser})

  } catch (error) {
    return res.status(500).json({message: "Server Error!"})
  }}
