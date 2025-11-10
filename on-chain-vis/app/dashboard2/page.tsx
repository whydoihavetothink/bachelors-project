"use client"

import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Legend, Line, Tooltip } from 'recharts'

export default function FinancialGraph2() {
  return (
    <ResponsiveContainer height={400}>
    <LineChart
        accessibilityLayer
        data={[
        {
            amt: 1400,
            name: 'Page A',
            pv: 800,
            uv: 590
        },
        {
            amt: 1400,
            name: 'Page B',
            pv: 800,
            uv: 590
        },
        {
            amt: 1506,
            name: 'Page C',
            pv: 967,
            uv: 868
        },
        {
            amt: 989,
            name: 'Page D',
            pv: 1098,
            uv: 1397
        },
        {
            amt: 1228,
            name: 'Page E',
            pv: 1200,
            uv: 1480
        },
        {
            amt: 1100,
            name: 'Page F',
            pv: 1108,
            uv: 1520
        },
        {
            amt: 1700,
            name: 'Page G',
            pv: 680,
            uv: 1400
        }
        ]}
        margin={{
        bottom: 5,
        left: 5,
        right: 5,
        top: 5
        }}
        syncMethod="index"
    >
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Legend
        height={36}
        iconType="circle"
        onClick={function cpe(){}}
        />
        <Line
        dataKey="uv"
        fill="#8884d8"
        stroke="#8884d8"
        type="monotone"
        />
        <Line
        dataKey="pv"
        fill="#8884d8"
        stroke="#987"
        type="monotone"
        />
        <Tooltip />

    </LineChart>
    </ResponsiveContainer>
  )
}