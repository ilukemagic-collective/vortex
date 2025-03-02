"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedFormProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export function AnimatedForm({ children, className = "" }: AnimatedFormProps) {
  return (
    <motion.form
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.form>
  );
}

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export function AnimatedItem({ children, className = "" }: AnimatedFormProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

export const buttonVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
  hover: { scale: 1.03, transition: { duration: 0.2 } },
};

export function AnimatedButton({
  children,
  className = "",
  ...props
}: AnimatedFormProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      className={className}
      variants={buttonVariants}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
