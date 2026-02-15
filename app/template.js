'use client';

import { motion } from 'framer-motion';

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
}

