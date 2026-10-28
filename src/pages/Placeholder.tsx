import { Header } from '@/src/components/layout/Header';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-500 text-lg">{description}</p>
        </div>
        <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 mb-8">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ArrowLeft size={32} />
          </div>
          <p className="text-slate-400 italic mb-8">This feature is currently in development for the next phase of the Elite 10 hackathon.</p>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
