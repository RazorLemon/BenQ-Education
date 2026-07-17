import { motion } from "framer-motion";

import { ArrowLeft } from "lucide-react";

import {
  useNavigate
}
from "react-router-dom";

function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel = "Back"
}) {

  const navigate =
    useNavigate();

  const handleBack =
    ()=>{
      if(backTo){
        navigate(backTo);
        return;
      }

      navigate(-1);
    };

  return (

    <motion.div

      initial={{
        opacity: 0
      }}

      animate={{
        opacity: 1
      }}

      className="
      mb-5
      sm:mb-8
      min-w-0
      "

    >

      <div className="flex items-start gap-3">
        {backTo && (
          <button
            type="button"
            onClick={handleBack}
            aria-label={backLabel}
            title={backLabel}
            className="
            mt-0.5
            inline-flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-gray-200
            bg-white
            text-gray-700
            shadow-sm
            transition
            hover:border-[#008C95]
            hover:text-[#008C95]
            "
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="min-w-0">
          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            text-gray-900
            leading-tight
            "
          >
            {title}
          </h1>

          <p
            className="
            text-gray-500
            mt-1
            text-sm
            sm:text-base
            "
          >
            {subtitle}
          </p>
        </div>
      </div>

    </motion.div>

  );

}

export default PageHeader;
