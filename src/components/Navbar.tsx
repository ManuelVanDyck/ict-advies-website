"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { BookOpen, LogOut, GraduationCap, Settings } from 'lucide-react';

// E-mailadressen met toegang tot beheer
const ADMIN_EMAILS = [
  'nathalie.vandenbossche@classroomatheneum.be',
  'tom.boerhave@classroomatheneum.be',
  'mdm@classroomatheneum.be',
];

export default function Navbar() {
  const { data: session, status } = useSession();
  
  // Check of gebruiker admin toegang heeft
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="ICT-Advies" 
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
            <span className="text-gray-800">ICT-Advies</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link 
              href="/tutorials" 
              className="text-gray-600 hover:text-brand-red hover:bg-gray-50 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Tutorials
            </Link>
            
            <Link 
              href="/leerpaden" 
              className="text-gray-600 hover:text-brand-red hover:bg-gray-50 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Professionalisering
            </Link>
            
            {/* Show logout button if authenticated */}
            {status === "authenticated" && (
              <>
                {/* Admin link - only for authorized users */}
                {isAdmin && (
                  <Link 
                    href="/admin/voortgang" 
                    className="text-gray-600 hover:text-brand-red hover:bg-gray-50 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Beheer
                  </Link>
                )}
                
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="ml-2 pl-2 border-l border-gray-300 text-gray-600 hover:text-brand-red hover:bg-gray-50 px-3 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
