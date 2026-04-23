import { AdsHome } from "@/components/home/AdsHome";
import { BestProducts } from "@/components/home/BestProducts";
import { CategoriesDragDrop } from "@/components/home/CategoriesDragDrop";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";
import { LatestProducts2 } from "@/components/home/LatestProducts2";
import { Footer } from "@/components/layout/Footer";



export default function Home() {
  return (
   <div>
    <Hero />
    <CategoriesDragDrop/>
   <LatestProducts />
   <BestProducts/>
   <AdsHome/>
   
   <LatestProducts2/>
   <Footer />
   </div>
  );
}
