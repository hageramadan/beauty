import { Suspense } from "react";
import CheckoutPage from "./CheckoutClient";

export default function Page() {
  return (
    <Suspense fallback={<></>}>
      <CheckoutPage />
    </Suspense>
  );
}