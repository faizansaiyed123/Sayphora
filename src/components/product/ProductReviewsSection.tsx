import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  Filter, 
  ChevronDown, 
  MessageSquare, 
  Sparkles,
  Camera,
  Maximize2
} from 'lucide-react';
import { Product, Review, SkinType } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductReviewsSectionProps {
  product: Product;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const { getProductReviews, addReview, voteReview, loadReviews, user } = useApp();

  const reviews = getProductReviews(product.id);

  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterWithPhotos, setFilterWithPhotos] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'helpful' | 'newest' | 'highest' | 'lowest'>('helpful');

  // Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [selectedShade, setSelectedShade] = useState(product.shades ? product.shades[0].name : '');
  const [recommended, setRecommended] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { loadReviews(product.id); }, [product.id, loadReviews, user?.id]);

  // Photo Lightbox modal
  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; reviewerName: string; title: string } | null>(null);

  // Ratings calculation
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : product.rating;

  const starCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => Math.round(r.rating) === stars).length / totalReviews) * 100 : 0
  }));

  const recommendedCount = reviews.filter(r => r.recommended !== false).length;
  const recommendedPercent = totalReviews > 0 ? Math.round((recommendedCount / totalReviews) * 100) : 98;

  // Collect all community photos
  const allCommunityPhotos = reviews.flatMap(r => 
    (r.photos || []).map(photo => ({
      url: photo,
      reviewerName: r.userName,
      title: r.title
    }))
  );

  // Filter and Sort reviews
  const filteredReviews = reviews.filter(r => {
    if (filterRating !== 'all' && Math.round(r.rating) !== filterRating) return false;
    if (filterWithPhotos && (!r.photos || r.photos.length === 0)) return false;
    if (filterVerifiedOnly && !r.verifiedPurchase) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    // newest fallback
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Handle local image file upload
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!comment.trim()) { setFormError('Please tell us about your experience.'); return; }
    setSubmitting(true); setFormError(null);
    try {
      await addReview(product.id, {
        rating,
        title: title.trim() || 'Exceptional beauty experience',
        comment: comment.trim(),
        shadeUsed: selectedShade || undefined,
        recommended,
        photos: photoUrl.trim() ? [photoUrl.trim()] : undefined
      });
      setShowReviewForm(false); setTitle(''); setComment(''); setPhotoUrl('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not publish your review.');
    } finally { setSubmitting(false); }
  };

  const ratingDescriptions: Record<number, string> = {
    1: 'Disappointed — Did not work for my skin',
    2: 'Below Average — Wouldn’t repurchase',
    3: 'Satisfactory — Decent results',
    4: 'Loved It — Exceeded expectations',
    5: 'Holy Grail — Unrivaled formulation'
  };

  return (
    <section className="space-y-8 pt-4">
      {/* 1. Header & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-stone-50 border border-stone-200">
        {/* Left: Overall Rating Score */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-4 border-b md:border-b-0 md:border-r border-stone-200">
          <div className="text-4xl sm:text-5xl font-serif font-bold text-stone-950 tracking-tight">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-stone-200 text-stone-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Based on {totalReviews} Customer {totalReviews === 1 ? 'Review' : 'Reviews'}
          </p>

          <div className="mt-3 px-3 py-1 bg-amber-50 rounded-full border border-amber-200/60 text-[11px] font-semibold text-amber-900 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{recommendedPercent}% of clients recommend this product</span>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-4 w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            {showReviewForm ? 'Close Form' : 'Write a Review'}
          </button>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Rating Distribution
          </div>
          {starCounts.map(({ stars, count, percentage }) => (
            <button
              key={stars}
              onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
              className={`group flex items-center gap-3 text-xs w-full text-left rounded-lg p-1 transition-colors ${
                filterRating === stars ? 'bg-amber-100/60 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <span className="w-12 text-stone-700 flex items-center gap-1 shrink-0 font-medium">
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
              </span>

              <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden relative">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all duration-500 group-hover:bg-amber-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-10 text-right text-stone-500 shrink-0 text-[11px]">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Customer Photo Gallery Carousel */}
      {allCommunityPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              <h4 className="font-serif font-bold text-sm text-stone-950 tracking-wide uppercase">
                Customer Swatches & Finish Photos ({allCommunityPhotos.length})
              </h4>
            </div>
            <span className="text-[11px] text-stone-500">Click any photo to enlarge & inspect texture</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {allCommunityPhotos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setActivePhotoModal(photo)}
                className="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-stone-200 shadow-2xs hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <img
                  src={photo.url}
                  alt={`Review photo by ${photo.reviewerName}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Review Submission Form Modal / Box */}
      {showReviewForm && (
        <form 
          onSubmit={handleSubmitReview}
          className="p-6 bg-white rounded-2xl border-2 border-amber-300/80 shadow-xl space-y-5 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="font-serif font-bold text-base text-stone-950">
                Write a Review for {product.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="p-1 rounded text-stone-400 hover:text-stone-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Star Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-stone-200 text-stone-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800 ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Reviewer */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            {user ? <>Posting as <strong className="text-stone-900">{user.name}</strong>. Your skin profile ({user.beautyProfile.skinType}, {user.beautyProfile.skinTone}) is shared with your review. "Verified Buyer" is added automatically if you purchased this product.</> : <>Please sign in to publish a review.</>}
          </div>

          {/* Product Shade if applicable */}
          {product.shades && product.shades.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Shade Used
              </label>
              <select
                value={selectedShade}
                onChange={(e) => setSelectedShade(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:border-stone-950 outline-none"
              >
                {product.shades.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Headline & Body */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Review Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Incomparable smooth velvet finish with all-day longevity"
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:border-stone-950 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Detailed Experience & Performance *
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              placeholder="Describe how this formula blended, skin reaction, undertone accuracy, texture, and staying power..."
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:border-stone-950 outline-none"
            />
          </div>

          {/* Recommendation Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recommend-check"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
              className="w-4 h-4 text-stone-950 rounded border-stone-300 focus:ring-amber-400"
            />
            <label htmlFor="recommend-check" className="text-xs font-semibold text-stone-800">
              Yes, I recommend this luxury beauty product to others
            </label>
          </div>

          {/* Photo (optional) */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <label htmlFor="review-photo" className="block text-xs font-bold uppercase tracking-wider text-stone-900">Photo link (optional)</label>
            <p className="text-[11px] text-stone-500">Paste a secure (https) link to a swatch or texture photo you have hosted online.</p>
            <input id="review-photo" type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-xl focus:border-stone-950 outline-none" />
          </div>

          {formError && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">{formError}</div>}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-stone-950 hover:bg-stone-800 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              {submitting ? 'Publishing…' : 'Publish Review'}
            </button>
          </div>
        </form>
      )}

      {/* 4. Filter and Sorting Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              filterRating === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Ratings ({totalReviews})
          </button>

          <button
            onClick={() => setFilterWithPhotos(!filterWithPhotos)}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors ${
              filterWithPhotos
                ? 'bg-amber-400 text-stone-950 font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            <span>With Photos ({allCommunityPhotos.length})</span>
          </button>

          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`px-3 py-1 rounded-full font-medium flex items-center gap-1.5 transition-colors ${
              filterVerifiedOnly
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Buyers Only</span>
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-stone-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-1.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-800 font-semibold outline-none"
          >
            <option value="helpful">Most Helpful</option>
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* 5. Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-stone-500 text-xs bg-stone-50 rounded-2xl border border-stone-200">
            No reviews match your selected filters. Try adjusting rating or photo filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div 
              key={rev.id} 
              className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-3.5 transition-all hover:border-stone-300"
            >
              {/* Reviewer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-300 font-bold text-xs flex items-center justify-center uppercase">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-xs">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                      {rev.userBadge && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          {rev.userBadge}
                        </span>
                      )}
                    </div>

                    {/* Skin Attributes */}
                    {(rev.shadeUsed || rev.skinType || rev.skinTone) && (
                      <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap gap-2">
                        {rev.shadeUsed && <span>Shade: <strong className="text-stone-700">{rev.shadeUsed}</strong></span>}
                        {rev.skinType && <span>Skin: <strong className="text-stone-700">{rev.skinType}</strong></span>}
                        {rev.skinTone && <span>Tone: <strong className="text-stone-700">{rev.skinTone}</strong></span>}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[11px] text-stone-400 self-start sm:self-auto">{rev.date}</span>
              </div>

              {/* Rating Stars and Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-stone-200 text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.recommended && (
                    <span className="text-[11px] font-semibold text-emerald-700 ml-2">
                      Recommends this item ✓
                    </span>
                  )}
                </div>

                {rev.title && (
                  <h5 className="font-serif font-bold text-stone-950 text-sm">
                    {rev.title}
                  </h5>
                )}
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-[13px] text-stone-700 leading-relaxed font-sans">
                {rev.comment}
              </p>

              {/* Attached Review Photos */}
              {rev.photos && rev.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {rev.photos.map((photoUrl, pIndex) => (
                    <button
                      key={pIndex}
                      onClick={() => setActivePhotoModal({ url: photoUrl, reviewerName: rev.userName, title: rev.title })}
                      className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 hover:shadow-md transition-all"
                    >
                      <img src={photoUrl} alt="Review attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Helpfulness Voting Mechanism */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-stone-600">Was this review helpful?</span>

                  <button
                    onClick={() => voteReview(product.id, rev.id, 'helpful')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      rev.userVotedHelpful
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-bold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="Mark review as helpful"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${rev.userVotedHelpful ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>Yes ({rev.helpfulCount || 0})</span>
                  </button>

                  <button
                    onClick={() => voteReview(product.id, rev.id, 'unhelpful')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      rev.userVotedUnhelpful
                        ? 'bg-stone-300 text-stone-900 border border-stone-400 font-bold'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                    title="Mark review as unhelpful"
                  >
                    <ThumbsDown className={`w-3.5 h-3.5 ${rev.userVotedUnhelpful ? 'fill-stone-600 text-stone-600' : ''}`} />
                    <span>No ({rev.unhelpfulCount || 0})</span>
                  </button>
                </div>

                <span className="text-[10px] text-stone-400">
                  {rev.helpfulCount > 0 ? `${rev.helpfulCount} people found this helpful` : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Photo Lightbox Modal */}
      {activePhotoModal && (
        <div 
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-60 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl space-y-3"
          >
            <div className="relative aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activePhotoModal.url}
                alt="Enlarged review photo"
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-800 text-white rounded-full transition-colors"
                aria-label="Close enlarged photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 text-stone-200 space-y-1">
              <div className="text-xs font-bold text-amber-400">
                Shared by {activePhotoModal.reviewerName}
              </div>
              <div className="font-serif text-sm font-semibold text-white">
                {activePhotoModal.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
