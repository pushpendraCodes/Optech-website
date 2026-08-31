export const PUBLIC_TYPING_PASSAGES = {
  english: [
    "Optech Computer Institute trains students in practical computing, accounting, and programming so they can work with confidence in offices across Maharashtra.",
    "Regular typing practice builds muscle memory. Focus on accuracy first, then speed will follow naturally over time.",
    "Computer literacy includes keyboard skills, file management, and clear communication through email and documents.",
    "Students learn Microsoft Office, Tally, web design, and programming languages in hands-on lab sessions at our Deori campus.",
  ],
  hindi: [
    "आप टेक कम्प्यूटर संस्थान देवरी में विद्यार्थी कंप्यूटर, टैली और टाइपिंग का अभ्यास करते हैं। नियमित अभ्यास से गति और शुद्धता बढ़ती है।",
    "सटीक टाइपिंग के लिए सही अंगुलियों का उपयोग करें और स्क्रीन पर देखकर टाइप करने की आदत डालें।",
    "कंप्यूटर शिक्षा में टाइपिंग, खाता लेखा और प्रोग्रामिंग सभी महत्वपूर्ण कौशल हैं।",
    "हर दिन थोड़ा अभ्यास करने से आपकी टाइपिंग गति धीरे धीरे बढ़ती रहती है और गलतियाँ कम होती हैं।",
  ],
} as const;

export type TypingLang = keyof typeof PUBLIC_TYPING_PASSAGES;

export function pickPassage(lang: TypingLang) {
  const list = PUBLIC_TYPING_PASSAGES[lang];
  return list[Math.floor(Math.random() * list.length)];
}

export function wpmLabel(wpm: number, lang: TypingLang) {
  if (lang === "hindi") {
    if (wpm >= 35) return "Excellent";
    if (wpm >= 25) return "Good";
    if (wpm >= 15) return "Average";
    return "Keep practicing";
  }
  if (wpm >= 60) return "Excellent";
  if (wpm >= 40) return "Good";
  if (wpm >= 25) return "Average";
  return "Keep practicing";
}
