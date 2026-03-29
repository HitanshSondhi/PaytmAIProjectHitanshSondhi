import type { Lang } from "../types";

interface LangSelectorProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'en-IN', label: 'EN' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
];

export function LangSelector({ lang, onLangChange }: LangSelectorProps) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-full p-1">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => onLangChange(code)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            lang === code
              ? 'bg-indigo-500 text-white'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
