import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploaded images on disk in the uploads/ folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    // Never trust the client-supplied filename (path traversal / odd chars).
    // Derive a safe name from a timestamp + random suffix, keeping only a
    // sanitized extension.
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = /^\.[a-z0-9]+$/.test(rawExt) ? rawExt : "";
    const suffix = Math.round(Math.random() * 1e9);
    cb(null, `${Date.now()}-${suffix}${ext}`);
  },
});

// Only allow common image formats
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, .gif and .webp images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
