"use client";

import React, { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export const POPULAR_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "zh-CN", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
];

interface GoogleTranslateProps {
  variant?: "navbar" | "floating" | "inline";
  className?: string;
}

export const GoogleTranslate: React.FC<GoogleTranslateProps> = ({
  variant = "navbar",
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Read current language from cookie if set
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Google Translate element init callback
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        }
      } catch (err) {
        console.error("Google Translate Init Error:", err);
      }
    };

    // Load Google Translate script once
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    // Aggressively suppress Google Translate top banner frame & reset body position
    const hideBanner = () => {
      const bannerFrames = document.querySelectorAll(
        ".goog-te-banner-frame, iframe.goog-te-banner-frame, iframe.skiptranslate, .goog-te-banner"
      );
      bannerFrames.forEach((frame) => {
        (frame as HTMLElement).style.setProperty("display", "none", "important");
        (frame as HTMLElement).style.setProperty("visibility", "hidden", "important");
        (frame as HTMLElement).style.setProperty("height", "0", "important");
        (frame as HTMLElement).style.setProperty("opacity", "0", "important");
        (frame as HTMLElement).style.setProperty("pointer-events", "none", "important");
      });

      // Hide skip-translate wrappers created at body level (except those holding our translate picker)
      const topContainers = document.querySelectorAll("body > .skiptranslate");
      topContainers.forEach((el) => {
        if (!el.querySelector("#google_translate_element")) {
          (el as HTMLElement).style.setProperty("display", "none", "important");
          (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
          (el as HTMLElement).style.setProperty("height", "0", "important");
          (el as HTMLElement).style.setProperty("opacity", "0", "important");
          (el as HTMLElement).style.setProperty("pointer-events", "none", "important");
        }
      });

      if (document.body.style.top && document.body.style.top !== "0px") {
        document.body.style.setProperty("top", "0px", "important");
      }
      if (document.body.style.marginTop && document.body.style.marginTop !== "0px") {
        document.body.style.setProperty("margin-top", "0px", "important");
      }
    };

    hideBanner();
    const bannerInterval = setInterval(hideBanner, 150);

    const observer = new MutationObserver(() => {
      hideBanner();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Click outside to close dropdown
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(bannerInterval);
      observer.disconnect();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Set cookie on root and domain
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    if (hostname && hostname !== "localhost") {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${hostname};`;
    }

    // Attempt to trigger change on Google Translate select
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Reload page to apply cookie translation if widget element not yet created
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 border border-indigo-100 text-xs text-slate-500">
        <Globe className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        <span>Translate</span>
      </div>
    );
  }

  const activeLangObj = POPULAR_LANGUAGES.find((l) => l.code === currentLang) || {
    code: currentLang,
    name: currentLang.toUpperCase(),
    native: currentLang.toUpperCase(),
    flag: "🌐",
  };

  if (variant === "floating") {
    return (
      <div ref={dropdownRef} className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-950 text-white hover:bg-slate-800 shadow-2xl border border-white/20 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
            title="Translate Website"
          >
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{activeLangObj.flag} {activeLangObj.native}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute bottom-12 right-0 w-72 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl border border-indigo-100 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" /> Translate Website
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Google Translate</span>
              </div>

              {/* Native Google Translate combo container */}
              <div className="p-1.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                <div id="google_translate_element" className="w-full flex items-center justify-center" />
              </div>

              {/* Quick Language Selection Grid */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-1">
                Quick Select
              </div>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-1">
                {POPULAR_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      currentLang === lang.code
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.native}</span>
                    </span>
                    {currentLang === lang.code && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 hover:bg-white border border-indigo-100 hover:border-indigo-300 text-slate-700 transition-all shadow-xs text-xs font-semibold group"
        title="Translate Website (Google Translate)"
      >
        <Globe className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
        <span className="flex items-center gap-1">
          <span>{activeLangObj.flag}</span>
          <span className="hidden sm:inline text-slate-800 font-bold">{activeLangObj.native}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-72 p-3 bg-white/95 backdrop-blur-2xl rounded-2xl border border-indigo-100 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> Translate Website
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Google Translate</span>
          </div>

          {/* Native Google Translate combo for all 100+ languages */}
          <div className="p-1.5 bg-indigo-50/50 rounded-xl border border-indigo-100/60 flex items-center justify-center">
            <div id="google_translate_element" className="w-full flex items-center justify-center" />
          </div>

          {/* Quick Popular Languages */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-1">
            Popular Languages
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-1">
            {POPULAR_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentLang === lang.code
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span>{lang.flag}</span>
                  <span className="truncate">{lang.native}</span>
                </span>
                {currentLang === lang.code && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

