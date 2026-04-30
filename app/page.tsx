import { AdsHome } from "@/components/home/AdsHome";
import { CategoriesDragDrop } from "@/components/home/CategoriesDragDrop";
import { Hero } from "@/components/home/HeroCover";
import { LatestProducts, } from "@/components/home/LatestProducts";
import { Footer } from "@/components/layout/Footer";



export default function Home() {
  return (
   <div>
    <Hero />
    <CategoriesDragDrop/>
   <LatestProducts />
   <AdsHome/>
   <LatestProducts/>
   <Footer />
   </div>
  );
}
