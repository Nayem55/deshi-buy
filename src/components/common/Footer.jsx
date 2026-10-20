import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import { optimizedImageUrl } from '../../utils/imageUrl';

function SocialIcon({ name }) {
  const common = { className: 'h-4 w-4', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true };

  if (name === 'Facebook') {
    return <svg {...common}><path d="M13.6 21v-7h2.35l.35-2.73H13.6V9.53c0-.79.22-1.33 1.36-1.33h1.45V5.76c-.25-.03-1.1-.11-2.09-.11-2.07 0-3.49 1.27-3.49 3.59v2.03H8.5V14h2.33v7h2.77Z" /></svg>;
  }

  if (name === 'Instagram') {
    return <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="4.25" /><circle cx="12" cy="12" r="4" /><circle cx="17.35" cy="6.7" r=".85" fill="currentColor" stroke="none" /></svg>;
  }

  if (name === 'TikTok') {
    return <svg {...common}><path d="M16.76 5.03c.52 1.25 1.5 2.24 2.75 2.77v2.6a7.1 7.1 0 0 1-2.73-.74v5.42a5.35 5.35 0 1 1-5.35-5.35c.23 0 .46.02.68.05v2.63a2.74 2.74 0 1 0 1.92 2.61V3.5h2.73Z" /></svg>;
  }

  return <svg {...common} viewBox="0 0 24 24"><path d="M21.55 7.12a3.1 3.1 0 0 0-2.18-2.2C17.45 4.4 12 4.4 12 4.4s-5.45 0-7.37.52a3.1 3.1 0 0 0-2.18 2.2C1.93 9.05 1.93 12 1.93 12s0 2.95.52 4.88a3.1 3.1 0 0 0 2.18 2.2c1.92.52 7.37.52 7.37.52s5.45 0 7.37-.52a3.1 3.1 0 0 0 2.18-2.2c.52-1.93.52-4.88.52-4.88s0-2.95-.52-4.88ZM10.2 15.1V8.9l5.15 3.1-5.15 3.1Z" /></svg>;
}

function ContactIcon({ type }) {
  const common = { className: 'mt-0.5 h-4 w-4 shrink-0 text-gold', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', 'aria-hidden': true };
  if (type === 'phone') return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M4.8 3.8 7.6 3l1.7 4.3-2.1 1.6a14.1 14.1 0 0 0 7.9 7.9l1.6-2.1L21 16.4l-.8 2.8a2.4 2.4 0 0 1-2.7 1.7C9.9 19.7 4.3 14.1 3.1 6.5A2.4 2.4 0 0 1 4.8 3.8Z" /></svg>;
  if (type === 'email') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" /></svg>;
  return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M20 10c0 5.3-8 10.2-8 10.2S4 15.3 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.7" /></svg>;
}

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

  const socialLinks = {
    ...settings.social,
    yt: settings.social?.yt || 'https://www.youtube.com/@DeshiBuy',
  };
  const footerEmails = [settings.contact?.email, 'support24@deshibuy.com'].filter(Boolean);
  const footerPhones = [settings.contact?.phone, '+8801844688591'].filter(Boolean);

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
                { key: 'fb', label: 'Facebook' },
                { key: 'ig', label: 'Instagram' },
                { key: 'tiktok', label: 'TikTok' },
                { key: 'yt', label: 'YouTube' },
              ].filter((item) => socialLinks[item.key]).map((item) => (
                <a key={item.key} href={socialLinks[item.key]} aria-label={item.label} title={item.label} target="_blank" rel="noreferrer" className="w-9 h-9 border border-[#4A4038] rounded-full flex items-center justify-center text-[#E6DDD3] hover:border-gold hover:bg-gold hover:text-charcoal transition-colors"><SocialIcon name={item.label} /></a>
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
              {footerEmails.map((email) => <li key={email} className="flex items-start gap-2"><ContactIcon type="email" /><a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a></li>)}
              {footerPhones.map((phone) => <li key={phone} className="flex items-start gap-2"><ContactIcon type="phone" /><span>{phone}</span></li>)}
              {settings.contact?.address && <li className="flex items-start gap-2"><ContactIcon type="address" /><span>{settings.contact.address}</span></li>}
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
