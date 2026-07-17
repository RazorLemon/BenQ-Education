import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 ResponsiveContainer,
 Legend
}
from "recharts";

import {
 motion
}
from "framer-motion";

function PieChartCard({

 title,
 data

}){

 const COLORS = [

  "#008C95",
  "#00A7A5",
  "#2CC7B3",
  "#7ADBCF",
  "#D9F5F1"

 ];

 return(

  <motion.div

   initial={{
    opacity:0,
    y:20
   }}

   animate={{
    opacity:1,
    y:0
   }}

   className="
   bg-white
   rounded-3xl
   shadow-md
   p-6
   "

  >

   <h2
    className="
    text-xl
    font-bold
    mb-6
    "
   >
    {title}
   </h2>

   <div
    className="
    h-[320px]
    "
   >

    <ResponsiveContainer
     width="100%"
     height="100%"
    >

     <PieChart>

      <Pie

       data={data}

       dataKey="value"

       nameKey="name"

       cx="50%"

       cy="50%"

       outerRadius={110}

       label

       animationDuration={1200}

      >

       {

        data.map(
         (
          entry,
          index
         )=>(

          <Cell

           key={index}

           fill={
            COLORS[
             index %
             COLORS.length
            ]
           }

          />

         )
        )

       }

      </Pie>

      <Tooltip />

      <Legend />

     </PieChart>

    </ResponsiveContainer>

   </div>

  </motion.div>

 );

}

export default PieChartCard;