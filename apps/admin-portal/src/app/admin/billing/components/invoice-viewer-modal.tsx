'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@poco/ui';
import { Download, FileText, CheckCircle } from 'lucide-react';

export interface InvoiceStatement {
  invoiceNumber: string;
  billingMonth: string;
  householdName: string;
  householdAddress: string;
  city: string;
  subscriptionPlan: string;
  subscriptionFeePaise: number;
  walletTopUpsPaise: number;
  itemizedServices: Array<{
    title: string;
    date: string;
    coveredByQuota: boolean;
    costPaise: number;
  }>;
  subtotalPaise: number;
  gstPaise: number; // 18% GST
  totalPaise: number;
}

export interface InvoiceViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceStatement | null;
}

export function InvoiceViewerModal({
  open,
  onOpenChange,
  invoice,
}: InvoiceViewerModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate invoice download
    setTimeout(() => {
      setIsDownloading(false);
      onOpenChange(false);
    }, 600);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base text-slate-900">
            <FileText className="w-5 h-5 text-[#12C395]" />
            <span>Monthly Invoice Statement — #{invoice.invoiceNumber}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Billing Cycle: {invoice.billingMonth} • Household: {invoice.householdName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Household Billing Address */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
            <div>
              <div className="text-slate-400 text-[10px] uppercase font-bold">Billed To</div>
              <div className="font-bold text-slate-900 text-xs">{invoice.householdName}</div>
              <div className="text-slate-500 text-[11px]">{invoice.householdAddress}, {invoice.city}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Plan</div>
              <Badge variant="primary" className="text-[10px]">
                {invoice.subscriptionPlan}
              </Badge>
            </div>
          </div>

          {/* Itemized Services Breakdown */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Itemized Service Deliveries & Quota Consumption
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
              {invoice.itemizedServices.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.date}</div>
                  </div>
                  <div className="text-right">
                    {item.coveredByQuota ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Covered in Quota
                      </span>
                    ) : (
                      <span className="font-bold text-slate-900 font-mono">
                        ₹{(item.costPaise / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation Totals */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subscription Base Fee:</span>
              <span>₹{(invoice.subscriptionFeePaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{(invoice.subtotalPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%):</span>
              <span>₹{(invoice.gstPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
              <span>Total Invoice Amount:</span>
              <span className="text-emerald-700">₹{(invoice.totalPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isDownloading}
            onClick={handleDownload}
            className="bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download Monthly Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
