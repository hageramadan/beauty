// app/products/page.tsx
import { Suspense } from "react";
import ProductsContent from "./ProductsContent";
import ProductsLoading from "./ProductsLoading";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}