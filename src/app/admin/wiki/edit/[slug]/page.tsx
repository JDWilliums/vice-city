import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function EditWikiPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pageId = params.slug as string;
  
  // Rest of the component remains the same
} 