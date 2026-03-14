import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerController(req, res) {
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
    console.log(
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
      idURL
    );

    const isServiceProvider = role === "serviceProvider";
    const allowedCities = ["Kathmandu", "Lalitpur", "Bhaktapur"];

    // Required fields
    if (!fullName || !email || !phoneNumber || !city || !password || !profilePicture) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedCities.includes(city)) {
      return res.status(400).json({ message: "Invalid city selected" });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const phoneUser = await User.findOne({ phoneNumber });
    if (phoneUser) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      fullName,
      email,
      phoneNumber,
      city,
      password: hashedPassword,
      role: role || "user",
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

export async function completeServiceProviderProfile(req, res) {
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

    user.verificationProofURL = verificationProofURL;
    user.idProofURL = idURL;
    user.providerCategory = providerCategory;
    user.address = address;
    user.addressDescription = addressDescription || user.addressDescription;
    user.addressURL = addressURL || user.addressURL;
    user.verificationStatus = verificationStatus ?? "pending";
    user.rejectionReason = rejectionReason;

    await user.save();

    return res.status(200).json({
      message: "Service provider profile completed",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function loginController(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

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

export async function logoutController(req, res) {
  try {
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function checkAuth(req, res) {
  try {
    return res.status(200).json(req.user);
  } catch (err) {
    console.log("ERROR in checkAuth");
    return res.status(500).json({ message: "erorr in checkAuth" });
  }
}

export async function updateUserProfile(req, res){
  try {
    const {fullName, email,
    phoneNumber,
    city,
    address,
    addressDescription,
    addressUrl,
    profilePicture} = req.body;

    const currentUser = req.user;

    if(!fullName || !email || !phoneNumber || !city || !address || !addressDescription ){
      return res.status(400).json({message: "All fields are required!"});
    }

    const emailCheck = await User.findOne({ email, _id: { $ne: currentUser._id } })

    if(emailCheck){
      return res.status(400).json({message: "User with this email already exists!"})
    }

    const phoneNumberCheck = await User.findOne({ phoneNumber,  _id: { $ne: currentUser._id } });

    if(phoneNumberCheck){
      return res.status(400).json({message: "User with this phone number already exists!"})
    }

    currentUser.fullName = fullName;
    currentUser.email = email;
    currentUser.phoneNumber = phoneNumber;
    currentUser.city = city;
    currentUser.address = address;
    currentUser.addressDescription = addressDescription;
    currentUser.addressURL = addressUrl;
    currentUser.profilePicture = profilePicture;

    await currentUser.save();

    return res.status(200).json({message: "User updated successfully!", updatedUser: currentUser})

  } catch (error) {
    return res.status(500).json({message: "Server Error!"})
  }}
