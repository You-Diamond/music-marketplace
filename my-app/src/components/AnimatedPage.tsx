"use client"

import { motion } from "framer-motion"

type Props = {
  children: React.ReactNode
}

export default function AnimatedPage({
  children,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 20,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      {children}
    </motion.div>
  )
}