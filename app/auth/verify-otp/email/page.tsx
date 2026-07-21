"use client";

import { Suspense } from "react";
import OTPWithEmail from "@/components/Auth/otp/otp_with_email";

export default function VerifyOTPEmailPage() {
  return (
    <Suspense fallback={<div> ...</div>}>
      <OTPWithEmail />
    </Suspense>
  );
}