import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ComfortLevel } from '../types';

interface TimelineChartProps {
  data: {
    time: string;
    temp: number;
    level: number;
    comfort: ComfortLevel;
  }[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100">
          <p className="font-bold text-gray-800 mb-1">{item.time}</p>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.comfort.color}`} />
            <span className="font-medium">{item.comfort.status}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{item.temp}°C</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full mt-4 min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            interval={3}
          />
          <YAxis hide domain={[0, 7]} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="level" 
            stroke="#38bdf8" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorLevel)" 
          />
          {/* Best time markers could be added here */}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
