import { motion } from "framer-motion";

function StatCard({
  title,
  value,
  subtitle,
  icon:Icon,
  onClick,
  actionLabel = "View details",
  active = false
}) {
  const interactive =
    Boolean(onClick);

  const Component =
    interactive
      ? motion.button
      : motion.div;

  return (

    <Component

      initial={{
        opacity: 0,
        y: 20
      }}

      animate={{
        opacity: 1,
        y: 0
      }}

      whileHover={{
        y: -5,
        scale: 1.02
      }}

      type={interactive ? "button" : undefined}

      onClick={onClick}

      className={`
        bg-white
        rounded-2xl
        p-6
        shadow-md
        border
        text-left
        w-full
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-[#008C95]
        focus:ring-offset-2
        ${interactive ? "cursor-pointer hover:border-[#008C95]" : ""}
        ${active ? "border-[#008C95]" : "border-gray-100"}
      `}

    >

      <div className="flex items-start justify-between gap-3">
        <p
          className="
          text-gray-500
          mb-2
          "
        >
          {title}
        </p>

        {
          Icon &&
          <span className="rounded-xl bg-teal-50 p-2 text-[#008C95]">
            <Icon size={20} />
          </span>
        }
      </div>

      <h2
        className="
        text-4xl
        font-bold
        text-[#008C95]
        "
      >
        {value}
      </h2>

      {
        subtitle &&
        <p className="mt-2 text-sm text-gray-500">
          {subtitle}
        </p>
      }

      {
        interactive &&
        <p className="mt-4 text-sm font-semibold text-[#008C95]">
          {actionLabel}
        </p>
      }

    </Component>

  );

}

export default StatCard;
