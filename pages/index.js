import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AlertTriangle, PlusCircle, Grid, ClipboardCheck } from 'lucide-react';
import NoticeCard from '@/components/NoticeCard';
import ConfirmModal from '@/components/ConfirmModal';

export default function Home() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // Delete modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState({ id: '', title: '' });

  // Notifications/Toasts
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Fetch notices
  const fetchNotices = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/notices');
      if (!res.ok) {
        throw new Error('Failed to fetch notices');
      }
      const data = await res.json();
      setNotices(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load notices. Please make sure your database is connected.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotices(false);
  }, []);

  // Show auto-dismiss notification
  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Open Delete Confirmation
  const handleDeleteRequest = (id, title) => {
    setNoticeToDelete({ id, title });
    setModalOpen(true);
  };

  // Confirm Delete Operation
  const handleDeleteConfirm = async () => {
    setModalOpen(false);
    const { id, title } = noticeToDelete;

    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to delete notice');
      }

      // Remove from state
      setNotices((prev) => prev.filter((notice) => notice.id !== id));
      showToast(`Notice "${title}" deleted successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error deleting notice.', 'error');
    }
  };

  // Cancel Delete
  const handleDeleteCancel = () => {
    setModalOpen(false);
    setNoticeToDelete({ id: '', title: '' });
  };



  return (
    <>
      <Head>
        <title>Notice Board Pro - Stay Informed</title>
        <meta name="description" content="A production-quality Next.js, Tailwind, and Prisma Notice Board application." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Floating Notifications */}
      {notification.show && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold transition ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-900/50'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-900/50'
            }`}
          >
            {notification.type === 'success' ? (
              <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Heading / Info Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Board Postings
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Important events, exam dates, and general updates. Urgent bulletins are pinned to the top.
            </p>
          </div>
          <Link
            href="/notice/new"
            className="self-start md:self-center flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700 shadow-md shadow-indigo-600/10 transition active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Announcement</span>
          </Link>
        </div>
      </div>



      {/* Main Grid View */}
      {error ? (
        <div className="text-center py-12 px-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 max-w-xl mx-auto mt-6">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-rose-950 dark:text-rose-200 mb-2">Database Connection Required</h3>
          <p className="text-sm text-rose-800 dark:text-rose-300 leading-relaxed mb-6">
            {error}
          </p>
          <button
            onClick={() => fetchNotices(true)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-500 dark:hover:bg-rose-600 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        /* Loading Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-64 flex flex-col justify-between">
              <div>
                <div className="flex justify-between gap-4 mb-4">
                  <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
                <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg mb-3"></div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
                <div className="w-5/6 h-4 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
              </div>
              <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notices.length > 0 ? (
        /* Notice List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl mx-auto shadow-sm">
          <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950 inline-flex mb-4 text-slate-400 dark:text-slate-500">
            <Grid className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Bulletins Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
            There are currently no postings on the notice board. Be the first to create one!
          </p>
          <Link
            href="/notice/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-600/10 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish First Notice</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        noticeTitle={noticeToDelete.title}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
