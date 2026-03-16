import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export default function Footer() {
  const instagramUrl = "https://www.instagram.com/wel_ribeiro?igsh=MW5hYzVkZGk4dWdwZA%3D%3D&utm_source=qr";

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-12 py-6 text-center border-t border-[#E85B9C]/20"
    >
      <p className="text-xs text-[#7D5B8D] mb-2">
        Desenvolvido por{" "}
        <motion.a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, color: "#2D1B3D" }}
          whileTap={{ scale: 0.95 }}
          className="font-bold text-black hover:text-[#2D1B3D] transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          Wellington R
          <Instagram size={14} />
        </motion.a>
      </p>
    </motion.footer>
  );
}
