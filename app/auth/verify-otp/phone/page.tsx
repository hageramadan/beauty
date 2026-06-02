"use client";

import { Suspense } from "react";
import OTPWithPhone from "@/components/Auth/otp/otp_with_phone";

export default function VerifyOTPPhonePage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <OTPWithPhone />
    </Suspense>
  );
}