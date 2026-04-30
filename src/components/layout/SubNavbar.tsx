"use client";

import Link from "next/link";
import { FaTwitter, FaInstagram } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RxLinkedinLogo } from "react-icons/rx";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { PiGiftBold } from "react-icons/pi";
import { LiaPhoneSolid } from "react-icons/lia";

export function SubNavbar() {
  return (
    <div className="w-full bg-[#FDF2F8] border-b border-[#E4E7E9] py-2 md:py-3 ">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          {/* Right Section - Email */}
         <div className="flex gap-5 items-center">
          
           <div className="hidden md:flex items-center gap-1">
            <LiaPhoneSolid className="text-[#E60076] " />
            <Link
              href="mailto:lorum@lorum.com"
              className="text-[#E60076] text-sm md:text-sm font-bold"
            >
              (000) 000-999
            </Link>
          </div>
           <div className="hidden md:flex items-center gap-2">
            <TfiEmail className="text-[#E60076] " />
            <Link
              href="mailto:lorum@lorum.com"
              className="text-[#E60076] text-sm md:text-sm font-bold"
            >
              lorum@lorum.com
            </Link>
          </div>
         </div>

          {/* Center Section - Free Shipping Message */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* <Image src='/images/sub.png' alt="Sub Navbar" quality={90} className="h-6 w-6" width={210} height={210} /> */}
           <PiGiftBold className="text-[#E60076] w-4 h-4 md:w-5 md:h-5" />
            <p className="text-[#E60076] text-xs md:text-sm font-semibold text-center">
             اطلب بقيمة 2000$ واحصل علي توصيل مجاني
            </p>
          </div>
          {/* Left Section - Language & Social Media */}
          <div className=" hidden md:flex items-center gap-4 md:gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-[#E60076] text-xs md:text-sm font-medium">
                تابعنا :
              </span>
              <Link
                href="#"
                className="text-[#E60076]  duration-300 hover:scale-110 transform"
                aria-label="Instagram"
              >
                <FaInstagram className="text-sm md:text-base" />
              </Link>
              <Link
                href="#"
                className="text-[#E60076]  duration-300 hover:scale-110 transform"
                aria-label="LinkedIn"
              >
                <RxLinkedinLogo className="text-sm md:text-base" />
              </Link>
              <Link
                href="#"
                className="text-[#E60076]  duration-300 hover:scale-110 transform"
                aria-label="Twitter"
              >
                <FaTwitter className="text-sm md:text-base" />
              </Link>
              <Link
                href="#"
                className="text-[#E60076]  duration-300 hover:scale-110 transform"
                aria-label="Twitter"
              >
                <IoLogoWhatsapp className="text-sm md:text-base" />
              </Link>
              <Link
                href="#"
                className="text-[#E60076]  duration-300 hover:scale-110 transform"
                aria-label="Facebook"
              >
                <FaFacebook className="text-sm md:text-base" />
              </Link>
            </div>
            {/* Divider */}
            <div className="w-px h-5 bg-[#ffffff52]"></div>
            {/* Language Selector */}
            <div className="flex items-center gap-1 cursor-pointer ">
              <span className="text-[#E60076] text-xs md:text-sm font-medium">
                Eng
              </span>
              <MdKeyboardArrowDown className="text-[#E60076]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
