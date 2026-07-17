import {
  Megaphone,
  School
}
from "lucide-react";

import { motion }
from "framer-motion";

function AnnouncementsTable({
  announcements
}) {

  return (

    <div
      className="
      space-y-5
      "
    >

      {announcements.map(
        (announcement,index)=>(

          <motion.div

            key={announcement.id}

            initial={{
              opacity:0,
              y:20
            }}

            animate={{
              opacity:1,
              y:0
            }}

            transition={{
              delay:index * 0.05
            }}

            whileHover={{
              y:-3
            }}

            className="
            bg-white
            rounded-3xl
            shadow-md
            hover:shadow-xl
            transition-all
            p-6
            "

          >

            <div
              className="
              flex
              items-start
              gap-4
              "
            >

              <div
                className="
                bg-teal-100
                text-[#008C95]
                p-3
                rounded-full
                "
              >

                <Megaphone
                  size={20}
                />

              </div>

              <div
                className="
                flex-1
                "
              >

                <div
                  className="
                  flex
                  justify-between
                  items-start
                  "
                >

                  <div>

                    <h3
                      className="
                      text-lg
                      font-bold
                      "
                    >
                      {announcement.title}
                    </h3>

                    <div
                      className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-gray-500
                      mt-1
                      "
                    >

                      <School
                        size={14}
                      />

                      <span>

                        {
                          announcement.class
                          ?.name
                        }

                      </span>

                    </div>

                  </div>

                  <span
                    className="
                    text-xs
                    text-gray-400
                    "
                  >

                    {

                      new Date(
                        announcement.createdAt
                      ).toLocaleDateString()

                    }

                  </span>

                </div>

                <p
                  className="
                  mt-4
                  text-gray-700
                  leading-relaxed
                  "
                >

                  {
                    announcement.content
                  }

                </p>

                <div
                  className="
                  mt-4
                  flex
                  items-center
                  gap-3
                  "
                >

                  <span
                    className="
                    bg-teal-100
                    text-[#008C95]
                    text-xs
                    px-3
                    py-1
                    rounded-full
                    "
                  >

                    Admin Broadcast

                  </span>

                </div>

              </div>

            </div>

          </motion.div>

        )
      )}

    </div>

  );

}

export default AnnouncementsTable;