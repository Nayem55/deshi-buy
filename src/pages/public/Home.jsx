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
  ['🌿', 'খাঁটি ও প্রাকৃতিক পণ্য', 'বাছাই করা উৎস থেকে'],
  ['🚚', 'সারা দেশে ডেলিভারি', 'নিরাপদ প্যাকেজিংসহ'],
  ['💵', 'Cash on Delivery', 'পণ্য হাতে পেয়ে পেমেন্ট'],
  ['🛡️', 'বিশ্বাসযোগ্য সেবা', 'মানের নিশ্চয়তায় কেনাকাটা'],
];

export default function Home() {
  const [categories, setCategories] = useState({ loading: true, error: null, data: [] });
  const [featured, setFeatured] = useState({ loading: true, error: null, data: [] });

  useEffect(() => {
    let active = true;
    const loadHome = async () => {
      try {
        const [categoryResponse, mangoResponse, gurResponse] = await Promise.all([
          API.get('/categories'),
          API.get('/products?category=mango&limit=4'),
          API.get('/products?category=khejurer-gur&limit=4'),
        ]);
        if (!active) return;
        const productMap = new Map();
        [...(gurResponse.data.products || []), ...(mangoResponse.data.products || [])].forEach((product) => productMap.set(product._id, product));
        setCategories({ loading: false, error: null, data: categoryResponse.data.categories || [] });
        setFeatured({ loading: false, error: null, data: Array.from(productMap.values()).slice(0, 8) });
      } catch (error) {
        if (!active) return;
        const message = error.response?.data?.error || error.message || 'Unable to load the homepage.';
        setCategories((current) => ({ ...current, loading: false, error: message }));
        setFeatured((current) => ({ ...current, loading: false, error: message }));
      }
    };
    loadHome();
    return () => { active = false; };
  }, []);

  const renderCategories = () => {
    if (categories.loading) return <section className="py-12"><LoadingSpinner text="Loading categories..." /></section>;
    return (
      <section className="py-12 sm:py-16 bg-[#fffdf5]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
          <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
            <div>
              <span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">দেশি সংগ্রহ</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">পছন্দের পণ্য বেছে নিন</h2>
              <p className="mt-1 text-sm text-charcoal/60">প্রতিটি ক্যাটাগরি এক জায়গায়—যত যোগ হবে, সবই এখানে দেখা যাবে</p>
            </div>
            <Link to="/shop" className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">সব পণ্য দেখুন</Link>
          </AnimateOnScroll>
          {categories.error ? <ErrorDisplay message={categories.error} /> : categories.data.length === 0 ? (
            <EmptyState title="কোনো ক্যাটাগরি নেই" description="অ্যাডমিন প্যানেল থেকে যোগ করা ক্যাটাগরিগুলো এখানে দেখা যাবে।" actionLabel="সব পণ্য দেখুন" actionLink="/shop" />
          ) : (
            <div className="home-category-grid stagger-children">
              {categories.data.map((category, index) => (
                <AnimateOnScroll key={category._id || category.slug} animation="fade-up" delay={index * 70}>
                  <Link to={`/shop?category=${encodeURIComponent(category.slug || category._id)}`} className="home-category-card group">
                    <div className="home-category-card__image" style={{ backgroundImage: category.image ? `url(${optimizedImageUrl(category.image, { width: 760 })})` : 'none' }}>
                      {!category.image && <span className="text-5xl">{category.name.includes('আম') ? '🥭' : '🍯'}</span>}
                    </div>
                    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2"><span className="font-semibold text-sm sm:text-base leading-5">{category.name}</span><span className="text-oxblood text-lg group-hover:translate-x-1 transition-transform">→</span></div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderFocusedProducts = () => {
    if (featured.loading) return <section className="py-12"><LoadingSpinner text="Loading featured products..." /></section>;
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
          <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
            <div>
              <span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">মৌসুমি পছন্দ</span>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">আম ও খেজুরের গুড়</h2>
              <p className="mt-1 text-sm text-charcoal/60">এই মুহূর্তের প্রধান সংগ্রহ—একটি সাজানো বিভাগে</p>
            </div>
            <Link to="/shop" className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">সব পণ্য দেখুন</Link>
          </AnimateOnScroll>
          {featured.error ? <ErrorDisplay message={featured.error} /> : featured.data.length === 0 ? (
            <EmptyState title="পণ্য যোগ করা হয়নি" description="আম ও গুড়ের পণ্য যোগ হলে এই নির্বাচিত অংশে দেখা যাবে।" actionLabel="সব পণ্য দেখুন" actionLink="/shop" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
              {featured.data.map((product, index) => <AnimateOnScroll key={product._id} animation="fade-up" delay={index * 80}><ProductCard product={product} /></AnimateOnScroll>)}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div>
      <SEO title="Deshi Buy | Pure • Natural • Traditional" description="Discover pure seasonal Bangladeshi food from Deshi Buy, including mangoes, date palm jaggery and natural groceries delivered across Bangladesh." exactTitle />
      <div className="anim-fade-in visible"><HeroSlider /></div>
      <section className="border-y border-line bg-[#f4f7e9]">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-line">
          {SERVICE_POINTS.map(([icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5"><span className="text-xl sm:text-2xl" aria-hidden="true">{icon}</span><div><p className="font-semibold text-xs sm:text-sm leading-5">{title}</p><p className="text-[11px] sm:text-xs text-charcoal/55 leading-4">{copy}</p></div></div>)}
        </div>
      </section>
      {renderFocusedProducts()}
      {renderCategories()}
    </div>
  );
}
