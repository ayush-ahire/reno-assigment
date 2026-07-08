import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Loader2, AlertCircle } from 'lucide-react';
import NoticeForm from '@/components/NoticeForm';
import Link from 'next/link';

export default function EditNotice() {
  const router = useRouter();
  const { id } = router.query;

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchNotice = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/notices/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Notice not found');
          }
          throw new Error('Failed to fetch notice details');
        }
        const data = await response.json();
        setNotice(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred while loading notice.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  return (
    <>
      <Head>
        <title>Edit Notice - Notice Board Pro</title>
        <meta name="description" content="Modify an existing announcement on the notice board." />
      </Head>

      <div className="py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading announcement details...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-12 px-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200 mb-2">Failed to Load Notice</h3>
            <p className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed mb-6">
              {error}
            </p>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
            >
              Back to Notice Board
            </Link>
          </div>
        ) : (
          <NoticeForm initialData={notice} isEdit={true} key={notice.id} />
        )}
      </div>
    </>
  );
}
