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

function ClassPerformanceChart({
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
        Subject Performance
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >

        <BarChart
          data={data}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="className"
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="average"
            radius={[8,8,0,0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}

export default ClassPerformanceChart;
