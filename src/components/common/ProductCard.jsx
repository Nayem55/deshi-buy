import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { optimizedImageUrl, optimizedImageSrcSet } from '../../utils/imageUrl';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const wishlisted = isInWishlist(product._id);

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

  // Determine display price
  let displayPrice, regularPrice, isOnSale;
  if (hasVariations && variationPrices.length > 1) {
    displayPrice = minVariationPrice;
    regularPrice = maxVariationPrice;
    isOnSale = false;
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

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(user ? product._id : product);
      toast.success('Added to cart');
    } catch { toast.error('Failed to add'); }
  };

  const tags = [];
  if (product.isNew) tags.push({ label: 'New', className: 'bg-oxblood' });
  if (product.isBestSeller) tags.push({ label: 'Best Seller', className: 'bg-gold' });
  if (isOnSale) tags.push({ label: 'Sale', className: 'bg-oxblood' });
  if (product.isBridal && tags.length === 0) tags.push({ label: 'Bridal', className: 'bg-oxblood-dark' });
  const tagTopOffsets = ['top-3', 'top-9', 'top-[4.5rem]'];

  return (
    <Link to={`/product/${product.slug || product._id}`} className="group block">
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

        <button onClick={handleQuickAdd} className="absolute left-0 right-0 bottom-0 bg-charcoal/90 backdrop-blur-sm text-white text-[11px] tracking-[0.14em] uppercase py-3 text-center translate-y-full group-hover:translate-y-0 transition-all duration-400 z-10 hover:bg-oxblood">
          Quick Add +
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
  );
}
