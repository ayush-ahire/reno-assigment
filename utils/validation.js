/**
 * Validates notice input fields.
 * @param {Object} data - The notice data to validate.
 * @returns {Object} - An object containing { isValid: boolean, errors: Object }
 */
export function validateNotice(data) {
  const errors = {};
  const { title, body, category, priority, publishDate } = data;

  // 1. Title Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (title.trim().length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  // 2. Body Validation
  if (!body || typeof body !== 'string' || body.trim() === '') {
    errors.body = 'Body is required';
  } else if (body.trim().length < 5) {
    errors.body = 'Body must be at least 5 characters long';
  }

  // 3. Category Validation
  const validCategories = ['Exam', 'Event', 'General'];
  if (!category || !validCategories.includes(category)) {
    errors.category = `Category must be one of: ${validCategories.join(', ')}`;
  }

  // 4. Priority Validation
  const validPriorities = ['Normal', 'Urgent'];
  if (!priority || !validPriorities.includes(priority)) {
    errors.priority = `Priority must be one of: ${validPriorities.join(', ')}`;
  }

  // 5. Publish Date Validation
  if (!publishDate) {
    errors.publishDate = 'Publish date is required';
  } else {
    const date = new Date(publishDate);
    if (isNaN(date.getTime())) {
      errors.publishDate = 'Publish date must be a valid date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
