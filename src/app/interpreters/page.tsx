'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NarratorCard from '@/components/NarratorCard';
import { narratorsData, featuresData, Narrator } from '@/lib/narratorData';

export default function InterpretersPage() {
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null);
  const featuredNarrators = narratorsData.filter(n => n.featured);
  const allNarrators = narratorsData;
  const allInterpreterNames = narratorsData.map(n => n.name);

  const handleNarratorSelect = (narrator: Narrator) => {
    setSelectedNarrator(narrator);
    alert(`Selected Narrator: ${narrator.name}\nRating: ${narrator.rating}\nMovies: ${narrator.moviesCount}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24">
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Meet Our <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Interpreters</span>
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto">
              Discover the talented voices behind your favorite Kinyarwanda-dubbed movies
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-card/70 rounded-xl p-5 sticky top-24">
                <h3 className="text-lg font-bold mb-4">Interpreters</h3>
                <ul className="space-y-1 max-h-[500px] overflow-y-auto">
                  {allInterpreterNames.map((name) => (
                    <li key={name}>
                      <Link 
                        href={`#`}
                        className="block px-3 py-2.5 rounded-md transition-all hover:bg-secondary/50 text-gray-300 hover:text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          const narrator = narratorsData.find(n => n.name === name);
                          if (narrator) handleNarratorSelect(narrator);
                        }}
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <div className="flex-1">
              <section className="py-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-10">Featured Interpreters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {featuredNarrators.map((narrator) => (
                    <NarratorCard 
                      key={narrator.id} 
                      narrator={narrator} 
                      onSelect={handleNarratorSelect}
                    />
                  ))}
                </div>
              </section>

              <section className="py-10 bg-card/20 rounded-xl p-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-10">All Interpreters</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allNarrators.map((narrator) => (
                    <NarratorCard 
                      key={narrator.id} 
                      narrator={narrator} 
                      onSelect={handleNarratorSelect}
                    />
                  ))}
                </div>
              </section>

              <section className="py-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Amazing Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {featuresData.map((feature, index) => (
                    <div 
                      key={index}
                      className="bg-card p-8 rounded-2xl border border-white/10 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                      <ul className="space-y-2">
                        {feature.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted">
                            <span className="text-primary mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
