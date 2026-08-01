import React, { useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Circle, BookOpen, MapPin, Monitor, Wrench, ShieldAlert } from 'lucide-react';
import type { OnboardingStep } from '../types';

import onboardingData from '../data/onboarding.json';

const OnboardingPage: React.FC = () => {
  // Mock data fallback
  const defaultSteps: OnboardingStep[] = [
    {
      week: 1,
      title: "Introduction & Basics",
      tasks: [
        "Read the Naming Convention Guide",
        "Familiarize with McDonald's Glossary",
        "Setup IT Accounts and Access",
        "Shadow a senior engineer on 2 store visits"
      ],
      resources: ["/naming"]
    },
    {
      week: 2,
      title: "Store Topologies & Devices",
      tasks: [
        "Review Store Layout types (Standalone vs Mall)",
        "Identify core POS devices",
        "Understand Kitchen Video System (KVS)",
        "Complete basic device swap training"
      ],
      resources: ["/devices", "/stores"]
    },
    {
      week: 3,
      title: "Troubleshooting Fundamentals",
      tasks: [
        "Review top 10 common issues",
        "Handle a level-1 support ticket",
        "Learn escalation paths for critical issues",
        "Practice network ping and basic diagnostics"
      ],
      resources: ["/troubleshooting"]
    },
    {
      week: 4,
      title: "Independence & Assessment",
      tasks: [
        "Complete a solo store diagnostic visit",
        "Update documentation for 1 store",
        "Final review with IT Manager"
      ]
    }
  ];

  const steps = (onboardingData as unknown as OnboardingStep[]) || defaultSteps;

  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskKey: string) => {
    const next = new Set(completedTasks);
    if (next.has(taskKey)) {
      next.delete(taskKey);
    } else {
      next.add(taskKey);
    }
    setCompletedTasks(next);
  };

  const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0);
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks.size / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      <header className="space-y-4 text-center pb-8 border-b border-white/10">
        <h1 className="text-4xl font-bold text-[#FFC72C]">New Engineer Onboarding</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Welcome to the McDonald's MY KV IT Device team. Follow this guide to get up to speed with our systems, devices, and procedures.
        </p>

        {/* Progress Tracker */}
        <div className="max-w-md mx-auto pt-4 space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-white">Training Progress</span>
            <span className="text-[#DA291C]">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#DA291C] to-[#FFC72C] transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {steps.map((step) => (
            <section key={step.week} className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 backdrop-blur-md shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#333] text-white/50 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Phase {step.week}
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-[#DA291C]/10 border border-[#DA291C]/30 flex items-center justify-center text-[#DA291C] font-bold text-xl shrink-0">
                  W{step.week}
                </div>
                <h2 className="text-2xl font-bold text-white">{step.title}</h2>
              </div>

              <div className="space-y-3">
                {step.tasks.map((task, idx) => {
                  const taskKey = `w${step.week}-t${idx}`;
                  const isDone = completedTasks.has(taskKey);
                  return (
                    <div 
                      key={taskKey} 
                      onClick={() => toggleTask(taskKey)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                        isDone 
                          ? 'bg-[#FFC72C]/5 border-[#FFC72C]/30' 
                          : 'bg-[#111111] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="text-[#FFC72C]" size={20} />
                        ) : (
                          <Circle className="text-gray-500" size={20} />
                        )}
                      </div>
                      <span className={`text-sm transition-colors ${isDone ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>

              {step.resources && step.resources.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-2 items-center text-sm">
                  <BookOpen size={16} className="text-gray-400" />
                  <span className="text-gray-400">Related Resources:</span>
                  <div className="flex gap-2">
                    {step.resources.map(res => (
                      <Link key={res} to={res} className="text-[#4DA8DA] hover:underline px-2 py-1 bg-white/5 rounded">
                        {res}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-lg font-bold text-[#FFC72C] mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/naming" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <div className="p-2 bg-[#DA291C]/10 text-[#DA291C] rounded-lg group-hover:bg-[#DA291C] group-hover:text-white transition-colors">
                  <ShieldAlert size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Naming Convention</div>
                  <div className="text-xs text-gray-500">Asset tag reference</div>
                </div>
              </Link>
              <Link to="/devices" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <div className="p-2 bg-[#FFC72C]/10 text-[#FFC72C] rounded-lg group-hover:bg-[#FFC72C] group-hover:text-black transition-colors">
                  <Monitor size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Device Catalog</div>
                  <div className="text-xs text-gray-500">Specs and photos</div>
                </div>
              </Link>
              <Link to="/troubleshooting" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Wrench size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Troubleshooting</div>
                  <div className="text-xs text-gray-500">Known issues database</div>
                </div>
              </Link>
              <Link to="/stores" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <div className="p-2 bg-green-500/10 text-green-400 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Store Profiles</div>
                  <div className="text-xs text-gray-500">Layouts and topologies</div>
                </div>
              </Link>
            </div>
          </section>

          <section className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="text-lg font-bold text-[#FFC72C] mb-4">Glossary</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <strong className="text-white min-w-[3rem]">KVS</strong>
                <span className="text-gray-400">Kitchen Video System</span>
              </li>
              <li className="flex gap-2">
                <strong className="text-white min-w-[3rem]">COD</strong>
                <span className="text-gray-400">Customer Order Display</span>
              </li>
              <li className="flex gap-2">
                <strong className="text-white min-w-[3rem]">DT</strong>
                <span className="text-gray-400">Drive-Thru</span>
              </li>
              <li className="flex gap-2">
                <strong className="text-white min-w-[3rem]">POS</strong>
                <span className="text-gray-400">Point of Sale</span>
              </li>
              <li className="flex gap-2">
                <strong className="text-white min-w-[3rem]">KV</strong>
                <span className="text-gray-400">Klang Valley (Region)</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
