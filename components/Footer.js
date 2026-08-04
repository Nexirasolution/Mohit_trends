import Link from 'next/link';
import { Instagram, MessageCircle, MapPin } from 'lucide-react';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({}).select('name slug').lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '919994333728';
  const categories = await getCategories();

  return (
    <footer className="mt-12" style={{ background: '#6B1212' }}>

      {/* Gold top border */}
      <div style={{ borderTop: '3px solid #C9A84C' }} />

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* Brand column */}
        <div>
          <h3
            className="font-bold mb-0.5 leading-tight"
            style={{ fontSize: 22, color: '#FFE08A', fontFamily: 'serif', letterSpacing: '0.5px' }}
          >
           Mohith 
          </h3>
          <p
            className="font-semibold mb-3"
            style={{ fontSize: 10, color: '#C9A84C', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            Trends
          </p>

          {/* Gold rule */}
          <div className="mb-3 rounded" style={{ width: 36, height: 1.5, background: '#C9A84C' }} />

          <p className="flex items-start gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: '#C9A84C' }} />
            Thirupathi
          </p>

          <span
            className="inline-block mt-2.5 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(201,168,76,0.18)',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#C9A84C',
            }}
          >
            ✦ Online Sales Only
          </span>
        </div>

        {/* Shop links */}
        <div>
          <h4
            className="font-extrabold mb-3 flex items-center gap-2"
            style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '1.5px', textTransform: 'uppercase' }}
          >
            Shop
            <span className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.3)' }} />
          </h4>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-1.5 text-[12.5px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.78)' }}
                >
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: 14 }}>›</span>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4
            className="font-extrabold mb-3 flex items-center gap-2"
            style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '1.5px', textTransform: 'uppercase' }}
          >
            Connect
            <span className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.3)' }} />
          </h4>

          <div className="flex gap-2 mb-3">
            {[
              { href: 'https://instagram.com/mohittrends', label: 'Instagram', Icon: Instagram },
              { href: `https://wa.me/${whatsapp}`, label: 'WhatsApp', Icon: MessageCircle },
            ].map(({ href, label, Icon }) => (
              
               <a key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 36, height: 36,
                  background: 'rgba(201,168,76,0.15)',
                  border: '1.5px solid rgba(201,168,76,0.4)',
                  color: '#C9A84C',
                }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          <div className="text-xs space-y-1" style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.7 }}>
            <p><span style={{ color: '#FFE08A', fontWeight: 700 }}>WhatsApp</span><br />
              +91 93982 81672<br />+91 93982 81672</p>
            <p className="mt-2"><span style={{ color: '#FFE08A', fontWeight: 700 }}>Email</span><br />
              mohithtrends@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(201,168,76,0.25)', background: '#5a1010' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            © {new Date().getFullYear()} Mohith Trends. All rights reserved.
          </p>
          
           <a href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Designed and Developed by
            <span
              className="font-extrabold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: '#C9A84C', color: '#3a1a00' }}
            >
              Nexira Solution
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}