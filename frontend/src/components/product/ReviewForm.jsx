import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';
import StarRating from './StarRating';

const MAX_TITLE = 120;
const MAX_BODY = 2000;
const MIN_BODY = 10;
const MAX_NAME = 60;

/**
 * ReviewForm — used both to record a first impression and to revise an
 * existing one. `initial` seeds the fields; when it carries an id the
 * parent performs an update instead of a create.
 */
export default function ReviewForm({
  initial = null,
  defaultAuthorName = '',
  onSubmit,
  onCancel,
  submitting = false,
  error = '',
}) {
  const isEditing = Boolean(initial?.id);

  const [rating, setRating] = useState(initial?.rating || 0);
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [authorName, setAuthorName] = useState(initial?.authorName || defaultAuthorName);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (rating < 1) {
      setLocalError('Please select a rating between one and five leaves.');
      return;
    }
    if (body.trim().length < MIN_BODY) {
      setLocalError(`Please share at least ${MIN_BODY} characters about this reserve.`);
      return;
    }

    setLocalError('');
    onSubmit({
      rating,
      title: title.trim(),
      body: body.trim(),
      authorName: authorName.trim() || defaultAuthorName,
    });
  };

  const message = localError || error;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white border border-brand-forest/8 p-6 md:p-8 space-y-6"
    >
      <div>
        <h3 className="font-serif text-2xl text-brand-forest tracking-wide">
          {isEditing ? 'Revise your impression' : 'Record your impression'}
        </h3>
        <div className="w-10 h-[0.5px] bg-brand-gold/40 mt-3" />
      </div>

      {message && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 text-red-700 font-sans text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>{message}</span>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block font-sans text-[10px] uppercase tracking-widest text-brand-gold/80 mb-3">
          Your rating
        </label>
        <StarRating value={rating} size="xl" onChange={setRating} label="Your rating" />
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="block font-sans text-[10px] uppercase tracking-widest text-brand-gold/80 mb-2"
        >
          Headline <span className="text-brand-muted/60 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A malt-forward cup with genuine depth"
          className="w-full border border-brand-forest/15 bg-brand-cream/30 px-4 py-3 font-sans text-sm text-brand-charcoal placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-gold transition-colors"
        />
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="review-body"
          className="block font-sans text-[10px] uppercase tracking-widest text-brand-gold/80 mb-2"
        >
          Your impression
        </label>
        <textarea
          id="review-body"
          rows={5}
          value={body}
          maxLength={MAX_BODY}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How did it brew? What did the cup reveal on the second steep?"
          className="w-full border border-brand-forest/15 bg-brand-cream/30 px-4 py-3 font-sans text-sm text-brand-charcoal placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-gold transition-colors resize-y"
        />
        <p className="font-sans text-[10px] text-brand-muted/50 mt-1.5 text-right tabular-nums">
          {body.length} / {MAX_BODY}
        </p>
      </div>

      {/* Display name */}
      <div>
        <label
          htmlFor="review-name"
          className="block font-sans text-[10px] uppercase tracking-widest text-brand-gold/80 mb-2"
        >
          Signed
        </label>
        <input
          id="review-name"
          type="text"
          value={authorName}
          maxLength={MAX_NAME}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="How your name should appear"
          className="w-full sm:max-w-xs border border-brand-forest/15 bg-brand-cream/30 px-4 py-3 font-sans text-sm text-brand-charcoal placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-gold transition-colors"
        />
        <p className="font-sans text-[10px] text-brand-muted/60 mt-2 leading-relaxed">
          Displayed publicly alongside your impression. Your email address is never shown.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="gold-shimmer-btn text-brand-charcoal font-sans text-xs font-bold tracking-luxury uppercase px-10 py-4 flex items-center justify-center gap-3 rounded-none shadow-md cursor-pointer disabled:opacity-60"
        >
          {submitting && <Loader className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />}
          {isEditing ? 'Save Revision' : 'Publish Impression'}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-[11px] uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
