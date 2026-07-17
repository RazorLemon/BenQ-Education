import { motion } from "framer-motion";

function Card({
  children,
  className = ""
}) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      whileHover={{
        y: -5
      }}

      className={`
        bg-white
        rounded-2xl
        shadow-md
        p-6
        border
        border-gray-100
        ${className}
      `}
    >

      {children}

    </motion.div>

  );

}

export default Card;