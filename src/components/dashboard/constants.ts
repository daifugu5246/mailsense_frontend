export type Email = {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  category: string;
  purpose: string;
  date: string;
  link: string;
  correctness: 'correct' | 'wrong' | null;
};

// Categories in English
export const CATEGORIES = [
  "Government",
  "Recruitment",
  "Welfare",
  "Affiliates",
  "Others"
];

// Category display mapping (can be used if different display names needed)
export const CATEGORY_MAPPING: Record<string, string> = {
  "Government": "Government",
  "Recruitment": "Recruitment",
  "Welfare": "Welfare",
  "Affiliates": "Affiliates",
  "Others": "Others"
};
