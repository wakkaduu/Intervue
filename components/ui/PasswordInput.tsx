"use client";

import { useState } from "react";

/** Shared text-input styling for forms: 44px tall, 16px text on phones (prevents iOS zoom). */
export const INPUT_CLASS =
  "w-full min-h-[44px] rounded-xl border border-sage-300 bg-[#F0F5F1] px-3.5 py-2.5 text-base sm:text-sm text-darkslate-900 placeholder:text-darkslate-400 focus:bg-[#E8F0EA] focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-500/30 transition-all";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
}

/** Password input with a Show/Hide toggle (helps on phones, where typos are common). */
export default function PasswordInput({ id, value, onChange, autoComplete, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_CLASS} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-forest-800 hover:bg-[#D4E3D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
