'use client';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CopyButton({ text, label, icon }: { text: string, label: string, icon?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="flex-1 bg-white/20 hover:bg-white/30 border border-white/30 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
      {copied ? <Check className="w-4 h-4" /> : (icon || <Copy className="w-4 h-4" />)} 
      {label}
    </button>
  );
}
