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
      className="w-full bg-[#FF7700] text-white py-3  rounded-full  font-medium hover:bg-[#4bb3f8] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          جاري الإرسال...
        </>
      ) : (
        <>
          ارسال الرسالة
          <Send className="w-5 h-5" />

        </>
      )}
    </button>
  );
}