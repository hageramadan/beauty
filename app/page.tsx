import { AdsHome } from "@/components/home/AdsHome";
import { AdsHome1 } from "@/components/home/AdsHome1";
import { AdsSection } from "@/components/home/AdsSection";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";

import { BestDiscounts } from "@/components/home/BestDiscounts";



export default function Home() {
  return (
   <div>
     <Hero />
      <CategoriesSection />
      <BestProducts />
      <LatestProducts />
      <AdsHome />
      <BestDiscounts/>
   </div>
  );
}
