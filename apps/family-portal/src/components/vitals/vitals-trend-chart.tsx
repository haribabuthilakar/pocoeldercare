'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

interface VitalsReading {
  date: string;
  systolicBp: number;
  diastolicBp: number;
  pulseBpm: number;
  spo2Percent: number;
  glucoseFasting?: number;
  glucoseRandom?: number;
  weightKg?: number;
}

interface VitalsTrendChartProps {
  readings?: VitalsReading[];
}

const defaultMockReadings: VitalsReading[] = [
  { date: 'Aug 15', systolicBp: 124, diastolicBp: 80, pulseBpm: 72, spo2Percent: 98, glucoseFasting: 104, weightKg: 68.2 },
  { date: 'Aug 16', systolicBp: 128, diastolicBp: 82, pulseBpm: 74, spo2Percent: 97, glucoseFasting: 108, weightKg: 68.3 },
  { date: 'Aug 17', systolicBp: 122, diastolicBp: 78, pulseBpm: 70, spo2Percent: 98, glucoseFasting: 99, weightKg: 68.1 },
  { date: 'Aug 18', systolicBp: 130, diastolicBp: 84, pulseBpm: 76, spo2Percent: 96, glucoseFasting: 112, weightKg: 68.4 },
  { date: 'Aug 19', systolicBp: 126, diastolicBp: 81, pulseBpm: 73, spo2Percent: 98, glucoseFasting: 102, weightKg: 68.2 },
  { date: 'Aug 20', systolicBp: 125, diastolicBp: 79, pulseBpm: 71, spo2Percent: 99, glucoseFasting: 106, weightKg: 68.0 },
  { date: 'Aug 21', systolicBp: 128, diastolicBp: 82, pulseBpm: 74, spo2Percent: 97, glucoseFasting: 105, weightKg: 68.1 },
];

export const VitalsTrendChart: React.FC<VitalsTrendChartProps> = ({
  readings = defaultMockReadings,
}) => {
  const [metric, setMetric] = useState<'bp' | 'spo2' | 'glucose' | 'pulse'>('bp');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Geriatric Vitals Trend</h2>
            <span className="w-2.5 h-2.5 rounded-full bg-[#12C395] animate-ping" />
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Automated <strong className="text-[#12C395]">#12C395 safe-zone bands</strong> with continuous clinical telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setMetric('bp')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                metric === 'bp' ? 'bg-[#12C395] text-white shadow glow-primary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BP (mmHg)
            </button>
            <button
              onClick={() => setMetric('spo2')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                metric === 'spo2' ? 'bg-[#12C395] text-white shadow glow-primary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SpO2 (%)
            </button>
            <button
              onClick={() => setMetric('glucose')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                metric === 'glucose' ? 'bg-[#FE1D8F] text-white shadow glow-secondary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Glucose
            </button>
            <button
              onClick={() => setMetric('pulse')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                metric === 'pulse' ? 'bg-[#FE1D8F] text-white shadow glow-secondary' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pulse
            </button>
          </div>

          {/* Timeframe */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 ${
                  timeframe === tf ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'bp' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              {/* Geriatric Normal BP Safe Zone: 90 - 140 mmHg systolic */}
              <ReferenceArea y1={90} y2={140} fill="#edfaf5" fillOpacity={0.8} />
              <ReferenceLine y={140} stroke="#12C395" strokeDasharray="3 3" />
              <ReferenceLine y={90} stroke="#12C395" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[60, 160]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #12C395', color: '#fff', fontFamily: 'Poppins' }}
              />
              <Line
                type="monotone"
                dataKey="systolicBp"
                name="Systolic BP"
                stroke="#12C395"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#12C395', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, stroke: '#12C395', strokeWidth: 3 }}
              />
              <Line
                type="monotone"
                dataKey="diastolicBp"
                name="Diastolic BP"
                stroke="#FE1D8F"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FE1D8F', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          ) : metric === 'spo2' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={94} y2={100} fill="#edfaf5" fillOpacity={0.8} />
              <ReferenceLine y={94} stroke="#12C395" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #12C395', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="spo2Percent"
                name="SpO2 %"
                stroke="#12C395"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#12C395', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : metric === 'glucose' ? (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={70} y2={130} fill="#fee5f2" fillOpacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[60, 200]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #FE1D8F', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="glucoseFasting"
                name="Fasting Glucose"
                stroke="#FE1D8F"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#FE1D8F', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart data={readings} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <ReferenceArea y1={60} y2={90} fill="#fee5f2" fillOpacity={0.6} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <YAxis domain={[50, 110]} stroke="#94a3b8" fontSize={11} tickLine={false} fontFamily="Poppins" />
              <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderRadius: '16px', border: '1px solid #FE1D8F', color: '#fff' }} />
              <Line
                type="monotone"
                dataKey="pulseBpm"
                name="Pulse (BPM)"
                stroke="#FE1D8F"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#FE1D8F', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#12C395] shadow-xs" />
            <span>Primary: #12C395 Safe Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#FE1D8F] shadow-xs" />
            <span>Secondary: #FE1D8F Telemetry</span>
          </div>
        </div>
        <span className="text-slate-400">Bluetooth RPM Ingested Today 08:30 AM</span>
      </div>
    </div>
  );
};
