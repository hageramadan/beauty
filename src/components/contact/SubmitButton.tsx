// components/contact/SubmitButton.tsx
import { Send } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
}

export default function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-[#000000] text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          جاري الإرسال...
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          ارسال الرسالة
        </>
      )}
    </button>
  );
}