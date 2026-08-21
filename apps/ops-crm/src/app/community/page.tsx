'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Camera, Heart, Users, CheckCircle2, Share2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function CommunityLoggerPage() {
  const [title, setTitle] = useState('Morning Yoga & Laughter Therapy Workshop');
  const [category, setCategory] = useState('WELLNESS_WORKSHOP');
  const [selectedSeniors, setSelectedSeniors] = useState<string[]>(['Gopalakrishnan Menon', 'Kalyani Raghavan']);
  const [smileScore, setSmileScore] = useState(5);
  const [seniorQuote, setSeniorQuote] = useState('Today felt like meeting old friends from college days!');
  const [isPublished, setIsPublished] = useState(false);

  const seniorsList = [
    'Gopalakrishnan Menon',
    'Kalyani Raghavan',
    'Venkataraman Swaminathan',
    'Anasuya Rao',
    'Savitri Devi',
  ];

  const handleToggleSenior = (name: string) => {
    setSelectedSeniors((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Community & Content Lead Mobile Story Logger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            &lt;60s rapid mobile event capture • Family Portal 'Community Moments' publishing • Monthly digest highlights
          </p>
        </div>
      </div>

      {/* Main Story Logger Card */}
      <form onSubmit={handlePublish} className="bento-card p-6 space-y-5 text-xs">
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
            Event Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-brand-500 text-xs"
            required
          />
        </div>

        {/* Category & Engagement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Event Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-brand-500 text-xs"
            >
              <option value="WELLNESS_WORKSHOP">Wellness & Yoga Workshop</option>
              <option value="MUSIC_NOSTALGIA">Classical Music & Nostalgia Hour</option>
              <option value="TECH_LITERACY">Senior Smartphone & Tech Literacy</option>
              <option value="GARDENING_CLUB">Herbal Gardening & Nature Walk</option>
            </select>
          </div>

          <div>
            <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
              Smile & Engagement Score (1 - 5)
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setSmileScore(score)}
                  className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${
                    smileScore === score
                      ? 'bg-secondary-500 text-white shadow-xs scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⭐ {score}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attendee Senior Multi-Select */}
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
            Tagged Senior Attendees ({selectedSeniors.length} selected)
          </label>
          <div className="flex flex-wrap gap-2">
            {seniorsList.map((senior) => {
              const isSelected = selectedSeniors.includes(senior);
              return (
                <button
                  type="button"
                  key={senior}
                  onClick={() => handleToggleSenior(senior)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand-50 text-brand-700 border border-brand-300 font-black shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{senior}
                </button>
              );
            })}
          </div>
        </div>

        {/* Memorable Quote */}
        <div>
          <label className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
            Memorable Senior Quote (For NRI Family Monthly Digest)
          </label>
          <textarea
            rows={2}
            value={seniorQuote}
            onChange={(e) => setSeniorQuote(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-brand-500 text-xs"
            placeholder="Share what the senior said during the activity..."
            required
          />
        </div>

        {/* Photo Upload Simulator */}
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
          <Camera size={24} className="mx-auto text-brand-600" />
          <span className="text-xs font-bold text-slate-700 block">Photo Attached (community_yoga_session.jpg)</span>
          <span className="text-[10px] text-slate-400 block">Automatically compressed & watermarked for privacy</span>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-slate-400 font-medium">Flows directly into Family Portal Moments feed.</span>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-xs glow-primary flex items-center gap-2 transition-all"
          >
            <Share2 size={15} />
            <span>{isPublished ? '✓ Published to Family Portal & Digest!' : 'Publish Community Story'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
