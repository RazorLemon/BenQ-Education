import {

 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer

}
from "recharts";

function PerformanceTrendChart({
 history
}){

 const chartData =

  history

   .filter(
    item=>

     item.grade !==
     null

   )

   .map(
    item=>({

     assignment:
      item.title,

     grade:
      item.grade

    })
   );

 if(
  chartData.length === 0
 ){

  return(

   <div
    className="
    text-gray-500
    mb-6
    "
   >

    No grades available

   </div>

  );

 }

 return(

  <div
   className="
   h-72
   mb-8
   "
  >

   <ResponsiveContainer
    width="100%"
    height="100%"
   >

    <LineChart
     data={chartData}
    >

     <CartesianGrid
      strokeDasharray="3 3"
     />

     <XAxis
      dataKey="assignment"
     />

     <YAxis
      domain={[0,100]}
     />

     <Tooltip />

     <Line

      type="monotone"

      dataKey="grade"

      stroke="#008C95"

      strokeWidth={3}

     />

    </LineChart>

   </ResponsiveContainer>

  </div>

 );

}

export default PerformanceTrendChart;