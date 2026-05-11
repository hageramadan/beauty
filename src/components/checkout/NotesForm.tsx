// components/checkout/NotesForm.tsx
"use client";

import { NotesFormProps } from "./types";

export default function NotesForm({ notes, onNotesChange }: NotesFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#EC221F] rounded-full"></span>
        ملاحظات
      </h2>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={3}
        placeholder="قم بإدخال ملاحظاتك الإضافية.."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EC221F] focus:border-transparent transition resize-none"
      />
    </div>
  );
}