import React from 'react';

const ReviewsSection = ({
  reviews,
  currentUser,
  reviewForm,
  setReviewForm,
  submitReview,
  selectedPlant,
  renderStars
}) => (
  <div className="reviews-section mt-8">
    <h3 className="text-xl font-bold mb-4 text-yellow-700">Customer Reviews</h3>
    {/* Add Review Form */}
    {currentUser && (
      <div className="review-form mb-6 p-4 bg-yellow-50 rounded-lg shadow">
        <h4 className="font-semibold mb-2">Write a Review</h4>
        <div className="flex items-center gap-2 mb-2">
          <label className="font-medium">Rating:</label>
          <select
            value={reviewForm.rating}
            onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        <textarea
          value={reviewForm.comment}
          onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
          placeholder="Share your experience with this plant..."
          className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <button
          className="px-4 py-2 rounded bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition"
          onClick={() => submitReview(selectedPlant.id)}
        >
          Submit Review
        </button>
      </div>
    )}
    {/* Reviews List */}
    <div className="reviews-list space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="review-item p-4 bg-white rounded shadow flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <strong className="text-gray-800">{review.user_name}</strong>
            <div className="review-rating flex gap-1">{renderStars(review.rating)}</div>
            <span className="review-date text-xs text-gray-500 ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
          </div>
          <p className="review-comment text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ReviewsSection; 