'use client';

import React, { useState } from 'react';
import { Activity, Download, FileText, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react';

export interface DiagnosticWebhookReport {
  id: string;
  labPartner: 'Dr. Lal PathLabs' | 'Thyrocare' | 'Agilus Diagnostics';
  seniorName: string;
  testPackage: string;
  receivedAt: string;
  pdfReportUrl: string;
  biomarkers: {
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isCritical: boolean;
  }[];
  clinicalAlertTriggered: boolean;
}

const mockReports: DiagnosticWebhookReport[] = [
  {
    id: 'lab-9001',
    labPartner: 'Dr. Lal PathLabs',
    seniorName: 'Gopalakrishnan Menon',
    testPackage: 'Comprehensive Senior Diabetic & Lipid Profile',
    receivedAt: 'Today at 12:30 PM',
    pdfReportUrl: '/reports/menon_lalpathlabs_aug2026.pdf',
    biomarkers: [
      { name: 'HbA1c (Glycated Hb)', value: '8.8', unit: '%', referenceRange: '< 7.0%', isCritical: true },
      { name: 'Fasting Blood Sugar', value: '184', unit: 'mg/dL', referenceRange: '70 - 100', isCritical: true },
      { name: 'Total Cholesterol', value: '192', unit: 'mg/dL', referenceRange: '< 200', isCritical: false },
      { name: 'Serum Creatinine', value: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.2', isCritical: false },
      { name: 'Hemoglobin', value: '13.4', unit: 'g/dL', referenceRange: '13.0 - 17.0', isCritical: false },
    ],
    clinicalAlertTriggered: true,
  },
  {
    id: 'lab-9002',
    labPartner: 'Thyrocare',
    seniorName: 'Kalyani Raghavan',
    testPackage: 'Thyroid & Electrolyte Panel',
    receivedAt: 'Yesterday at 4:10 PM',
    pdfReportUrl: '/reports/raghavan_thyrocare_aug2026.pdf',
    biomarkers: [
      { name: 'TSH (Thyroid Stimulating)', value: '3.2', unit: 'uIU/mL', referenceRange: '0.4 - 4.2', isCritical: false },
      { name: 'Serum Sodium', value: '138', unit: 'mEq/L', referenceRange: '135 - 145', isCritical: false },
      { name: 'Serum Potassium', value: '4.4', unit: 'mEq/L', referenceRange: '3.5 - 5.0', isCritical: false },
    ],
    clinicalAlertTriggered: false,
  },
];

export const DiagnosticLabWebhookPanel: React.FC = () => {
  return (
    <div className="bento-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 m-0">
              Diagnostic Lab Webhook Ingestion & Biomarker Alerts
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Dr. Lal PathLabs • Thyrocare • Agilus Diagnostics (Auto-PDF & Critical Flags)
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs">
          Webhook Endpoint: /api/v1/webhooks/lab
        </span>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {mockReports.map((report) => (
          <div key={report.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-black">
                    {report.labPartner}
                  </span>
                  <strong className="text-xs font-black text-slate-900">{report.seniorName}</strong>
                </div>
                <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                  {report.testPackage} • Ingested {report.receivedAt}
                </p>
              </div>

              {report.clinicalAlertTriggered && (
                <span className="px-2.5 py-1 rounded-xl bg-secondary-50 text-secondary-600 border border-secondary-200 text-[10px] font-black uppercase flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Critical Value Alert</span>
                </span>
              )}
            </div>

            {/* Biomarker Pills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {report.biomarkers.map((b) => (
                <div
                  key={b.name}
                  className={`p-2.5 rounded-xl border ${
                    b.isCritical
                      ? 'bg-secondary-50/70 border-secondary-300 text-secondary-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-[9px] text-slate-400 font-bold block truncate">{b.name}</span>
                  <strong className="text-sm font-black font-mono block">
                    {b.value} {b.unit}
                  </strong>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Ref: {b.referenceRange}
                  </span>
                </div>
              ))}
            </div>

            {/* Proactive Doctor Action */}
            {report.clinicalAlertTriggered && (
              <div className="p-3 rounded-xl bg-white border border-secondary-200 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-secondary-600" />
                  <span>Proactive Doctor Review Ticket Auto-Created (HbA1c &gt; 8.5%)</span>
                </span>
                <span className="text-brand-600 font-extrabold">Assigned to Dr. Arvind Narayanan</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
