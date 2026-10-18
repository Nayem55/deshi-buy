import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import HeroSlider from '../../components/home/HeroSlider';
import ProductCard from '../../components/common/ProductCard';
import AnimateOnScroll from '../../components/common/AnimateOnScroll';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import SEO from '../../components/common/SEO';
import { optimizedImageUrl } from '../../utils/imageUrl';

const SERVICE_POINTS = [
  ['🌿', 'Pure & Natural Products', 'Carefully Selected Sources'],
  ['🚚', 'Nationwide Delivery', 'Securely Packed For You'],
  ['💵', 'Cash On Delivery', 'Pay After Receiving Your Order'],
  ['🛡️', 'Trusted Service', 'Shop With Confidence'],
];

const PRODUCT_SECTIONS = [
  { key: 'bestSellers', eyebrow: 'Customer favourites', title: 'Best Selling Products', description: 'Our most-loved Deshi Buy products.', endpoint: '/products?isBestSeller=true&limit=4', link: '/shop?isBestSeller=true' },
  { key: 'liveDiscounts', eyebrow: 'Limited-time offers', title: 'Live Discount Products', description: 'Shop the products currently selected for live discounts.', endpoint: '/products?isOnSale=true&limit=4', link: '/shop?isOnSale=true' },
  { key: 'popular', eyebrow: 'Loved right now', title: 'Popular Products', description: 'The products customers are choosing most often.', endpoint: '/products?isTrending=true&limit=4', link: '/shop?isTrending=true' },
  { key: 'seasonal', eyebrow: 'Fresh seasonal picks', title: 'Seasonal Products', description: 'A curated collection for the current season.', endpoint: '/products?isSeasonal=true&limit=4', link: '/shop?isSeasonal=true' },
];

const initialSectionState = () => Object.fromEntries(PRODUCT_SECTIONS.map(({ key }) => [key, { loading: true, error: null, data: [] }]));

const SAMPLE_REVIEWS = [
  { rating: 5, comment: 'প্যাকেজিং অনেক সুন্দর ছিল, আর পণ্যগুলোও একদম ফ্রেশ। গিফট দেওয়ার জন্য দারুণ একটি অপশন।', customerName: 'Customer • Dhaka' },
  { rating: 5, comment: 'The gift box arrived neatly packed and on time. Everything looked premium and thoughtfully selected.', customerName: 'Customer • Chattogram' },
  { rating: 5, comment: 'খেজুরের গুড়ের স্বাদ খুবই ভালো লেগেছে। পরিবারের সবাই পছন্দ করেছে।', customerName: 'Customer • Rajshahi' },
  { rating: 5, comment: 'Fresh products, careful packing, and a very smooth ordering experience. Highly recommended.', customerName: 'Customer • Sylhet' },
];

export default function Home() {
  const [categories, setCategories] = useState({ loading: true, error: null, data: [] });
  const [sections, setSections] = useState(initialSectionState);
  const [reviews, setReviews] = useState([]);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    let active = true;
    const loadHome = async () => {
      try {
        const responses = await Promise.all([API.get('/categories'), ...PRODUCT_SECTIONS.map((section) => API.get(section.endpoint)), API.get('/reviews').catch(() => ({ data: { reviews: [] } }))]);
        if (!active) return;
        setCategories({ loading: false, error: null, data: responses[0].data.categories || [] });
        setSections(Object.fromEntries(PRODUCT_SECTIONS.map((section, index) => [section.key, { loading: false, error: null, data: responses[index + 1].data.products || [] }])));
        const reviewResponse = responses[PRODUCT_SECTIONS.length + 1].data;
        setReviews(reviewResponse.reviews || reviewResponse.data || []);
      } catch (error) {
        if (!active) return;
        const message = error.response?.data?.error || error.message || 'Unable to load the homepage.';
        setCategories((current) => ({ ...current, loading: false, error: message }));
        setSections((current) => Object.fromEntries(PRODUCT_SECTIONS.map((section) => [section.key, { ...current[section.key], loading: false, error: message }])));
      }
    };
    loadHome();
    return () => { active = false; };
  }, []);

  const displayedReviews = reviews.length ? reviews : SAMPLE_REVIEWS;
  useEffect(() => {
    setActiveReviewIndex(0);
  }, [reviews.length]);
  useEffect(() => {
    if (displayedReviews.length < 2) return undefined;
    const timer = window.setInterval(() => setActiveReviewIndex((current) => (current + 1) % displayedReviews.length), 5500);
    return () => window.clearInterval(timer);
  }, [displayedReviews.length]);

  const renderProductSection = (section, index) => {
    const state = sections[section.key];
    return <section key={section.key} className={`py-12 sm:py-16 ${index % 2 ? 'bg-[#fffdf5]' : 'bg-white'}`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
        <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
          <div><span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">{section.eyebrow}</span><h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">{section.title}</h2><p className="mt-1 text-sm text-charcoal/60">{section.description}</p></div>
          <Link to={section.link} className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">View all</Link>
        </AnimateOnScroll>
        {state.loading ? <LoadingSpinner text={`Loading ${section.title.toLowerCase()}...`} /> : state.error ? <ErrorDisplay message={state.error} /> : state.data.length === 0 ? <EmptyState title="No products available" description="Products selected for this collection will appear here." actionLabel="View all products" actionLink="/shop" /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">{state.data.map((product, productIndex) => <AnimateOnScroll key={product._id} animation="fade-up" delay={productIndex * 70}><ProductCard product={product} /></AnimateOnScroll>)}</div>}
      </div>
    </section>;
  };

  const renderCategories = () => <section className="py-12 sm:py-16 bg-[#fffdf5]">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
      <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
        <div><span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">Browse the collection</span><h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">Products by Category</h2><p className="mt-1 text-sm text-charcoal/60">Find your favourites by category.</p></div>
        <Link to="/shop" className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">View all products</Link>
      </AnimateOnScroll>
      {categories.loading ? <LoadingSpinner text="Loading categories..." /> : categories.error ? <ErrorDisplay message={categories.error} /> : categories.data.length === 0 ? <EmptyState title="No categories available" description="Categories will appear here once added." actionLabel="View all products" actionLink="/shop" /> : <div className="home-category-grid stagger-children">{categories.data.map((category, index) => <AnimateOnScroll key={category._id || category.slug} animation="fade-up" delay={index * 70}><Link to={`/shop?category=${encodeURIComponent(category.slug || category._id)}`} className="home-category-card group"><div className="home-category-card__image" style={{ backgroundImage: category.image ? `url(${optimizedImageUrl(category.image, { width: 760 })})` : 'none' }}>{!category.image && <span className="text-5xl">📦</span>}</div><div className="p-3.5 sm:p-4 flex items-center justify-between gap-2"><span className="font-semibold text-sm sm:text-base leading-5">{category.name}</span><span className="text-oxblood text-lg group-hover:translate-x-1 transition-transform">→</span></div></Link></AnimateOnScroll>)}</div>}
    </div>
  </section>;

  const renderGiftBoxHighlight = () => {
    const giftBoxCategory = categories.data.find((category) => /deshi\s*buy\s*gift\s*box/i.test(category.name || '') || /gift-box/i.test(category.slug || ''));
    const activeReview = displayedReviews[activeReviewIndex] || displayedReviews[0];
    const categoryHref = giftBoxCategory ? `/shop?category=${encodeURIComponent(giftBoxCategory.slug || giftBoxCategory._id)}` : '/shop';
    return <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
        <AnimateOnScroll animation="fade-up" className="mb-7 sm:mb-9"><span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">Made for gifting</span><h2 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">Deshi Buy Gift Box</h2></AnimateOnScroll>
        <div className="grid gap-5 md:grid-cols-2 md:gap-7">
          <AnimateOnScroll animation="fade-up" className="h-full">
            <Link to={categoryHref} className="group block h-full min-h-[280px] sm:min-h-[340px] overflow-hidden rounded-2xl bg-[#f4f7e9] relative">
              {giftBoxCategory?.image ? <img src={optimizedImageUrl(giftBoxCategory.image, { width: 960 })} alt="Deshi Buy Gift Box" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-oxblood/30" />}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
              <div className="absolute bottom-0 p-6 sm:p-8 text-white"><p className="text-xs tracking-[0.16em] uppercase text-gold mb-2">Thoughtfully Curated</p><h3 className="font-serif text-2xl sm:text-3xl font-bold">Gift Something Truly Deshi</h3><span className="inline-flex mt-4 text-xs font-bold tracking-[0.12em] uppercase border-b border-white pb-1">Explore Gift Boxes</span></div>
            </Link>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fade-up" delay={100} className="h-full">
            <div className="h-full min-h-[280px] sm:min-h-[340px] rounded-2xl border border-line bg-[#fffdf5] p-6 sm:p-8 flex flex-col justify-between">
              <div key={activeReview?._id || activeReview?.customerName || activeReviewIndex} className="review-slide"><div className="flex items-center justify-between gap-3"><span className="text-gold text-sm sm:text-base font-bold tracking-[0.2em] uppercase">Customer Review</span>{displayedReviews.length > 1 && <span className="text-xs text-charcoal/45">{activeReviewIndex + 1} / {displayedReviews.length}</span>}</div><div className="mt-5 text-gold tracking-[0.18em] text-lg">{'★'.repeat(Math.max(1, Math.min(5, activeReview?.rating || 5)))}</div><blockquote className="mt-5 font-serif text-xl sm:text-2xl leading-relaxed text-charcoal">“{activeReview?.comment || 'A wonderful Deshi Buy experience.'}”</blockquote><p className="mt-5 text-sm font-semibold text-charcoal">{activeReview?.customerName || activeReview?.user?.name || activeReview?.user?.email || 'Verified Customer'}</p></div>
              <div className="mt-8 flex items-end justify-between gap-4"><Link to="/shop?category=deshi-buy-gift-box" className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">Shop Gift Boxes</Link>{displayedReviews.length > 1 && <div className="flex gap-1.5">{displayedReviews.map((review, index) => <button key={review._id || review.customerName || index} type="button" onClick={() => setActiveReviewIndex(index)} aria-label={`Show review ${index + 1}`} className={`h-2 w-2 rounded-full transition-colors ${index === activeReviewIndex ? 'bg-oxblood' : 'bg-charcoal/20 hover:bg-charcoal/40'}`} />)}</div>}</div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>;
  };

  return <div>
    <SEO title="Deshi Buy | Pure • Natural • Traditional" description="Discover pure seasonal Bangladeshi food from Deshi Buy, including mangoes, date palm jaggery and natural groceries delivered across Bangladesh." exactTitle />
    <div className="anim-fade-in visible"><HeroSlider /></div>
    <section className="border-y border-line bg-[#f4f7e9]"><div className="max-w-[1240px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-line">{SERVICE_POINTS.map(([icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5"><span className="text-xl sm:text-2xl" aria-hidden="true">{icon}</span><div><p className="font-semibold text-xs sm:text-sm leading-5">{title}</p><p className="text-[11px] sm:text-xs text-charcoal/55 leading-4">{copy}</p></div></div>)}</div></section>
    {PRODUCT_SECTIONS.map(renderProductSection)}
    {renderCategories()}
    {renderGiftBoxHighlight()}
  </div>;
}
