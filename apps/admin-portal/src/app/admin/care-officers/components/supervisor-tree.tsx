'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, AvatarFallback, cn } from '@poco/ui';
import { Network, Users, ChevronRight, ShieldCheck } from 'lucide-react';

export interface SupervisorNode {
  id: string;
  name: string;
  email: string;
  role: string;
  cluster: string;
  officers: Array<{
    id: string;
    name: string;
    phone: string;
    activeCaseload: number;
    assignedHouseholdName?: string;
    isAvailable: boolean;
  }>;
}

export function SupervisorTree({
  supervisors,
}: {
  supervisors: SupervisorNode[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Network className="w-4 h-4 text-[#12C395]" />
        <span>Supervisor Reporting & Escalation Tree</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supervisors.map((sup) => (
          <Card key={sup.id} className="border-slate-200 shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-slate-800 text-white text-xs font-bold">
                      {sup.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{sup.name}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sup.role.replace(/_/g, ' ')} • Cluster: {sup.cluster}
                    </div>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {sup.officers.length} Supervised
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {sup.officers.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-3 italic">
                  No care officers currently reporting to this supervisor.
                </div>
              ) : (
                sup.officers.map((officer) => (
                  <div
                    key={officer.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {officer.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {officer.assignedHouseholdName
                            ? `Household: ${officer.assignedHouseholdName}`
                            : 'Unassigned Household'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.2 rounded font-semibold',
                          officer.activeCaseload > 3
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        Caseload: {officer.activeCaseload}
                      </span>
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          officer.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
