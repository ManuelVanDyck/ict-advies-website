import Card from '@/components/Card';
import { MonitorPlay, GraduationCap, Share2, FolderOpen, BookOpen } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Banner */}
      <section className="w-full bg-brand-cream py-4">
        <div className="max-w-5xl mx-auto px-4">
          <Image 
            src="/banner.png" 
            alt="ICT-Advies voor leerkrachten" 
            width={1009}
            height={299}
            className="w-full h-auto rounded-lg shadow-md"
            priority
            unoptimized
          />
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card
              icon="monitor"
              title="Clevertouch Impact Plus"
              description="Handleidingen voor het digibord: basisgebruik, tips en veelvoorkomende problemen oplossen."
              href="/tutorials?categorie=clevertouch"
            />
            <Card
              icon="mail"
              title="Google Workspace"
              description="Classroom, Drive, Docs, Sheets en meer. Alles wat je nodig hebt als leerkracht."
              href="/tutorials?categorie=google-workspace"
            />
            <Card
              icon="lightbulb"
              title="EduTools"
              description="Handige educatieve tools: Canva, Quizlet, Kahoot en meer."
              href="/tutorials?categorie=edutools"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-brand-red">Populaire Handleidingen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="/tutorials/clevertouch-basisgebruik" className="group flex items-center gap-4 p-5 bg-brand-cream rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-brand-orange">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <MonitorPlay className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors">Clevertouch Basisgebruik</h3>
                <p className="text-sm text-gray-500">Start hier als beginner</p>
              </div>
            </a>
            
            <a href="/tutorials/google-classroom-basis" className="group flex items-center gap-4 p-5 bg-brand-cream rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-brand-orange">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <GraduationCap className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors">Google Classroom</h3>
                <p className="text-sm text-gray-500">Opdrachten en lessen beheren</p>
              </div>
            </a>
            
            <a href="/tutorials/scherm-delen" className="group flex items-center gap-4 p-5 bg-brand-cream rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-brand-orange">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Share2 className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors">Scherm Delen</h3>
                <p className="text-sm text-gray-500">Je scherm delen met leerlingen</p>
              </div>
            </a>
            
            <a href="/tutorials/google-drive-organiseren" className="group flex items-center gap-4 p-5 bg-brand-cream rounded-xl hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-brand-orange">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <FolderOpen className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-brand-red transition-colors">Google Drive</h3>
                <p className="text-sm text-gray-500">Bestanden organiseren en delen</p>
              </div>
            </a>
          </div>
          
          {/* View all tutorials button */}
          <div className="mt-10 text-center">
            <a 
              href="/tutorials" 
              className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-red/90 transition"
            >
              <BookOpen className="w-5 h-5" />
              Bekijk alle tutorials
            </a>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Hulp nodig?</h2>
            <p className="text-gray-600 mb-6">
              Neem contact op met de ICT-coördinator voor vragen of ondersteuning.
            </p>
            <a 
              href="mailto:ict@atheneumgentbrugge.be" 
              className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-green/90 transition"
            >
              Contacteer ICT-Advies
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
