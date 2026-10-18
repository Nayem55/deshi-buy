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
  ['🌿', 'Pure & natural products', 'Carefully selected sources'],
  ['🚚', 'Nationwide delivery', 'Securely packed for you'],
  ['💵', 'Cash on Delivery', 'Pay after receiving your order'],
  ['🛡️', 'Trusted service', 'Shop with confidence'],
];

const PRODUCT_SECTIONS = [
  { key: 'bestSellers', eyebrow: 'Customer favourites', title: 'Best Selling Products', description: 'Our most-loved Deshi Buy products.', endpoint: '/products?isBestSeller=true&limit=4', link: '/shop?isBestSeller=true' },
  { key: 'liveDiscounts', eyebrow: 'Limited-time offers', title: 'Live Discount Products', description: 'Shop the products currently selected for live discounts.', endpoint: '/products?isOnSale=true&limit=4', link: '/shop?isOnSale=true' },
  { key: 'popular', eyebrow: 'Loved right now', title: 'Popular Products', description: 'The products customers are choosing most often.', endpoint: '/products?isTrending=true&limit=4', link: '/shop?isTrending=true' },
  { key: 'seasonal', eyebrow: 'Fresh seasonal picks', title: 'Seasonal Products', description: 'A curated collection for the current season.', endpoint: '/products?isSeasonal=true&limit=4', link: '/shop?isSeasonal=true' },
];

const initialSectionState = () => Object.fromEntries(PRODUCT_SECTIONS.map(({ key }) => [key, { loading: true, error: null, data: [] }]));

export default function Home() {
  const [categories, setCategories] = useState({ loading: true, error: null, data: [] });
  const [sections, setSections] = useState(initialSectionState);

  useEffect(() => {
    let active = true;
    const loadHome = async () => {
      try {
        const responses = await Promise.all([API.get('/categories'), ...PRODUCT_SECTIONS.map((section) => API.get(section.endpoint))]);
        if (!active) return;
        setCategories({ loading: false, error: null, data: responses[0].data.categories || [] });
        setSections(Object.fromEntries(PRODUCT_SECTIONS.map((section, index) => [section.key, { loading: false, error: null, data: responses[index + 1].data.products || [] }])));
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

  const renderProductSection = (section, index) => {
    const state = sections[section.key];
    return <section key={section.key} className={`py-12 sm:py-16 ${index % 2 ? 'bg-[#fffdf5]' : 'bg-white'}`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
        <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
          <div><span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">{section.eyebrow}</span><h2 className="font-serif text-2xl sm:text-3xl text-charcoal">{section.title}</h2><p className="mt-1 text-sm text-charcoal/60">{section.description}</p></div>
          <Link to={section.link} className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">View all</Link>
        </AnimateOnScroll>
        {state.loading ? <LoadingSpinner text={`Loading ${section.title.toLowerCase()}...`} /> : state.error ? <ErrorDisplay message={state.error} /> : state.data.length === 0 ? <EmptyState title="No products available" description="Products selected for this collection will appear here." actionLabel="View all products" actionLink="/shop" /> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">{state.data.map((product, productIndex) => <AnimateOnScroll key={product._id} animation="fade-up" delay={productIndex * 70}><ProductCard product={product} /></AnimateOnScroll>)}</div>}
      </div>
    </section>;
  };

  const renderCategories = () => <section className="py-12 sm:py-16 bg-[#fffdf5]">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-7">
      <AnimateOnScroll animation="fade-up" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-7 sm:mb-9">
        <div><span className="text-gold text-[11px] tracking-[0.24em] uppercase block mb-2">Browse the collection</span><h2 className="font-serif text-2xl sm:text-3xl text-charcoal">Products by Category</h2><p className="mt-1 text-sm text-charcoal/60">Find your favourites by category.</p></div>
        <Link to="/shop" className="text-oxblood-dark text-xs font-semibold tracking-[0.12em] uppercase border-b border-oxblood-dark pb-1 w-fit hover:text-gold hover:border-gold transition-colors">View all products</Link>
      </AnimateOnScroll>
      {categories.loading ? <LoadingSpinner text="Loading categories..." /> : categories.error ? <ErrorDisplay message={categories.error} /> : categories.data.length === 0 ? <EmptyState title="No categories available" description="Categories will appear here once added." actionLabel="View all products" actionLink="/shop" /> : <div className="home-category-grid stagger-children">{categories.data.map((category, index) => <AnimateOnScroll key={category._id || category.slug} animation="fade-up" delay={index * 70}><Link to={`/shop?category=${encodeURIComponent(category.slug || category._id)}`} className="home-category-card group"><div className="home-category-card__image" style={{ backgroundImage: category.image ? `url(${optimizedImageUrl(category.image, { width: 760 })})` : 'none' }}>{!category.image && <span className="text-5xl">📦</span>}</div><div className="p-3.5 sm:p-4 flex items-center justify-between gap-2"><span className="font-semibold text-sm sm:text-base leading-5">{category.name}</span><span className="text-oxblood text-lg group-hover:translate-x-1 transition-transform">→</span></div></Link></AnimateOnScroll>)}</div>}
    </div>
  </section>;

  return <div>
    <SEO title="Deshi Buy | Pure • Natural • Traditional" description="Discover pure seasonal Bangladeshi food from Deshi Buy, including mangoes, date palm jaggery and natural groceries delivered across Bangladesh." exactTitle />
    <div className="anim-fade-in visible"><HeroSlider /></div>
    <section className="border-y border-line bg-[#f4f7e9]"><div className="max-w-[1240px] mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-line">{SERVICE_POINTS.map(([icon, title, copy]) => <div key={title} className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5"><span className="text-xl sm:text-2xl" aria-hidden="true">{icon}</span><div><p className="font-semibold text-xs sm:text-sm leading-5">{title}</p><p className="text-[11px] sm:text-xs text-charcoal/55 leading-4">{copy}</p></div></div>)}</div></section>
    {PRODUCT_SECTIONS.map(renderProductSection)}
    {renderCategories()}
  </div>;
}
