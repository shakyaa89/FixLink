import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registerController(req, res) {
  const {
    fullName,
    email,
    phoneNumber,
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

    // Required fields
    if (!fullName || !email || !phoneNumber || !password || !profilePicture) {
      return res.status(400).json({ message: "All fields are required" });
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
    user.verificationStatus = "pending";

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
