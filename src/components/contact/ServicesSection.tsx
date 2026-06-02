// components/contact/ServicesSection.tsx (نسخة 3 خدمات)
"use client";
import { FaRegEnvelope } from "react-icons/fa";
import { RiCustomerService2Line } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import SocialLinks from "./SocialLinks";

interface ServiceItem {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const servicesData: ServiceItem[] = [
  {
    id: 1,
    icon: FaRegEnvelope,
    title: "خدمات متاحة 24/7",
    description: "Lorem ipsum dolor sit amet consectetur. Feugiat facilisi semper sed nascetur commodo cursus"
  },
  {
    id: 2,
    icon: RiCustomerService2Line,
    title: "خدمات متاحة 24/7",
    description: "Lorem ipsum dolor sit amet consectetur. Feugiat facilisi semper sed nascetur commodo cursus"
  },
  {
    id: 3,
    icon: IoChatbubbleEllipsesOutline,
    title: "خدمات متاحة 24/7",
    description: "Lorem ipsum dolor sit amet consectetur. Feugiat facilisi semper sed nascetur commodo cursus"
  }
];

export default function ServicesSection() {
  return (
    <div className="bg-[#141718] rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm mb-5">
      <div className="grid grid-cols-1  gap-3  md:gap-6 ">
        {servicesData.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`flex md:flex-row flex-col gap-5 p-6 rounded-xl transition-all duration-300 bg-[#272E31] border border-white/15`}
            >
              {/* الأيقونة */}
              <div className={`hidden md:flex w-16 h-16 px-3.5 bg-[#FF7700]  items-center justify-center rounded-full p-3 `}>
                <Icon className={`w-8 h-8 text-white`} />
              </div>
              
              <div>
                {/* العنوان */}
              <h4 className="text-lg font-bold text-white mb-2">
                {service.title}
              </h4>
              
              {/* الوصف */}
              <p className="text-gray-100 text-sm leading-relaxed">
                {service.description}
              </p>
              </div>
            </div>
          );
        })}
      </div>
    <div className="w-full h-[1px] mt-7 bg-white/40"></div>
   <SocialLinks/>
     
    </div>
  );
}