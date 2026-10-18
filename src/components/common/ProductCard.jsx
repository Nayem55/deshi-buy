import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { optimizedImageUrl, optimizedImageSrcSet } from '../../utils/imageUrl';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isInWishlist(product._id);
  const [weightPickerOpen, setWeightPickerOpen] = useState(false);
  const [selectedOrderWeight, setSelectedOrderWeight] = useState('');

  const weightVariations = product.weightVariations || product.stitchVariations || [];
  const hasVariations = weightVariations.length > 0;

  // Base prices
  const baseRegularPrice = product.regularPrice || (product.comparePrice && product.comparePrice > product.price ? product.comparePrice : product.price) || 0;
  const baseSalePrice = product.salePrice || product.price || 0;
  const baseIsOnSale = Boolean(product.isOnSale && baseSalePrice > 0 && baseSalePrice < baseRegularPrice);

  // Calculate variation price range
  const variationPrices = weightVariations.map((v) => {
    const price = v.isOnSale && v.salePrice ? Number(v.salePrice) : Number(v.price);
    return price > 0 ? price : Infinity;
  }).filter((p) => p !== Infinity);
  const minVariationPrice = variationPrices.length > 0 ? Math.min(...variationPrices) : 0;
  const maxVariationPrice = variationPrices.length > 0 ? Math.max(...variationPrices) : 0;
  const hasVariationSale = weightVariations.some((variation) => Boolean(variation.isOnSale && variation.salePrice && Number(variation.salePrice) < Number(variation.price)));

  // Determine display price
  let displayPrice, regularPrice, isOnSale;
  if (hasVariations && variationPrices.length > 1) {
    displayPrice = minVariationPrice;
    regularPrice = maxVariationPrice;
    isOnSale = hasVariationSale;
  } else if (hasVariations && variationPrices.length === 1) {
    displayPrice = variationPrices[0];
    regularPrice = variationPrices[0];
    isOnSale = false;
  } else {
    displayPrice = baseIsOnSale ? baseSalePrice : baseRegularPrice;
    regularPrice = baseRegularPrice;
    isOnSale = baseIsOnSale;
  }

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login first'); return; }
    try {
      const added = await toggleWishlist(product._id);
      toast.success(added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const startDirectOrder = async (weight = '') => {
    try {
      await addToCart(user ? product._id : product, '', '', weight, 1);
      navigate('/checkout');
    } catch {
      toast.error('Could not start your order');
    }
  };

  const handleOrderNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariations) {
      setSelectedOrderWeight('');
      setWeightPickerOpen(true);
      return;
    }
    startDirectOrder();
  };

  const handleConfirmDirectOrder = () => {
    if (!selectedOrderWeight) {
      toast.error('Please select a weight');
      return;
    }
    setWeightPickerOpen(false);
    startDirectOrder(selectedOrderWeight);
  };

  const tags = [];
  if (product.isNew) tags.push({ label: 'New', className: 'bg-oxblood' });
  if (product.isBestSeller) tags.push({ label: 'Best Seller', className: 'bg-gold' });
  if (product.isSeasonal) tags.push({ label: 'Seasonal', className: 'bg-emerald-700' });
  if (isOnSale) tags.push({ label: 'Sale', className: 'bg-oxblood' });
  if (product.isBridal && tags.length === 0) tags.push({ label: 'Bridal', className: 'bg-oxblood-dark' });
  const tagTopOffsets = ['top-3', 'top-9', 'top-[4.5rem]'];

  return (
    <div className="group block">
      <Link to={`/product/${product.slug || product._id}`} className="block">
      <div className="relative aspect-[3/4] bg-blush overflow-hidden mb-3">
        {product.images && product.images[0] ? (
          <img src={optimizedImageUrl(product.images[0], { width: 560 })} srcSet={optimizedImageSrcSet(product.images[0], [320, 480, 560])} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px" alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal/30">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {tags.map((tag, i) => (
          <span key={tag.label} className={`absolute ${tagTopOffsets[i] || 'top-3'} left-3 ${tag.className} text-white text-[10px] tracking-wider px-2.5 py-1 uppercase z-10`}>
            {tag.label}
          </span>
        ))}

        <button onClick={handleWishlist} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10">
          {wishlisted ? (
            <svg className="w-4 h-4 text-oxblood" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          )}
        </button>

        </div>
        <div className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-oxblood-dark transition-colors duration-300">{product.name}</div>
        {weightVariations.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {weightVariations.map((v) => (
              <span key={v.type} className="text-[10px] px-1.5 py-0.5 bg-charcoal/5 text-charcoal/60 rounded">
                {v.type}
              </span>
            ))}
          </div>
        )}
        <div className="text-[13px] text-oxblood-dark font-medium">
          {hasVariations && variationPrices.length > 1 ? (
            <>BDT {minVariationPrice.toLocaleString()} - {maxVariationPrice.toLocaleString()}</>
          ) : (
            <>
              {isOnSale && <span className="text-gray-400 line-through mr-2 text-xs">BDT {regularPrice.toLocaleString()}</span>}
              BDT {displayPrice.toLocaleString()}
            </>
          )}
        </div>
      </Link>
      <button
        onClick={handleOrderNow}
        className="mt-3 w-full rounded-lg bg-oxblood py-2.5 text-xs font-semibold tracking-[0.1em] uppercase text-ivory transition-colors hover:bg-red-600"
      >
        Order Now
      </button>
      {weightPickerOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-charcoal/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`weight-picker-${product._id}`}
          onClick={() => setWeightPickerOpen(false)}
        >
          <div className="max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-ivory px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl sm:rounded-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-charcoal/15 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">Direct order</p>
                <h3 id={`weight-picker-${product._id}`} className="mt-1 text-2xl font-bold text-charcoal">Select weight</h3>
                <p className="mt-1 line-clamp-1 text-sm text-charcoal/60">{product.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setWeightPickerOpen(false)}
                aria-label="Close weight selector"
                className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal/60 transition-colors hover:bg-charcoal/5 hover:text-charcoal"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-3 sm:gap-3">
              {weightVariations.map((variation) => {
                const price = variation.isOnSale && variation.salePrice ? variation.salePrice : variation.price;
                const selected = selectedOrderWeight === variation.type;
                return (
                  <button
                    key={variation.type}
                    type="button"
                    onClick={() => setSelectedOrderWeight(variation.type)}
                    className={`rounded-xl border px-2 py-3 text-center transition-all sm:p-3 sm:text-left ${
                      selected
                        ? 'border-oxblood bg-oxblood text-ivory shadow-sm'
                        : 'border-charcoal/15 bg-white text-charcoal hover:border-oxblood/50'
                    }`}
                  >
                    <span className="block text-sm font-semibold sm:text-base">{variation.type}</span>
                    <span className={`mt-1 block text-[10px] sm:text-xs ${selected ? 'text-ivory/80' : 'text-charcoal/55'}`}>BDT {Number(price).toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleConfirmDirectOrder}
              disabled={!selectedOrderWeight}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-oxblood font-semibold text-ivory transition-colors hover:bg-oxblood-dark disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue to Checkout
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
