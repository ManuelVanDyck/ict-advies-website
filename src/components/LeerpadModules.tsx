'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Lock, CheckCircle2, PlayCircle } from 'lucide-react';

interface Module {
  _id: string;
  title: string;
  slug: { current: string };
  category?: { title: string };
  body?: any[];
  opdracht?: {
    ingeschakeld: boolean;
    titel: string;
    verplicht: boolean;
  };
}

interface ModuleProgress {
  completed: boolean;
  score: number;
  unlocked: boolean;
  passed: boolean;
}

interface LeerpadModulesProps {
  modules: Module[];
}

export default function LeerpadModules({ modules }: LeerpadModulesProps) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProgress();
    }
  }, [session?.user?.email]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/leerpad/voortgang/modules?user_email=${session?.user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data.moduleProgress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map tutorial slug to module progress
  const getModuleProgress = (slug: string): ModuleProgress => {
    return progress[slug] || { completed: false, score: 0, unlocked: slug === 'ai-bewustzijn-module-1', passed: false };
  };

  return (
    <div className="space-y-6">
      {modules.map((module, idx) => {
        const moduleProgress = getModuleProgress(module.slug.current);
        const isLocked = !moduleProgress.unlocked && idx > 0;
        const isCompleted = moduleProgress.passed;

        return (
          <div
            key={module._id}
            className={`border rounded-xl p-6 transition-shadow ${
              isLocked 
                ? 'border-gray-200 bg-gray-50 opacity-75' 
                : 'border-gray-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted 
                    ? 'bg-green-100' 
                    : isLocked 
                      ? 'bg-gray-200' 
                      : 'bg-brand-red/10'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <span className="font-bold text-brand-red">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${
                    isLocked ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {module.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {module.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {module.category.title}
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        ✓ Voltooid ({moduleProgress.score}/100)
                      </span>
                    )}
                    {moduleProgress.completed && !moduleProgress.passed && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                        ⚠ Niet geslaagd ({moduleProgress.score}/100)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {module.opdracht?.verplicht && (
                <span className="text-xs bg-brand-red text-white px-3 py-1 rounded-full font-medium">
                  Verplicht
                </span>
              )}
            </div>

            {module.body && (
              <p className={`text-sm mb-4 line-clamp-3 ${
                isLocked ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {module.body[0]?.children?.[0]?.text}
              </p>
            )}

            {module.opdracht?.ingeschakeld && !isLocked && (
              <div className="bg-brand-cream rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-red" />
                  <span className="font-semibold text-gray-900">Opdracht</span>
                </div>
                <p className="text-sm text-gray-700">{module.opdracht.titel}</p>
              </div>
            )}

            {isLocked ? (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed">
                <Lock className="w-5 h-5" />
                <span>Voltooi eerst module {idx}</span>
              </div>
            ) : (
              <Link
                href={`/tutorials/${module.slug?.current}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                {isCompleted ? 'Bekijk opnieuw' : moduleProgress.completed ? 'Probeer opnieuw' : 'Start module'}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
