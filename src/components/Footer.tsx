import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="font-bold text-lg mb-3 flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto group-hover:scale-105 transition-transform" 
              />
              <span>ICT-Advies</span>
            </Link>
            <p className="text-white/80 text-sm leading-relaxed">
              Handleidingen en tips voor leerkrachten over Clevertouch borden en Google Workspace.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Snel naar</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li>
                <Link href="/tutorials" className="hover:text-brand-orange transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span>
                  Alle Tutorials
                </Link>
              </li>
              <li>
                <Link href="/tutorials?categorie=clevertouch" className="hover:text-brand-orange transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span>
                  Clevertouch
                </Link>
              </li>
              <li>
                <Link href="/tutorials?categorie=google-workspace" className="hover:text-brand-orange transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span>
                  Google Workspace
                </Link>
              </li>
              <li>
                <Link href="/tips" className="hover:text-brand-orange transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span>
                  EduTools
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-orange" />
                <a href="mailto:ict@atheneumgentbrugge.be" className="hover:text-brand-orange transition-colors">
                  ict@atheneumgentbrugge.be
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>GO! atheneum Gentbrugge</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} ICT-Advies - GO! atheneum Gentbrugge</p>
          <p>Met ondersteuning van GO! onderwijs</p>
        </div>
      </div>
    </footer>
  );
}
