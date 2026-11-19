import React, { useState } from 'react';
import { db } from '../../db/dbEngine';
import { Vendor } from '../../types';
import { X, Star, Sparkles, MessageSquare } from 'lucide-react';

interface ReviewModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onReviewAdded: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ vendor, onClose, onReviewAdded }) => {
  const [rating, setRating] = useState(5.0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vendor) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    db.addReview({
      customer_id: 1, // Aarav Deshmukh
      vendor_id: vendor.vendor_id,
      rating,
      comment: comment.trim(),
      customer_name: 'Aarav Deshmukh'
    });

    setIsSubmitting(false);
    onReviewAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel-elevated rounded-3xl p-6 border border-[#FF9F1C]/30 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-lg font-bold font-syne text-white">Review & Rate Mess</h3>
            <span className="text-xs font-mono text-[#FF9F1C]">{vendor.name}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-2">SELECT RATING (1.00 – 5.00):</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'text-[#FF9F1C] fill-[#FF9F1C]' : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-lg font-bold font-mono text-white ml-2">{rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-400 block mb-1.5">YOUR FEEDBACK / REVIEW:</label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Delicious hot chapati, spicy curry, quick refill!"
              className="w-full bg-[#0B0908] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF9F1C]"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono text-neutral-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#2EC4B6] flex-shrink-0 mt-0.5" />
            <span>
              Submitting triggers <strong>trg_auto_update_vendor_rating</strong>, automatically re-aggregating the mess rating in the database!
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white font-bold font-syne text-sm shadow-xl shadow-[#FF9F1C]/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40"
          >
            {isSubmitting ? 'Updating Average...' : 'Post Review (Fire Trigger)'}
          </button>
        </form>
      </div>
    </div>
  );
};
