import { ReactNode } from "react";
import { motion } from "motion/react";
import { Mail, Phone, Instagram, Linkedin, Globe, MessageSquare } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  // Easily editable contact information
  const contactInfo = {
    studioName: "BOHRER Archviz",
    email: "bohrer.archviz@gmail.com",
    phone: "+351 964 684 343",
    whatsapp: "https://wa.me/+351964684343",
    instagram: "https://instagram.com/bohrer.archviz",
    behance: "https://www.behance.net/brunobohrer",
    linkedin: "https://linkedin.com/company/bohrer-archviz",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-2xl mx-auto w-full bg-white p-12 rounded-3xl border border-brand-accent/20 shadow-sm"
    >
      <h2 className="text-3xl font-bold mb-12 tracking-tight text-center">{t.contact.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <ContactItem 
            icon={<Mail className="w-5 h-5" />}
            label={t.contact.email}
            value={contactInfo.email}
            href={`mailto:${contactInfo.email}`}
          />
          <ContactItem 
            icon={<Phone className="w-5 h-5" />}
            label={t.contact.phone}
            value={contactInfo.phone}
            href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
          />
          <ContactItem 
            icon={<MessageSquare className="w-5 h-5" />}
            label={t.contact.whatsapp}
            value={t.contact.whatsappAction}
            href={contactInfo.whatsapp}
          />
        </div>

        <div className="space-y-8">
          <ContactItem 
            icon={<Instagram className="w-5 h-5" />}
            label={t.contact.instagram}
            value="@bohrer.archviz"
            href={contactInfo.instagram}
          />
          <ContactItem 
            icon={<Linkedin className="w-5 h-5" />}
            label={t.contact.linkedin}
            value="BOHRER Archviz"
            href={contactInfo.linkedin}
          />
          <ContactItem 
            icon={<Globe className="w-5 h-5" />}
            label="Behance"
            value="brunobohrer"
            href={contactInfo.behance}
          />
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-brand-accent/20 text-center">
        <p className="text-xs text-brand-muted leading-relaxed max-w-md mx-auto">
          {t.contact.footer}
        </p>
      </div>
    </motion.div>
  );
}

function ContactItem({ 
  icon, 
  label, 
  value, 
  href 
}: { 
  icon: ReactNode; 
  label: string; 
  value: string;
  href: string;
}) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 group"
    >
      <div className="p-3 rounded-xl bg-brand-offwhite group-hover:bg-brand-dark group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-base font-semibold group-hover:text-brand-dark transition-colors">{value}</p>
      </div>
    </a>
  );
}
