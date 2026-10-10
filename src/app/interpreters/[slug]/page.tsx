import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterpreterProfile from '@/components/interpreter/InterpreterProfile';
import { interpretersData, getInterpreter } from '@/lib/interpreters';
import { filterMoviesForInterpreter } from '@/lib/interpreterCounts';
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

export default async function InterpreterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const interpreter = getInterpreter(slug);
  if (!interpreter) notFound();

  const { movies } = await getCatalog();
  // Same matcher the API uses, so the header count always equals this list.
  const filmography = filterMoviesForInterpreter(interpreter.name, movies);

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
