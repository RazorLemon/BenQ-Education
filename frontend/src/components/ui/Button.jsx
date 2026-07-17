import { motion } from "framer-motion";

function Button({
  children,
  onClick,
  type = "button",
  className = ""
}) {

  return (

    <motion.button

      whileHover={{
        scale: 1.03
      }}

      whileTap={{
        scale: 0.97
      }}

      type={type}

      onClick={onClick}

      className={`
        bg-[#008C95]
        text-white
        px-5
        py-3
        rounded-xl
        font-medium
        shadow-md
        transition
        hover:bg-[#00747C]
        ${className}
      `}
    >

      {children}

    </motion.button>

  );

}

export default Button;