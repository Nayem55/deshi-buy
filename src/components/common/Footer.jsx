import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { optimizedImageUrl } from '../../utils/imageUrl';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [storefrontAvailable, setStorefrontAvailable] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/settings'),
      API.get('/categories').catch(() => ({ data: { categories: [] } })),
    ])
      .then(([settingsRes, categoriesRes]) => {
        setSettings(settingsRes.data?.settings || {});
        setStorefrontAvailable(true);
        setCategories(
          (categoriesRes.data?.categories || categoriesRes.data?.data || [])
            .filter((cat) => cat?.isActive !== false && cat?.name)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .slice(0, 6)
        );
      })
      .catch(() => setStorefrontAvailable(false));
  }, []);

  const subscribe = async (e) => {
    e.preventDefault();
    try {
      await API.post('/newsletter/subscribe', { email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Subscription failed');
    }
  };

  if (!storefrontAvailable) return null;

  return (
    <>
      <section className="bg-blush text-center py-16 px-4">
        <h2 className="font-serif text-2xl sm:text-3xl mb-3 text-charcoal">দেশি স্বাদের খবর রাখুন</h2>
        <p className="text-sm text-charcoal/60 mb-6 max-w-md mx-auto">নতুন মৌসুমি পণ্য, অফার ও বাগান থেকে আসা তাজা ফলের খবর আগে পান।</p>
        <form onSubmit={subscribe} className="flex max-w-md mx-auto border border-charcoal">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required className="flex-1 border-none bg-transparent px-4 py-3.5 text-sm outline-none" />
          <button type="submit" className="bg-charcoal text-white px-6 py-3.5 text-xs tracking-[0.14em] uppercase hover:bg-oxblood-dark transition-colors">Subscribe</button>
        </form>
      </section>
      <footer className="bg-charcoal text-[#CBBFB3] pt-14">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center" aria-label="Deshi Buy home">
              <img
                src={optimizedImageUrl(settings.logo || '/deshi-buy-logo.png', { width: 320 })}
                alt={settings.companyName || 'Deshi Buy'}
                className="h-11 w-auto max-w-[210px] object-contain"
              />
            </Link>
            {settings.footerAbout && <p className="text-[13px] leading-relaxed mb-5 text-[#B7A99B]">{settings.footerAbout}</p>}
            <div className="flex gap-3.5">
              {[
                { key: 'fb', label: 'Facebook', text: 'f' },
                { key: 'ig', label: 'Instagram', text: 'ig' },
                { key: 'tiktok', label: 'TikTok', text: 'tt' },
                { key: 'yt', label: 'YouTube', text: 'yt' },
              ].filter((item) => settings.social?.[item.key]).map((item) => (
                <a key={item.key} href={settings.social[item.key]} aria-label={item.label} target="_blank" rel="noreferrer" className="w-8 h-8 border border-[#4A4038] rounded-full flex items-center justify-center text-xs hover:border-gold hover:text-gold transition-colors">{item.text}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white text-xs tracking-[0.14em] uppercase mb-5 font-semibold">Customer Care</h4>
            <ul className="space-y-2.5 text-[13px]">
              {['About Us','Shipping & Delivery','Returns & Exchanges','Track Your Order','Terms & Conditions','Privacy Policy'].map(t => (
                <li key={t}><Link to={`/${t.toLowerCase().replace(/ & /g,'-').replace(/ /g,'-')}`} className="hover:text-white transition-colors">{t}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs tracking-[0.14em] uppercase mb-5 font-semibold">Shop</h4>
            <ul className="space-y-2.5 text-[13px]">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category._id || category.slug || category.name}>
                    <Link to={`/shop?category=${category.slug || category._id}`} className="hover:text-white transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : null}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-xs tracking-[0.14em] uppercase mb-5 font-semibold">Get In Touch</h4>
            <ul className="space-y-2.5 text-[13px]">
              {settings.contact?.email && <li>{settings.contact.email}</li>}
              {settings.contact?.phone && <li>{settings.contact.phone}</li>}
              {settings.contact?.address && <li>{settings.contact.address}</li>}
              {settings.contact?.hours && <li>{settings.contact.hours}</li>}
            </ul>
          </div>
        </div>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-8 border-t border-[#3A322C] py-5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#8B7F72] gap-2.5">
          {settings.companyName && <span>(c) {new Date().getFullYear()} {settings.companyName}. All rights reserved.</span>}
        </div>
      </footer>
    </>
  );
}
