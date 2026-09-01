import React, { useState } from 'react';
import { database } from '../../db/database';
import { syncEngine } from '../../sync/sync-engine';
import { Send, Camera, Image as ImageIcon } from 'lucide-react';

export interface MessageComposerProps {
  householdId: string;
  authorId?: string;
  onMessageSent?: () => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  householdId,
  authorId = 'co_prof_001',
  onMessageSent,
}) => {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !hasPhoto) return;

    setIsSending(true);
    try {
      const mediaUrl = hasPhoto
        ? `file:///data/cache/note_photo_${Date.now()}.jpg`
        : undefined;

      // 1. Optimistic write to local WatermelonDB
      const newItem = await database.activityFeedItems.create({
        household_id: householdId,
        author_id: authorId,
        author_role: 'CARE_OFFICER',
        content: content.trim(),
        media_url: mediaUrl,
        created_at: Date.now(),
        synced: false,
      });

      // 2. Stage mutation in sync_outbox
      await database.stageMutation('FEED_NOTE', 'activity_feed_items', newItem.id, {
        householdId,
        authorId,
        authorRole: 'CARE_OFFICER',
        content: content.trim(),
        mediaUrl,
        createdAt: Date.now(),
      });

      setContent('');
      setHasPhoto(false);
      onMessageSent?.();

      // 3. Trigger sync if online
      if (syncEngine.getState().isOnline) {
        syncEngine.sync();
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      data-testid="message-composer-form"
      className="bg-white border-t border-slate-200 p-3 flex items-center gap-2"
    >
      <button
        type="button"
        data-testid="attach-photo-button"
        onClick={() => setHasPhoto(!hasPhoto)}
        className={`p-2 rounded-xl transition-colors ${
          hasPhoto
            ? 'bg-emerald-100 text-emerald-700'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
        }`}
        title="Attach Photo"
      >
        <Camera className="w-5 h-5" />
      </button>

      <input
        type="text"
        data-testid="message-composer-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a care note or update for family..."
        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
      />

      <button
        type="submit"
        data-testid="send-message-button"
        disabled={isSending || (!content.trim() && !hasPhoto)}
        className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-colors"
      >
        <Send className="w-4 h-4" />
        <span>Send</span>
      </button>
    </form>
  );
};
export default MessageComposer;
