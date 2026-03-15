import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: 'red' | 'green' | 'orange' | 'cream';
}

const colorStyles = {
  red: {
    bg: 'bg-brand-red',
    iconBg: 'bg-white/20',
    hover: 'hover:bg-red-700',
    text: 'text-white',
    description: 'text-white/80',
  },
  green: {
    bg: 'bg-brand-green',
    iconBg: 'bg-white/20',
    hover: 'hover:bg-teal-700',
    text: 'text-white',
    description: 'text-white/80',
  },
  orange: {
    bg: 'bg-brand-orange',
    iconBg: 'bg-white/20',
    hover: 'hover:bg-orange-600',
    text: 'text-white',
    description: 'text-white/80',
  },
  cream: {
    bg: 'bg-brand-cream',
    iconBg: 'bg-brand-orange/20',
    hover: 'hover:bg-orange-100',
    text: 'text-gray-800',
    description: 'text-gray-600',
  },
};

export default function FeatureCard({ title, description, href, icon: Icon, color }: FeatureCardProps) {
  const styles = colorStyles[color];
  
  return (
    <Link href={href} className="group block h-full">
      <div className={`${styles.bg} ${styles.hover} rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full`}>
        <div className={`${styles.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        <h3 className={`font-bold text-xl mb-2 ${styles.text}`}>{title}</h3>
        <p className={`${styles.description} text-sm leading-relaxed`}>{description}</p>
      </div>
    </Link>
  );
}
