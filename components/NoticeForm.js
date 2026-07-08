import { useState } from 'react';
import { useRouter } from 'next/router';
import { validateNotice } from '@/utils/validation';
import { AlertCircle, ArrowLeft, Loader2, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

// Format date string to YYYY-MM-DD for HTML5 date input
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export default function NoticeForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    body: initialData?.body || '',
    category: initialData?.category || 'General',
    priority: initialData?.priority || 'Normal',
    publishDate: formatDateForInput(initialData?.publishDate),
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');
  const [selectedImageBase64, setSelectedImageBase64] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image (PNG, JPG, GIF, WEBP)' }));
      return;
    }

    // Validate size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageBase64(reader.result);
      setImagePreview(reader.result);
      setRemoveImage(false);
      // Clear error
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImageBase64('');
    setImagePreview('');
    setRemoveImage(true);
    // Clear input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Client-side validation
    const { isValid, errors: validationErrors } = validateNotice(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEdit ? `/api/notices/${initialData.id}` : '/api/notices';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: selectedImageBase64,
          removeImage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setApiError(result.error || 'Something went wrong. Please try again.');
        }
      } else {
        // Success: redirect to home
        router.push('/');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setApiError('Network connection error. Failed to save notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notice Board</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {isEdit ? 'Edit Notice' : 'Add New Notice'}
        </h2>

        {apiError && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-950 dark:text-rose-200">Error:</span> {apiError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notice title"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-rose-300 dark:border-rose-900/70 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500'
              }`}
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              rows="5"
              value={formData.body}
              onChange={handleChange}
              placeholder="Write the contents of your notice..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                errors.body
                  ? 'border-rose-300 dark:border-rose-900/70 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500'
              }`}
            ></textarea>
            {errors.body && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.body}</p>}
          </div>

          {/* Grid for Category, Priority, and Publish Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="General">General</option>
                <option value="Exam">Exam</option>
                <option value="Event">Event</option>
              </select>
              {errors.category && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.category}</p>}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
              {errors.priority && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.priority}</p>}
            </div>

            {/* Publish Date */}
            <div className="sm:col-span-2">
              <label htmlFor="publishDate" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Publish Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                id="publishDate"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-medium transition focus:outline-none focus:ring-2 ${
                  errors.publishDate
                    ? 'border-rose-300 dark:border-rose-900/70 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500'
                }`}
              />
              {errors.publishDate && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.publishDate}</p>}
            </div>

            {/* Image Upload Area */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notice Image
              </label>
              
              {imagePreview ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-video max-h-64 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 object-contain w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-3 right-3 p-2 rounded-xl text-white bg-slate-900/80 hover:bg-rose-600 transition duration-200 backdrop-blur-sm"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/50 cursor-pointer transition group"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition duration-200">
                      <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Upload from device
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        PNG, JPG, GIF, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {errors.image && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">{errors.image}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:active:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Update Notice' : 'Publish Notice'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
