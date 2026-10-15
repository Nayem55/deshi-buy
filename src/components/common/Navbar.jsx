import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import SearchModal from './SearchModal';
import API from '../../api/axios';
import { optimizedImageUrl } from '../../utils/imageUrl';

export default function Navbar() {
  const { pathname, search } = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const [navLinks, setNavLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storefrontAvailable, setStorefrontAvailable] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/settings'),
      API.get('/categories').catch(() => ({ data: { categories: [] } })),
      API.get('/subcategories').catch(() => ({ data: { subcategories: [] } })),
      API.get('/brands').catch(() => ({ data: { brands: [] } })),
    ])
      .then(([settingsRes, categoriesRes, subcategoriesRes, brandsRes]) => {
        const res = settingsRes;
        const s = res.data?.settings || {};
        setStorefrontAvailable(true);
        setSettings(s);
        setNavLinks((s.navLinks || []).filter((link) => link?.active !== false && link?.label && link?.url));
        setCategories((categoriesRes.data?.categories || categoriesRes.data?.data || []).filter((cat) => cat?.isActive !== false));
        setSubcategories((subcategoriesRes.data?.subcategories || []).filter((sub) => sub?.isActive !== false));
        setBrands((brandsRes.data?.brands || brandsRes.data?.data || []).filter((brand) => brand?.isActive !== false));
      })
      .catch(() => setStorefrontAvailable(false));
  }, []);

  const companyName = settings.companyName || '';
  const slogan = settings.slogan || '';
  const announcementText = settings.announcementText || '';
  const headerCategoryMenu = {
    enabled: true,
    label: 'Categories',
    showEmptyCategories: true,
    ...(settings.headerCategoryMenu || {}),
  };
  const headerBrandMenu = {
    enabled: true,
    label: 'Brands',
    ...(settings.headerBrandMenu || {}),
  };
  const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
    const key = typeof sub.category === 'object' ? sub.category?._id : sub.category;
    if (!key) return acc;
    acc[key] = [...(acc[key] || []), sub];
    return acc;
  }, {});
  const visibleCategories = categories.filter((cat) => headerCategoryMenu.showEmptyCategories || (subcategoriesByCategory[cat._id] || []).length > 0);
  const isInternalLink = (url = '') => url.startsWith('/');
  const categoryHref = (category) => `/shop?category=${category.slug}`;
  const subcategoryHref = (category, subcategory) => `/shop?category=${category.slug}&subcategory=${subcategory.slug}`;
  const brandHref = (brand) => `/shop?brand=${brand.slug || brand._id}`;
  const isActiveLink = (url) => {
    if (!isInternalLink(url)) return false;
    const [p, q] = url.split('?');
    if (p === pathname) {
      if (!q) return true;
      const params = new URLSearchParams(q);
      const current = new URLSearchParams(search);
      for (const [k, v] of params) {
        if (current.get(k) !== v) return false;
      }
      return true;
    }
    return false;
  };

  const linkIcon = (link) => {
    const haystack = `${link?.label || ''} ${link?.url || ''}`.toLowerCase();
    if (haystack.includes('new') || haystack.includes('arrival')) return 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.091-3.091L2.25 12l2.846-.813a4.5 4.5 0 003.091-3.091L9 5.25l.813 2.846a4.5 4.5 0 003.091 3.091L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.091zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z';
    if (haystack.includes('best') || haystack.includes('seller')) return 'M16.5 18.75h-9m9 0a3 3 0 003-3v-1.5a3 3 0 00-3-3h-.75M7.5 18.75a3 3 0 01-3-3v-1.5a3 3 0 013-3h.75m8.25 7.5V21m-9-2.25V21m1.5-17.25h6l.75 7.5a3.75 3.75 0 01-7.5 0l.75-7.5z';
    if (haystack.includes('trend') || haystack.includes('popular')) return 'M2.25 18L9 11.25l4.5 4.5L21.75 7.5M21.75 7.5h-6m6 0v6';
    if (haystack.includes('bridal') || haystack.includes('wedding')) return 'M21 8.25c0-2.071-1.679-3.75-3.75-3.75-1.096 0-2.08.47-2.766 1.22L12 8.25 9.516 5.72A3.728 3.728 0 006.75 4.5 3.75 3.75 0 003 8.25c0 5.25 9 10.5 9 10.5s9-5.25 9-10.5z';
    if (haystack.includes('sale') || haystack.includes('offer') || haystack.includes('discount')) return 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l8.182 8.182a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.159 3.659A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z';
    if (haystack.includes('category') || haystack.includes('collection')) return 'M3.75 6A2.25 2.25 0 016 3.75h3A2.25 2.25 0 0111.25 6v3A2.25 2.25 0 019 11.25H6A2.25 2.25 0 013.75 9V6zM12.75 6A2.25 2.25 0 0115 3.75h3A2.25 2.25 0 0120.25 6v3A2.25 2.25 0 0118 11.25h-3A2.25 2.25 0 0112.75 9V6zM3.75 15A2.25 2.25 0 016 12.75h3A2.25 2.25 0 0111.25 15v3A2.25 2.25 0 019 20.25H6A2.25 2.25 0 013.75 18v-3zM12.75 15A2.25 2.25 0 0115 12.75h3A2.25 2.25 0 0120.25 15v3A2.25 2.25 0 0118 20.25h-3A2.25 2.25 0 0112.75 18v-3z';
    if (haystack.includes('designer') || haystack.includes('brand')) return 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01';
    if (haystack.includes('page') || haystack.includes('terms') || haystack.includes('privacy') || haystack.includes('shipping') || haystack.includes('return')) return 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H6.75A2.25 2.25 0 004.5 4.5v15A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25v-4.5zM8.25 15h7.5M8.25 18h7.5';
    return 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3';
  };

  const NavItem = ({ link, mobile = false, onClick }) => {
    const active = isActiveLink(link.url);
    const className = mobile
      ? `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`
      : `text-xs tracking-[0.13em] uppercase font-medium pb-1 transition-all ${active ? 'text-oxblood-dark font-bold border-b-2 border-gold' : 'text-charcoal border-b border-transparent hover:border-gold hover:text-oxblood-dark'}`;

    const icon = linkIcon(link);
    const content = (
      <>
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
        {link.label}
      </>
    );
    return isInternalLink(link.url) ? (
      <Link to={link.url} onClick={onClick} className={className}>{mobile ? content : link.label}</Link>
    ) : (
      <a href={link.url} onClick={onClick} className={className} target="_blank" rel="noreferrer">{mobile ? content : link.label}</a>
    );
  };

  const CategoryDropdown = () => {
    if (!headerCategoryMenu.enabled || visibleCategories.length === 0) return null;

    const anyCatActive = visibleCategories.some((cat) => {
      if (isActiveLink(categoryHref(cat))) return true;
      return (subcategoriesByCategory[cat._id] || []).some((sub) => isActiveLink(subcategoryHref(cat, sub)));
    });

    return (
      <li className="relative group">
        <button type="button" className={`inline-flex items-center gap-1.5 text-xs tracking-[0.13em] uppercase font-medium pb-1 transition-all ${anyCatActive ? 'text-oxblood-dark font-bold border-b-2 border-gold' : 'text-charcoal border-b border-transparent hover:border-gold hover:text-oxblood-dark'}`}>
          {headerCategoryMenu.label || 'Categories'}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 absolute left-1/2 top-full z-[70] w-72 -translate-x-1/2 border border-line bg-white shadow-xl transition-all duration-150">
          <div className="py-2">
            {visibleCategories.map((category) => {
              const children = subcategoriesByCategory[category._id] || [];
              const catActive = isActiveLink(categoryHref(category));
              return (
                <div key={category._id} className="relative group/category">
                  <Link to={categoryHref(category)} className={`flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors ${catActive ? 'text-oxblood-dark font-bold bg-gold/10' : 'text-charcoal hover:bg-ivory hover:text-oxblood-dark'}`}>
                    <span>{category.name}</span>
                    {children.length > 0 && (
                      <svg className="w-4 h-4 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </Link>
                  {children.length > 0 && (
                    <div className="invisible opacity-0 group-hover/category:visible group-hover/category:opacity-100 absolute left-full top-0 w-64 border border-line bg-white shadow-xl transition-opacity duration-150">
                      <div className="py-2 max-h-[520px] overflow-y-auto scrollbar-thin">
                        {children.map((subcategory) => {
                          const subActive = isActiveLink(subcategoryHref(category, subcategory));
                          return (
                            <Link key={subcategory._id} to={subcategoryHref(category, subcategory)} className={`block px-4 py-2.5 text-sm transition-colors ${subActive ? 'text-oxblood-dark font-bold bg-gold/10' : 'text-charcoal/80 hover:bg-ivory hover:text-oxblood-dark'}`}>
                              {subcategory.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </li>
    );
  };

  const BrandDropdown = () => {
    if (!headerBrandMenu.enabled || brands.length === 0) return null;

    const anyBrandActive = brands.some((brand) => isActiveLink(brandHref(brand)));

    return (
      <li className="relative group">
        <button type="button" className={`inline-flex items-center gap-1.5 text-xs tracking-[0.13em] uppercase font-medium pb-1 transition-all ${anyBrandActive ? 'text-oxblood-dark font-bold border-b-2 border-gold' : 'text-charcoal border-b border-transparent hover:border-gold hover:text-oxblood-dark'}`}>
          {headerBrandMenu.label || 'Brands'}
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 absolute left-1/2 top-full z-[70] w-72 -translate-x-1/2 border border-line bg-white shadow-xl transition-all duration-150">
          <div className="max-h-[520px] overflow-y-auto py-2 scrollbar-thin">
            {brands.map((brand) => {
              const active = isActiveLink(brandHref(brand));
              return (
                <Link key={brand._id || brand.slug} to={brandHref(brand)} className={`block px-4 py-2.5 text-sm transition-colors ${active ? 'text-oxblood-dark font-bold bg-gold/10' : 'text-charcoal/80 hover:bg-ivory hover:text-oxblood-dark'}`}>
                  {brand.name}
                </Link>
              );
            })}
          </div>
        </div>
      </li>
    );
  };

  const MobileCategoryMenu = () => {
    const [catOpen, setCatOpen] = useState(false);

    if (!headerCategoryMenu.enabled || categories.length === 0) return null;

    const anyActive = visibleCategories.some((cat) => isActiveLink(categoryHref(cat)) || (subcategoriesByCategory[cat._id] || []).some((sub) => isActiveLink(subcategoryHref(cat, sub))));

    return (
      <div>
        <button onClick={() => setCatOpen(!catOpen)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${anyActive ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`}>
          <span className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            {headerCategoryMenu.label || 'Categories'}
          </span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {catOpen && (
          <div className="ml-3 pl-2 border-l-2 border-gold/20 space-y-0.5 mt-0.5 mb-1">
            {visibleCategories.map((category) => {
              const children = subcategoriesByCategory[category._id] || [];
              const catActive = isActiveLink(categoryHref(category));
              return (
                <div key={category._id}>
                  <Link to={categoryHref(category)} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${catActive ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    {category.name}
                  </Link>
                  {children.length > 0 && (
                    <div className="ml-4 pl-2 border-l border-line space-y-0.5 mt-0.5 mb-1">
                      {children.map((subcategory) => {
                        const subActive = isActiveLink(subcategoryHref(category, subcategory));
                        return (
                          <Link key={subcategory._id} to={subcategoryHref(category, subcategory)} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all ${subActive ? 'text-oxblood-dark font-bold bg-gold/5' : 'text-charcoal/60 hover:text-charcoal hover:bg-ivory'}`}>
                            {subcategory.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-wider uppercase text-gold font-medium hover:bg-gold/5 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              View All Categories
            </Link>
          </div>
        )}
      </div>
    );
  };

  const MobileBrandMenu = () => {
    const [brandOpen, setBrandOpen] = useState(false);

    if (!headerBrandMenu.enabled || brands.length === 0) return null;

    const anyActive = brands.some((brand) => isActiveLink(brandHref(brand)));

    return (
      <div>
        <button onClick={() => setBrandOpen(!brandOpen)} className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${anyActive ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`}>
          <span className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            {headerBrandMenu.label || 'Brands'}
          </span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {brandOpen && (
          <div className="ml-3 max-h-80 overflow-y-auto border-l-2 border-gold/20 pl-2 space-y-0.5 mt-0.5 mb-1">
            {brands.map((brand) => {
              const active = isActiveLink(brandHref(brand));
              return (
                <Link key={brand._id || brand.slug} to={brandHref(brand)} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`}>
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  {brand.name}
                </Link>
              );
            })}
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-wider uppercase text-gold font-medium hover:bg-gold/5 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              View All Products
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {announcementText && (
        <div className="bg-charcoal text-blush text-center text-[11px] tracking-[0.14em] uppercase py-2.5 overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] inline-block">
            {announcementText.split('|').map((text, i) => (
              <span key={i} className="px-6">{text.trim()}</span>
            ))}
          </div>
        </div>
      )}
      <header className="bg-ivory border-b border-line sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between py-4 sm:py-5">
            {/* Mobile: hamburger + search */}
            <div className="flex items-center gap-4 lg:hidden">
              <button onClick={() => setMobileOpen(true)} aria-label="Menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <button onClick={() => setSearchOpen(true)} aria-label="Search">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>

            {/* Desktop: logo (left aligned) */}
            <Link to="/" className="hidden lg:flex items-center gap-3">
              {settings.logo || companyName ? (
                <img src={optimizedImageUrl(settings.logo || '/deshi-buy-logo.png', { width: 320 })} alt={companyName || 'Deshi Buy'} className="h-10 sm:h-12 w-auto max-w-[210px] object-contain" />
              ) : companyName ? (
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.12em] font-bold text-oxblood-dark whitespace-nowrap">
                  {companyName} <span className="text-gold">{slogan}</span>
                </span>
              ) : null}
            </Link>

            {/* Mobile: logo (centered) */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:hidden flex items-center gap-3">
              {settings.logo || companyName ? (
                <img src={optimizedImageUrl(settings.logo || '/deshi-buy-logo.png', { width: 320 })} alt={companyName || 'Deshi Buy'} className="h-12 sm:h-16" />
              ) : companyName ? (
                <span className="font-serif text-xl sm:text-3xl tracking-[0.12em] font-bold text-oxblood-dark whitespace-nowrap">
                  {companyName} <span className="text-gold">{slogan}</span>
                </span>
              ) : null}
            </Link>

            {/* Desktop: search bar + account + wishlist + cart */}
            <div className="hidden lg:flex items-center gap-5">
              <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 border border-line px-3.5 py-2.5 min-w-[200px] lg:min-w-[230px] bg-white text-sm text-charcoal/60 cursor-text">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                পণ্য খুঁজুন...
              </button>
              <Link to="/account" className={`flex flex-col items-center text-[10px] tracking-wider gap-1 transition-colors ${pathname === '/account' ? 'text-oxblood-dark font-bold' : 'text-charcoal hover:text-oxblood-dark'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Account
              </Link>
              <Link to="/wishlist" className={`relative flex flex-col items-center text-[10px] tracking-wider gap-1 transition-colors ${pathname === '/wishlist' ? 'text-oxblood-dark font-bold' : 'text-charcoal hover:text-oxblood-dark'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                Wishlist
                {wishlist.length > 0 && <span className="absolute -top-1.5 -right-2.5 bg-oxblood text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>
              <Link to="/cart" className={`relative flex flex-col items-center text-[10px] tracking-wider gap-1 transition-colors ${pathname === '/cart' ? 'text-oxblood-dark font-bold' : 'text-charcoal hover:text-oxblood-dark'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Cart
                {cartCount > 0 && <span className="absolute -top-1.5 -right-2.5 bg-oxblood text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>

            {/* Mobile: wishlist + cart */}
            <div className="flex items-center gap-4 lg:hidden">
              <Link to="/wishlist" className={`relative ${pathname === '/wishlist' ? 'text-oxblood-dark' : 'text-charcoal'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlist.length > 0 && <span className="absolute -top-1.5 -right-2 bg-oxblood text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
              </Link>
              <Link to="/cart" className={`relative ${pathname === '/cart' ? 'text-oxblood-dark' : 'text-charcoal'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {cartCount > 0 && <span className="absolute -top-1.5 -right-2 bg-oxblood text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>
        <nav className="border-t border-line hidden lg:block">
          <ul className="flex justify-center gap-8 xl:gap-10 max-w-[1320px] mx-auto py-3.5 flex-wrap">
            {storefrontAvailable && (
              <li>
                <Link to="/shop" className={`text-xs tracking-[0.13em] uppercase font-medium pb-1 transition-all ${pathname === '/shop' ? 'text-oxblood-dark font-bold border-b-2 border-gold' : 'text-charcoal border-b border-transparent hover:border-gold hover:text-oxblood-dark'}`}>Shop</Link>
              </li>
            )}
            <CategoryDropdown />
            <BrandDropdown />
            {navLinks.map((link, i) => (
              <li key={i}>
                <NavItem link={link} />
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col animate-[slideIn_0.25s_ease-out]">
            <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

            {/* Brand header */}
            <div className="bg-oxblood-dark px-6 py-5 flex items-center justify-between flex-shrink-0">
              {companyName && (
                <div>
                  <div className="text-lg font-bold tracking-[0.15em] uppercase text-ivory">{companyName}</div>
                  {slogan && <div className="text-gold text-[10px] tracking-[0.25em] uppercase mt-0.5 font-semibold">{slogan}</div>}
                </div>
              )}
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4 text-ivory" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto py-3 px-4">
              <button onClick={() => { setMobileOpen(false); setSearchOpen(true); }} className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-ivory text-charcoal/50 text-sm border border-line">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search products...
              </button>
              <div className="space-y-0.5">
                {storefrontAvailable && (
                  <Link to="/shop" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === '/shop' ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory hover:text-charcoal'}`}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Shop
                  </Link>
                )}

                <MobileCategoryMenu />
                <MobileBrandMenu />

                {navLinks.map((link, i) => (
                  <NavItem key={i} link={link} mobile onClick={() => setMobileOpen(false)} />
                ))}
              </div>
            </div>

            {/* Account footer */}
            <div className="border-t border-line px-4 py-4 flex-shrink-0 bg-ivory/30">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-full bg-oxblood text-ivory flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-charcoal truncate">{user.name || 'User'}</div>
                      <div className="text-[11px] text-charcoal/50 truncate">{user.email || ''}</div>
                    </div>
                  </div>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${pathname === '/account' ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory'}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Account
                  </Link>
                  <Link to="/my-orders" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${pathname === '/my-orders' ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory'}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    My Orders
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" /></svg>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link to="/account" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === '/account' ? 'bg-gold/10 text-oxblood-dark font-bold' : 'text-charcoal/70 hover:bg-ivory'}`}>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Sign In / Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
