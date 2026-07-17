import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip
}
from "recharts";

function PerformanceChart({
  data = []
}) {
  const chartData =
    Array.isArray(data)
    ? data.filter((item)=>
      item?.month &&
      Number.isFinite(
        Number(item.score)
      )
    )
    : [];

  const hasData =
    chartData.length > 0;

  return (

    <div
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
        Performance Trend
      </h3>

      <div className="h-[300px]">

        {
          hasData
          ? (
            <ResponsiveContainer>

              <AreaChart data={chartData}>

                <XAxis dataKey="month" />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#008C95"
                  fill="#00B38C"
                />

              </AreaChart>

            </ResponsiveContainer>
          )
          : (
            <div
              className="
              h-full
              flex
              items-center
              justify-center
              text-gray-500
              text-sm
              "
            >
              No graded submissions yet
            </div>
          )
        }

      </div>

    </div>

  );

}

export default PerformanceChart;
