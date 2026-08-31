import * as React from 'react';
import {
  Dialog,
  DialogContent
} from '@poco/ui';
import { MockSettingsEditor } from './mock-settings-editor';
import type { PartnerHealthItem } from '../actions';
import type { MockSettings } from '@poco/integrations';

export interface FaultInjectionDrawerProps {
  partner: PartnerHealthItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSettings: (partnerCode: string, settings: MockSettings) => Promise<void>;
}

export function FaultInjectionDrawer({
  partner,
  open,
  onOpenChange,
  onSaveSettings
}: FaultInjectionDrawerProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  if (!partner) return null;

  const handleSave = async (settings: MockSettings) => {
    setIsSaving(true);
    try {
      await onSaveSettings(partner.partnerCode, settings);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
        <MockSettingsEditor
          initialSettings={partner.mockSettings}
          partnerName={partner.name}
          partnerCode={partner.partnerCode}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
          isSaving={isSaving}
        />
      </DialogContent>
    </Dialog>
  );
}
