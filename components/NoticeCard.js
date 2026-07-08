import Link from 'next/link';
import { Calendar, Edit, Trash2, AlertTriangle, Info } from 'lucide-react';

export default function NoticeCard({ notice, onDelete }) {
  const { id, title, body, category, priority, publishDate, imageUrl } = notice;

  // Format date nicely
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Category Badge Colors
  const getCategoryStyles = (cat) => {
    switch (cat) {
      case 'Exam':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50';
      case 'Event':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50';
      case 'General':
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50';
    }
  };

  // Priority Badge Colors
  const getPriorityStyles = (pri) => {
    if (pri === 'Urgent') {
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-bold animate-pulse-subtle';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  };

  const isUrgent = priority === 'Urgent';

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border ${
        isUrgent
          ? 'border-rose-300 dark:border-rose-900/60 shadow-md shadow-rose-500/5 ring-1 ring-rose-500/5 dark:ring-rose-500/10'
          : 'border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Notice Image */}
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Card Content Wrapper */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Section: Badges */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getCategoryStyles(category)}`}>
              {category}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityStyles(priority)}`}>
              {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
              {priority}
            </span>
          </div>

          {/* Title */}
          <h3 className={`text-lg font-bold mb-2 tracking-tight ${isUrgent ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
            {title}
          </h3>

          {/* Body Content */}
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap line-clamp-4">
            {body}
          </p>
        </div>

        {/* Bottom Section: Date & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-850/60 mt-auto">
          {/* Publish Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(publishDate)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/notice/edit/${id}`}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Notice"
              aria-label="Edit Notice"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(id, title)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete Notice"
              aria-label="Delete Notice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
