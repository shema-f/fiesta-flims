import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterpreterProfile from '@/components/interpreter/InterpreterProfile';
import { interpretersData, getInterpreter } from '@/lib/interpreters';
import { getCatalog } from '@/lib/catalog';
import type { Movie } from '@/lib/movieData';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return interpretersData.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const interpreter = getInterpreter(slug);
  if (!interpreter) return { title: 'Interpreter not found · Fiesta Flix' };
  return {
    title: `${interpreter.name} · Umusobanuzi · Fiesta Flix`,
    description: interpreter.bio,
  };
}

function moviesForInterpreter(name: string, movies: Movie[]): Movie[] {
  const full = name.toLowerCase().trim();
  const first = full.split(/\s+/)[0];
  return movies.filter((m) => {
    const narrator = (m.narrator || '').toLowerCase().trim();
    if (!narrator) return false;
    if (full === 'rocky' && narrator.includes('rocky')) return true;
    if (full === 'sankara' && narrator.includes('sankara')) return true;
    if (full === 'gaheza' && narrator.includes('gaheza')) return true;
    if (full === 'dylan' && narrator.includes('dylan')) return true;
    if ((full === 'skov' || full === 'sikov') && (narrator.includes('skov') || narrator.includes('sikov'))) return true;
    if ((full === 'pk' || full === 'p.k') && (narrator.includes('pk') || narrator.includes('p.k'))) return true;
    if (full === 'junior giti' && (narrator.includes('junior') || narrator.includes('giti'))) return true;
    return narrator.includes(full) || narrator.includes(first);
  });
}

export default async function InterpreterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const interpreter = getInterpreter(slug);
  if (!interpreter) notFound();

  const { movies } = await getCatalog();
  const filmography = moviesForInterpreter(interpreter.name, movies);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <InterpreterProfile interpreter={interpreter} movies={filmography} />
      </main>
      <Footer />
    </div>
  );
}
