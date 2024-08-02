const models = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Validator = require("fastest-validator");
const { where } = require("sequelize");

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shahadmunazar@gmail.com",
    pass: "empixsunijaihvvs",
  },
});

const v = new Validator();

const signupSchema = {
  name: { type: "string", min: 3, max: 255 },
  email: { type: "email" },
  password: { type: "string", min: 6 },
};

const verifyUserSchema = {
  email: { type: "email" },
  user_otp: { type: "string", length: 6 },
};

async function signup(req, res) {
  const { name, email, password } = req.body;

  const validationResponse = v.validate({ name, email, password }, signupSchema);

  if (validationResponse !== true) {
    return res.status(400).json({ errors: validationResponse });
  }

  try {
    // Check if the email is already in use
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Prepare mail options
    const mailOptions = {
      from: "shahadmunazar@gmail.com",
      to: email,
      subject: "Verify Your Email",
      text: `Your OTP for email verification is: ${otp}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultRole = await models.Role.findOne({ where: { role: "user" } });

    // Create user with OTP and hashed password
    const newUser = await models.User.create({
      name,
      email,
      password: hashedPassword,
      user_otp: otp,
      roleId: defaultRole.id, // Assuming Role.id is used as the foreign key in User model
    });

    // Respond with success message and user details
    res.status(201).json({
      message: "New User Created Successfully. OTP sent to your email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({
      message: "Failed to create user or send OTP email",
      error: error.message,
    });
  }
}

function generateOTP() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

async function verify_user(req, res) {
  const { email, user_otp } = req.body;

  const validationResponse = v.validate({ email, user_otp }, verifyUserSchema);

  if (validationResponse !== true) {
    return res.status(400).json({ errors: validationResponse });
  }

  try {
    const user = await models.User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Email is incorrect",
      });
    }

    if (user.user_otp !== user_otp) {
      return res.status(400).json({
        message: "OTP is incorrect",
      });
    }

    await models.User.update({ email_verified: true }, { where: { email: email, user_otp: user_otp } });

    res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      message: "Failed to verify email",
      error: error.message,
    });
  }
}

const loginSchema = {
  email: { type: "email", empty: false },
  password: { type: "string", min: 6, empty: false },
};

async function login(req, res) {
  const { email, password } = req.body;

  // Validate input
  const validationResponse = v.validate({ email, password }, loginSchema);
  if (validationResponse !== true) {
    return res.status(400).json({ errors: validationResponse });
  }

  try {
    // Find user by email including role association
    const user = await models.User.findOne({
      where: { email },
      include: [{ model: models.Role, as: "role" }],
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json({
        message: "Please verify your email before logging in",
      });
    }

    // Check user role
    if (!user.role || !user.role.role) {
      return res.status(401).json({
        message: "User role not found",
      });
    }

    // Verify JWT_KEY is set
    if (!process.env.JWT_KEY) {
      console.error("JWT_KEY is not set");
      return res.status(500).json({
        message: "JWT_KEY is not set",
      });
    }

    // Generate JWT token with role information
    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id,
        role: user.role.role, // Include role in the token payload
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Authenticated Successfully",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "An error occurred during login",
      error: error.message,
    });
  }
}
module.exports = {
  signup,
  verify_user,
  login,
};
