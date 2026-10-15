import React from 'react';
import { Terminal, Cpu, Music, BookOpen, Trophy, Users, Presentation, Sparkles } from 'lucide-react';

const CATEGORY_STYLES = {
  Hackathon: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Terminal,
  },
  'Tech Fest': {
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: Cpu,
  },
  Cultural: {
    bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    icon: Music,
  },
  Workshop: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: BookOpen,
  },
  Sports: {
    bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: Trophy,
  },
  Conference: {
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: Users,
  },
  Symposium: {
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Presentation,
  },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const conf = CATEGORY_STYLES[category] || {
    bg: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    icon: Sparkles,
  };
  const Icon = conf.icon;

  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${conf.bg} ${sizeClasses} backdrop-blur-sm transition-colors`}
    >
      <Icon size={size === 'xs' ? 11 : 13} />
      <span>{category}</span>
    </span>
  );
}
