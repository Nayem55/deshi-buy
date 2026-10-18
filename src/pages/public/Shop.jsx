import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorDisplay from "../../components/common/ErrorDisplay";
import SEO from "../../components/common/SEO";

const WEIGHTS = ["1 kg", "2 kg", "3 kg", "5 kg", "10 kg"];

const SORT_OPTIONS = [
  // { label: 'Newest First', value: '-createdAt' },
  // { label: 'Oldest First', value: 'createdAt' },
  { label: "Best Selling", value: "-sold" },
  { label: "Top Rated", value: "-averageRating" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Name: A-Z", value: "name" },
  { label: "Name: Z-A", value: "-name" },
];

const PRICE_RANGES = [
  { label: "Under BDT 500", min: 0, max: 500 },
  { label: "BDT 500 - BDT 1,000", min: 500, max: 1000 },
  { label: "BDT 1,000 - BDT 2,000", min: 1000, max: 2000 },
  { label: "BDT 2,000 - BDT 5,000", min: 2000, max: 5000 },
  { label: "BDT 5,000 - BDT 10,000", min: 5000, max: 10000 },
  { label: "Above BDT 10,000", min: 10000, max: "" },
];

const formatParamLabel = (value) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openFilterSections, setOpenFilterSections] = useState({
    brands: true,
    categories: true,
  });

  // Extract filter values from URL params
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sort") || "-createdAt";
  const categoryParam = searchParams.get("category") || "";
  const subcategoryParam = searchParams.get("subcategory") || "";
  const brandParam = searchParams.get("brand") || "";
  const selectedWeights =
    searchParams.get("weight")?.split(",").filter(Boolean) || [];
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const isTrending = searchParams.get("isTrending") || "";
  const isBestSeller = searchParams.get("isBestSeller") || "";
  const isFeatured = searchParams.get("isFeatured") || "";
  const isNew = searchParams.get("isNew") || "";
  const isBridal = searchParams.get("isBridal") || "";
  const isOnSale = searchParams.get("isOnSale") || "";
  const isSeasonal = searchParams.get("isSeasonal") || "";

  // Fetch filter data
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [brandRes, categoryRes, subcategoryRes] = await Promise.all([
          API.get("/brands").catch(() => ({ data: { brands: [] } })),
          API.get("/categories"),
          API.get("/subcategories").catch(() => ({
            data: { subcategories: [] },
          })),
        ]);
        setBrands(
          (brandRes.data.brands || brandRes.data.data || []).filter(
            (brand) => brand?.isActive !== false,
          ),
        );
        setCategories(
          (categoryRes.data.categories || categoryRes.data.data || []).filter(
            (category) => category?.isActive !== false,
          ),
        );
        setSubcategories(
          (subcategoryRes.data.subcategories || []).filter(
            (subcategory) => subcategory?.isActive !== false,
          ),
        );
      } catch (err) {
        console.error("Failed to fetch shop filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.toString());
        params.set("sort", sortBy);
        if (categoryParam) params.set("category", categoryParam);
        if (subcategoryParam) params.set("subcategory", subcategoryParam);
        if (brandParam) params.set("brand", brandParam);
        if (selectedWeights.length) params.set("weight", selectedWeights.join(","));
        if (priceMin) params.set("minPrice", priceMin);
        if (priceMax) params.set("maxPrice", priceMax);
        if (searchQuery) params.set("search", searchQuery);
        if (isTrending) params.set("isTrending", isTrending);
        if (isBestSeller) params.set("isBestSeller", isBestSeller);
        if (isFeatured) params.set("isFeatured", isFeatured);
        if (isNew) params.set("isNew", isNew);
        if (isBridal) params.set("isBridal", isBridal);
        if (isOnSale) params.set("isOnSale", isOnSale);
        if (isSeasonal) params.set("isSeasonal", isSeasonal);

        const { data } = await API.get(`/products?${params.toString()}`);
        setProducts(data.data || data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || data.totalProducts || 0);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          "Failed to load products. Please try again.";
        setError(msg);
        toast.error(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // Update URL params helper
  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    // Reset to page 1 when filters change (unless changing page)
    if (!updates.page) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const handleCategoryChange = (slug) => {
    updateParams({
      category: slug === categoryParam ? "" : slug,
      subcategory: "",
    });
  };

  const handleSubcategoryChange = (slug) => {
    updateParams({ subcategory: slug === subcategoryParam ? "" : slug });
  };

  const handleBrandChange = (slug) => {
    updateParams({ brand: slug === brandParam ? "" : slug });
  };

  const toggleFilterSection = (section) => {
    setOpenFilterSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleWeightToggle = (weight) => {
    const updated = selectedWeights.includes(weight)
      ? selectedWeights.filter((item) => item !== weight)
      : [...selectedWeights, weight];
    updateParams({ weight: updated.join(",") });
  };

  const handlePriceRange = (min, max) => {
    if (priceMin === String(min) && priceMax === String(max)) {
      updateParams({ priceMin: "", priceMax: "" });
    } else {
      updateParams({ priceMin: String(min), priceMax: String(max) });
    }
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const currentCategory = categories.find((c) => c.slug === categoryParam);
  const currentSubcategory = subcategories.find(
    (s) => s.slug === subcategoryParam,
  );
  const currentBrand = brands.find(
    (brand) => brand.slug === brandParam || brand._id === brandParam,
  );
  const categorySubcategories = currentCategory
    ? subcategories.filter(
        (sub) =>
          (typeof sub.category === "object"
            ? sub.category?._id
            : sub.category) === currentCategory._id,
      )
    : [];
  const hasActiveFilters =
    categoryParam ||
    subcategoryParam ||
    brandParam ||
    selectedWeights.length ||
    priceMin ||
    priceMax ||
    searchQuery ||
    isTrending ||
    isBestSeller ||
    isFeatured ||
    isNew ||
    isBridal ||
    isOnSale ||
    isSeasonal;
  const seoTitle = subcategoryParam
    ? `${currentSubcategory?.name || "Subcategory"} Collection`
    : categoryParam
      ? currentCategory?.metaTitle ||
        `${currentCategory?.name || "Category"} Collection`
      : brandParam
        ? `${formatParamLabel(brandParam)} Collection`
        : searchQuery
        ? `Search Results for ${searchQuery}`
        : isTrending
          ? "Trending Outfits"
          : isBestSeller
            ? "Best Selling Outfits"
            : isNew
              ? "New Arrival Outfits"
            : isOnSale
              ? "Discount Products"
              : isSeasonal
                ? "Seasonal Products"
              : isBridal
                ? "Bridal and Formal Wear"
                : "Shop Premium Outfits";
  const seoDescription =
    categoryParam && currentCategory?.metaDescription
      ? currentCategory.metaDescription
      : `Shop ${seoTitle.toLowerCase()} at Deshi Buy. Browse pure, natural, and seasonal products delivered across Bangladesh.`;

  // --- FILTER SIDEBAR CONTENT ------------------------------
  const filterContent = (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pb-4 border-b border-charcoal/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wider">
              Active Filters
            </h4>
            <button
              onClick={clearAllFilters}
              className="text-oxblood hover:text-oxblood-dark text-xs font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-oxblood/10 text-oxblood rounded-full text-xs font-medium">
                {currentCategory?.name || categoryParam}
                <button
                  onClick={() => handleCategoryChange(categoryParam)}
                  className="hover:text-oxblood-dark"
                ></button>
              </span>
            )}
            {subcategoryParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-oxblood/10 text-oxblood rounded-full text-xs font-medium">
                {currentSubcategory?.name || subcategoryParam}
                <button
                  onClick={() => handleSubcategoryChange(subcategoryParam)}
                  className="hover:text-oxblood-dark"
                ></button>
              </span>
            )}
            {brandParam && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-oxblood/10 text-oxblood rounded-full text-xs font-medium">
                {currentBrand?.name || formatParamLabel(brandParam)}
                <button
                  onClick={() => updateParams({ brand: "" })}
                  className="hover:text-oxblood-dark"
                ></button>
              </span>
            )}
            {selectedWeights.map((weight) => (
              <span
                key={weight}
                className="inline-flex items-center gap-1 px-3 py-1 bg-oxblood/10 text-oxblood rounded-full text-xs font-medium"
              >
                {weight}
                <button
                  onClick={() => handleWeightToggle(weight)}
                  className="hover:text-oxblood-dark"
                ></button>
              </span>
            ))}
            {(priceMin || priceMax) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-oxblood/10 text-oxblood rounded-full text-xs font-medium">
                {priceMax
                  ? `BDT ${Number(priceMin || 0).toLocaleString()} - BDT ${Number(priceMax).toLocaleString()}`
                  : `Above BDT ${Number(priceMin || 0).toLocaleString()}`}
                <button
                  onClick={() => updateParams({ priceMin: "", priceMax: "" })}
                  className="hover:text-oxblood-dark"
                ></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Brands */}
      <div>
        <button
          type="button"
          onClick={() => toggleFilterSection("brands")}
          className="mb-3 flex w-full items-center justify-between text-left font-semibold text-charcoal text-sm uppercase tracking-wider"
          aria-expanded={openFilterSections.brands}
        >
          <span>Brands</span>
          <svg
            className={`h-4 w-4 transition-transform ${openFilterSections.brands ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openFilterSections.brands && (
          <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
            <li>
              <button
                onClick={() => updateParams({ brand: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !brandParam
                    ? "bg-oxblood text-ivory font-medium"
                    : "text-charcoal hover:bg-oxblood/5"
                }`}
              >
                All Brands
              </button>
            </li>
            {brands.map((brand) => (
              <li key={brand._id || brand.slug}>
                <button
                  onClick={() => handleBrandChange(brand.slug || brand._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    brandParam === brand.slug || brandParam === brand._id
                      ? "bg-oxblood text-ivory font-medium"
                      : "text-charcoal hover:bg-oxblood/5"
                  }`}
                >
                  {brand.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Categories */}
      <div>
        <button
          type="button"
          onClick={() => toggleFilterSection("categories")}
          className="mb-3 flex w-full items-center justify-between text-left font-semibold text-charcoal text-sm uppercase tracking-wider"
          aria-expanded={openFilterSections.categories}
        >
          <span>Categories</span>
          <svg
            className={`h-4 w-4 transition-transform ${openFilterSections.categories ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openFilterSections.categories && (
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams({ category: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !categoryParam
                    ? "bg-oxblood text-ivory font-medium"
                    : "text-charcoal hover:bg-oxblood/5"
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id || cat.slug}>
                <button
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    categoryParam === cat.slug
                      ? "bg-oxblood text-ivory font-medium"
                      : "text-charcoal hover:bg-oxblood/5"
                  }`}
                >
                  {cat.name}
                  {cat.productCount !== undefined && (
                    <span className="ml-1 text-xs opacity-60">
                      ({cat.productCount})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openFilterSections.categories && categoryParam && categorySubcategories.length > 0 && (
        <div>
          <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wider mb-3">
            Subcategories
          </h4>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => updateParams({ subcategory: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  !subcategoryParam
                    ? "bg-oxblood text-ivory font-medium"
                    : "text-charcoal hover:bg-oxblood/5"
                }`}
              >
                All {currentCategory?.name || "Subcategories"}
              </button>
            </li>
            {categorySubcategories.map((sub) => (
              <li key={sub._id || sub.slug}>
                <button
                  onClick={() => handleSubcategoryChange(sub.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    subcategoryParam === sub.slug
                      ? "bg-oxblood text-ivory font-medium"
                      : "text-charcoal hover:bg-oxblood/5"
                  }`}
                >
                  {sub.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range, i) => (
            <li key={i}>
              <button
                onClick={() => handlePriceRange(range.min, range.max)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  priceMin === String(range.min) &&
                  priceMax === String(range.max)
                    ? "bg-oxblood text-ivory font-medium"
                    : "text-charcoal hover:bg-oxblood/5"
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Weight */}
      <div>
        <h4 className="font-semibold text-charcoal text-sm uppercase tracking-wider mb-3">
          Weight
        </h4>
        <div className="flex flex-wrap gap-2">
          {WEIGHTS.map((weight) => (
            <button
              key={weight}
              onClick={() => handleWeightToggle(weight)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-all ${
                selectedWeights.includes(weight)
                  ? "bg-oxblood text-ivory border-oxblood"
                  : "bg-white text-charcoal border-charcoal/20 hover:border-oxblood/40"
              }`}
            >
              {weight}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory">
      <SEO title={seoTitle} description={seoDescription} />
      {/* Page Header */}
      <div className="bg-charcoal text-ivory py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-4 opacity-70">
            <Link to="/" className="hover:opacity-100 transition-opacity">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gold">Shop</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
            {subcategoryParam
              ? currentSubcategory?.name || "Shop"
              : categoryParam
                ? currentCategory?.name || "Shop"
                : brandParam
                  ? formatParamLabel(brandParam)
                  : searchQuery
                  ? `Search: "${searchQuery}"`
                  : isTrending
                    ? "Trending Now"
                    : isBestSeller
                      ? "Best Sellers"
                      : isFeatured
                        ? "Featured Products"
                        : isNew
                          ? "New Arrivals"
                          : isOnSale
                            ? "Discount Products"
                            : isSeasonal
                              ? "Seasonal Products"
                          : isBridal
                            ? "Bridal Collection"
                            : "All Products"}
          </h1>
          {!loading && !error && (
            <p className="mt-2 text-ivory/60">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar: Sort + Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-charcoal/20 rounded-lg text-sm font-medium text-charcoal hover:border-oxblood/40 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 flex items-center justify-center bg-oxblood text-ivory rounded-full text-xs">
                {(categoryParam ? 1 : 0) +
                  (subcategoryParam ? 1 : 0) +
                  (brandParam ? 1 : 0) +
                  selectedWeights.length +
                  (priceMin || priceMax ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <label className="text-sm text-charcoal/60 hidden sm:inline">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="px-3 py-2 bg-white border border-charcoal/20 rounded-lg text-sm text-charcoal focus:outline-none focus:border-oxblood transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl border border-charcoal/10 p-5">
              {filterContent}
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <LoadingSpinner size="lg" text="Loading products..." />
            ) : error ? (
              <ErrorDisplay
                message={error}
                onRetry={() => {
                  setLoading(true);
                  setError(null);
                  // The useEffect will re-run because searchParams hasn't changed,
                  // so force a re-fetch by triggering a state update
                  const newParams = new URLSearchParams(searchParams);
                  setSearchParams(newParams);
                }}
              />
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-charcoal/5 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-charcoal/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                {hasActiveFilters ? (
                  <>
                    <h3 className="text-xl font-semibold text-charcoal mb-2">
                      No products match your criteria
                    </h3>
                    <p className="text-charcoal/50 mb-6">
                      Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2.5 bg-oxblood text-ivory rounded-lg font-medium hover:bg-oxblood-dark transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </>
                ) : (
                  <EmptyState
                    title="No products available"
                    description="There are no products to display right now. Check back later or browse other categories."
                    actionLabel="Refresh"
                    onAction={() => {
                      setLoading(true);
                      setError(null);
                      const newParams = new URLSearchParams(searchParams);
                      setSearchParams(newParams);
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        updateParams({ page: Math.max(1, currentPage - 1) })
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-charcoal/20 text-sm font-medium text-charcoal hover:border-oxblood hover:text-oxblood disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => updateParams({ page })}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                              page === currentPage
                                ? "bg-oxblood text-ivory"
                                : "border border-charcoal/20 text-charcoal hover:border-oxblood hover:text-oxblood"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-charcoal/30 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() =>
                        updateParams({
                          page: Math.min(totalPages, currentPage + 1),
                        })
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-charcoal/20 text-sm font-medium text-charcoal hover:border-oxblood hover:text-oxblood disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-charcoal/10 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-charcoal">Filters</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-charcoal/5 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-charcoal"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
            <div className="sticky bottom-0 bg-white border-t border-charcoal/10 p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-oxblood text-ivory rounded-lg font-medium hover:bg-oxblood-dark transition-colors"
              >
                Show Results ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
