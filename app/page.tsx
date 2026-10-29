import LibraryClient from '../components/library-client';
import { catalogue } from '../lib/catalog';

export default function HomePage() {
  return <LibraryClient catalogue={catalogue} />;
}
