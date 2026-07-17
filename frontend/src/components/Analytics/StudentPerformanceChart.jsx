import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
}
from "recharts";

function StudentPerformanceChart({
  data
}) {

  return (

    <div
      className="
      bg-white
      rounded-2xl
      shadow-md
      p-6
      "
    >

      <h2
        className="
        text-xl
        font-bold
        mb-4
        "
      >
        Student Rankings
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <BarChart
          data={data}
          layout="vertical"
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            type="number"
          />

          <YAxis
            type="category"
            dataKey="studentName"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="average"
            radius={[0,8,8,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}

export default StudentPerformanceChart;