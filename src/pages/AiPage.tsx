import { AiAssistant } from '../components/AiAssistant';
import { Footer } from '../components/Footer';
import { PageHeader } from '../components/PageHeader';

export function AiPage() {
  return <main className="min-h-screen bg-navy"><PageHeader eyebrow="Умный подбор" title="AI-помощник"/><AiAssistant/><Footer/></main>;
}
