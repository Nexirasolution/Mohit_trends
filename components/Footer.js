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
    <footer className="mt-20 bg-black border-t border-[#C6A15B]/30">

      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-12">

        {/* Brand column */}
        <div>
          <h3 className="font-serif text-2xl text-white leading-tight">Mohith Trends</h3>
          <p className="text-[10px] text-[#C6A15B] tracking-[0.3em] uppercase mt-1">
            Style That Speaks You
          </p>

          <div className="w-8 h-px bg-[#C6A15B] my-4" />

          <p className="flex items-start gap-2 text-xs text-white/50 font-light leading-relaxed">
            <MapPin size={13} className="shrink-0 mt-0.5 text-[#C6A15B]" strokeWidth={1.5} />
            No.20, Vasantham Nagar, Thimmavaram, Chengalpet – 603101
          </p>

          <p className="mt-4 text-[10px] tracking-[0.2em] uppercase text-white/35">
            Online Sales Only
          </p>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/40 mb-5">Shop</h4>
          <ul className="space-y-2.5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-[13px] text-white/65 hover:text-[#C6A15B] transition-colors font-light"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/40 mb-5">Connect</h4>

          <div className="flex gap-3 mb-5">
            {[
              { href: 'https://instagram.com/mohithtrends', label: 'Instagram', Icon: Instagram },
              { href: `https://wa.me/${whatsapp}`, label: 'WhatsApp', Icon: MessageCircle },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex items-center justify-center w-8 h-8 border border-white/20 text-white/60 hover:border-[#C6A15B] hover:text-[#C6A15B] transition-colors"
              >
                <Icon size={15} strokeWidth={1.5} />
              </a>
            ))}
          </div>

          <div className="text-xs space-y-3 text-white/50 font-light leading-relaxed">
            <p>
              <span className="text-white/80">WhatsApp</span><br />
              +91 99943 33728<br />+91 91710 70722
            </p>
            <p>
              <span className="text-white/80">Email</span><br />
              mohithtrends@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/35 font-light">
            © {new Date().getFullYear()} Mohith Trends. All rights reserved.
          </p>

          <a
            href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/60 transition-colors font-light"
          >
            Designed and developed by
            <span className="text-[#C6A15B]">Nexira Solution</span>
          </a>
        </div>
      </div>
    </footer>
  );
}