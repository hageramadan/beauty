// components/contact/SocialLinks.tsx

import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { IoLogoTiktok } from "react-icons/io5";
import { FaSnapchatGhost } from "react-icons/fa";
const socialLinks = [
  { icon: FaXTwitter, href: "#", label: "XTwitter" },
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: IoLogoTiktok, href: "#", label: "Tiktok" },
  { icon: BsInstagram, href: "#", label: "Instagram" },
  { icon: FaSnapchatGhost, href: "#", label: "Snapchat" },
];

export default function SocialLinks() {
  return (
    <div >
      <h3 className="text-lg font-bold text-white my-4 text-center md:text-start">تواصل معنا</h3>
      <div className="flex gap-3 md:gap-6 mt-6 justify-center md:justify-start">
        {socialLinks.map((social, index) => (
          <Link
          
            key={index}
            href={social.href}
            aria-label={social.label}
            className=""
          >
            <social.icon className="w-5 h-5 text-white" />
          </Link>
        ))}
      </div>
    </div>
  );
}