// components/contact/SocialLinks.tsx

'use client'
import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";
import { FaFacebook, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoLogoTiktok } from "react-icons/io5";
import { FaSnapchatGhost } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getSettings } from "@/services/settingsApi";

interface Settings {
  linkedin: string;
  twitter: string;
  facebook: string;
  snapchat: string;
  instagram: string;
  whatsapp: string;
  email: string;
  phone: string;
}

export default function SocialLinks() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        setSettings(data.setting);
      } catch (error) {
        console.error('Error fetching social settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // روابط التواصل الاجتماعي من الـ API
  const socialLinks = [
    { icon: FaXTwitter, href: settings?.twitter || "https://x.com/tcartsofficial", label: "Twitter" },
    { icon: FaFacebookF, href: settings?.facebook || "https://www.facebook.com/tcarstofficial/", label: "Facebook" },
    { icon: IoLogoTiktok, href: "#", label: "Tiktok" },
    { icon: BsInstagram, href: settings?.instagram || "https://www.instagram.com/tcarstofficial/", label: "Instagram" },
    { icon: FaSnapchatGhost, href: settings?.snapchat || "https://www.snapchat.com/@tcartofficial", label: "Snapchat" },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-white my-4 text-center md:text-start">
        {loading ? 'جاري التحميل...' : 'تواصل معنا'}
      </h3>
      <div className="flex gap-3 md:gap-6 mt-6 justify-center md:justify-start">
        {loading ? (
          // عرض حالة التحميل
          Array(5).fill(0).map((_, index) => (
            <div key={index} className="w-5 h-5 bg-gray-600 rounded-full animate-pulse"></div>
          ))
        ) : (
          socialLinks.map((social, index) => (
            <Link
              key={index}
              href={social.href}
              aria-label={social.label}
              className="hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <social.icon className="w-5 h-5 text-white hover:text-[#23A6F0] transition-colors" />
            </Link>
          ))
        )}
      </div>
      
      {/* عرض معلومات الاتصال من API */}
      {/* {!loading && settings && (
        <div className="mt-4 text-center md:text-start">
          <p className="text-sm text-gray-400">
            <span className="font-semibold">الهاتف:</span> <span dir='ltr'>{settings.phone}</span>
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold">البريد الإلكتروني:</span> {settings.email}
          </p>
        </div>
      )} */}
    </div>
  );
}