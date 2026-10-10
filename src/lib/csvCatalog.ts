import type { Movie } from './movieData';
import csvCatalogData from '../data/csvCatalog.json';

export function loadCsvCatalog(): Movie[] {
  return (csvCatalogData as unknown as Movie[]) || [];
}
