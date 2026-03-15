import Link from 'next/link';
import { Monitor, Mail, Lightbulb, Sparkles, Shield } from 'lucide-react';

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon: 'monitor' | 'mail' | 'lightbulb' | 'sparkles' | 'shield';
}

const icons = {
  monitor: Monitor,
  mail: Mail,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  shield: Shield,
};

export default function Card({ title, description, href, icon }: CardProps) {
  const Icon = icons[icon];
  
  return (
    <Link href={href} className="group">
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full">
        <div className="w-12 h-12 bg-brand-cream rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-orange/20 transition-colors">
          <Icon className="w-6 h-6 text-brand-red" />
        </div>
        <h3 className="font-bold text-xl mb-2 text-gray-800 group-hover:text-brand-red transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
