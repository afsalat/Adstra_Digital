"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-black text-gold">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4"
      >
        {/* Big 404 */}
        <motion.h1
          className="fw-bold display-1"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            color: "#FFD700",
            textShadow: "0 0 20px rgba(255,215,0,0.5)",
          }}
        >
          404
        </motion.h1>

        {/* Message */}
        <p className="lead text-light mb-4">
          Oops! The page you are looking for doesn’t exist.  
          Maybe it was moved or never created.
        </p>

        {/* Button */}
        <Link href="/" className="btn btn-lg px-4 rounded-pill"
          style={{
            background: "linear-gradient(45deg, #FFD700, #B8860B)",
            color: "#000",
            fontWeight: "600",
            boxShadow: "0 0 15px rgba(255,215,0,0.6)",
          }}
        >
          ⬅ Back to Home
        </Link>

        {/* Subtext */}
        <p className="mt-4 text-secondary small">
          © {new Date().getFullYear()} Adstra Digital. All rights reserved.
        </p>
      </motion.div> 
    </div>
  );
}
