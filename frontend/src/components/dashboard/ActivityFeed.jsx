import { motion } from "framer-motion";

const formatRelativeTime = (dateValue) => {
  const date =
    new Date(dateValue);

  const diffMs =
    Date.now() - date.getTime();

  const minutes =
    Math.max(
      1,
      Math.floor(diffMs / 60000)
    );

  if(minutes < 60){
    return `${minutes} min ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if(hours < 24){
    return `${hours} hr ago`;
  }

  const days =
    Math.floor(hours / 24);

  return `${days} day${days === 1 ? "" : "s"} ago`;
};

function ActivityFeed({
  activities = []
}) {

  return (

    <motion.div

      initial={{
        opacity: 0,
        x: 20
      }}

      animate={{
        opacity: 1,
        x: 0
      }}

      className="
      bg-white
      rounded-2xl
      p-6
      shadow-md
      "

    >

      <h3
        className="
        text-lg
        font-semibold
        mb-4
        "
      >
        Recent Activity
      </h3>

      <div className="space-y-4">

        {
          activities.length === 0
          ? (
            <div
              className="
              text-sm
              text-gray-500
              py-6
              "
            >
              No activity yet
            </div>
          )
          : activities.map((item)=>(

          <div
            key={item.id}
            className="
            border-b
            pb-3
            "
          >

            <p className="font-medium">
              {item.text}
            </p>

            <span
              className="
              text-sm
              text-gray-500
              "
            >
              {formatRelativeTime(item.createdAt)}
            </span>

          </div>

          ))
        }

      </div>

    </motion.div>

  );

}

export default ActivityFeed;
