"use client"

import { motion, Variants } from "framer-motion" // Импортируем тип Variants
import BeatCard from "@/components/BeatCard"
import { Beat } from "@/types/beat"

type BeatsGridProps = {
  beats: Beat[]
}

// Указываем тип Variants, чтобы TypeScript не ругался на строку ease
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" // Теперь TS понимает, что это валидное значение
    }
  },
}

export default function BeatsGrid({ beats }: BeatsGridProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {beats.map((beat) => (
        <motion.div key={beat.id} variants={itemVariants}>
          <BeatCard beat={beat} />
        </motion.div>
      ))}
    </motion.div>
  )
}