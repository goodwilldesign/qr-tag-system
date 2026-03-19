import { useState, useEffect } from 'react';
import { BookOpen, MapPin, KeySquare, CarFront, Baby, Bell, ArrowLeft, Share2 } from 'lucide-react';

export const BLOG_POSTS = [
  {
    id: 1,
    title: "Don't Lose Your Best Friend: Why GPS QR Pet Tags Are Better Than Microchips",
    date: "March 15, 2026",
    datePublishedIso: "2026-03-15T08:00:00+00:00",
    readTime: "3 min read",
    icon: <Baby size={22} className="text-amber-500" />,
    color: "bg-amber-100 text-amber-700",
    featuredImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200",
    excerpt: "If your pet wanders off, you want them back fast. Learn why QR tags are completely revolutionizing pet safety and offering immediate peace of mind.",
    content: (
      <>
        <p>If your pet wanders off, you want them back fast. Microchips are essential, but they rely on a kind stranger catching your dog and driving them to a vet with a specialized scanner during business hours. That takes time—time you spend worrying.</p>
        <p className="font-bold text-slate-900 mt-8 text-2xl">Enter the TagLink QR Pet Tag.</p>
        <p>With TagLink, anyone with a smartphone becomes an instant rescuer.</p>
        <ul className="list-disc ml-6 mt-6 space-y-4">
          <li><strong>Instant Information:</strong> One scan opens a secure page showing your pet’s name, essential medical notes (like severe allergies or daily medications), and the vet's contact number.</li>
          <li><strong>Instant GPS Routing:</strong> With our "Lost Mode," the finder sees a glowing red banner prompting them to share their precise GPS location with you at the tap of a button.</li>
          <li><strong>Instant Communication:</strong> No need to give out your personal number explicitly. A single button lets the finder launch a WhatsApp chat or phone call directly to you.</li>
        </ul>
        <p className="mt-8">It's the ultimate peace of mind hanging right on their collar. Create yours digitally for free, or order our premium laser-engraved steel tags today!</p>
      </>
    )
  },
  {
    id: 2,
    title: "Upgrade Your Airbnb: Redefining the Check-In Experience",
    date: "March 18, 2026",
    datePublishedIso: "2026-03-18T10:00:00+00:00",
    readTime: "4 min read",
    icon: <KeySquare size={22} className="text-blue-500" />,
    color: "bg-blue-100 text-blue-700",
    featuredImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Ditch the messy printed binders and complicated welcome PDFs. Discover how scanning a single stylish QR code gives your guests a 5-star digital arrival.",
    content: (
      <>
        <p>Running an Airbnb, homestay, or rental property? Ditch the messy printed binders and complicated welcome PDFs. All you need is a single TagLink QR House Rental Tag placed on your kitchen counter or entryway.</p>
        <p className="font-bold text-slate-900 mt-8 text-2xl">When your guests scan the custom tag, they instantly see:</p>
        <ul className="list-disc ml-6 mt-6 space-y-4">
          <li><strong>Stunning Photo Galleries:</strong> Beautifully formatted property images.</li>
          <li><strong>Real-time Status:</strong> A clear "Available" or "Booked" indicator to prevent awkward overlaps on check-in day.</li>
          <li><strong>The Essentials:</strong> Wi-Fi networks and fast-copy passwords right at their fingertips.</li>
          <li><strong>Amenities Library:</strong> A master list of everything your property offers (pool access codes, exact parking bay numbers, gym locations, out-of-bounds areas).</li>
          <li><strong>Instant Host Contact:</strong> A WhatsApp button that instantly connects them with you or your property manager effortlessly in case of emergencies, without searching for emails.</li>
        </ul>
        <p className="mt-8">It looks professional, incredibly modern, and saves you countless hours of answering the exact same "What's the Wi-Fi password?" texts. Welcome to the future of hosting!</p>
      </>
    )
  },
  {
    id: 3,
    title: "The Digital Doorbell: Unmatched Privacy and Convenience",
    date: "March 19, 2026",
    datePublishedIso: "2026-03-19T14:30:00+00:00",
    readTime: "2 min read",
    icon: <Bell size={22} className="text-violet-500" />,
    color: "bg-violet-100 text-violet-700",
    featuredImage: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Quiet down your home and get discrete notifications exactly when someone is outside, giving you total peace while a baby is sleeping.",
    content: (
      <>
        <p>We've all been there: The baby is finally asleep, or you’re in the middle of a vitally important Zoom meeting, and <em>DING DONG!</em> The delivery driver rings that loud, obnoxious analog doorbell at the worst possible time.</p>
        <p className="font-bold text-slate-900 mt-8 text-2xl">Enter the TagLink Doorbell Tag.</p>
        <p className="mt-4">It’s incredibly simple, yet completely revolutionizes how you receive your daily visitors.</p>
        <p className="mt-4">Place the tag securely near your door instead of (or over) your old doorbell. When a visitor, neighbor, or frequent delivery driver scans it with any smartphone camera, they will instantly see your specific real-time instructions: <em>"Please leave packages on the doormat. DO NOT KNOCK! Baby is sleeping."</em></p>
        <p className="mt-4">Even better, they can hit a prominent button that securely sends a silent "Ding Dong!" digital notification straight to your own phone screen. It preserves your hard-earned peace, reliably keeps your family privacy protected, and ensures your packages are safely left exactly where they need to be.</p>
      </>
    )
  },
  {
    id: 4,
    title: "Smart Parking Tags: The Ultimate Solution to Car Troubles",
    date: "March 19, 2026",
    datePublishedIso: "2026-03-19T18:00:00+00:00",
    readTime: "3 min read",
    icon: <CarFront size={22} className="text-emerald-500" />,
    color: "bg-emerald-100 text-emerald-700",
    featuredImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Navigating shared parking lots or accidentally blocking someone in? Let people easily notify you without putting your phone number on display.",
    content: (
      <>
        <p>Navigating shared commercial parking lots, exceptionally tight apartment building bays, or accidentally double-parking slightly blocking someone in can be a major daily headache. Often, the only way someone can urgently contact you is by honking aggressively and continuously, simply hoping you hear them eventually.</p>
        <p className="font-bold text-slate-900 mt-8 text-2xl">The TagLink Parking Tag fixes this permanently.</p>
        <p className="mt-4">Placed visibly and neatly on your vehicle dashboard or corner windshield, it instantly allows absolutely anyone to reach you anonymously via a secure WhatsApp conversation or a masked Phone Call, without ever explicitly exposing your sensitive personal cell number to the open world.</p>
        <ul className="list-disc ml-6 mt-6 space-y-4">
          <li><strong>Emergency Situations:</strong> Is your car blocking someone in?</li>
          <li><strong>Good Samaritan Alerts:</strong> Did you accidentally leave your headlights beaming on or a side window deeply cracked during an approaching rainstorm?</li>
          <li><strong>Clear Identification:</strong> A quick scan brings up 1-tap "Quick Alerts", allowing passing good Samaritans to proactively notify you instantly. Plus, the page displays a beautiful custom hero image of your vehicle so people undeniably know they have scanned the right vehicle owner.</li>
        </ul>
        <p className="mt-8 font-bold text-xl text-slate-800">Be a significantly more polite Parker—get a protective TagLink Vehicle Tag today.</p>
      </>
    )
  },
  {
    id: 5,
    title: "Travel Smarter: Securing Kids and Luggage on Vacation",
    date: "March 20, 2026",
    datePublishedIso: "2026-03-20T09:00:00+00:00",
    readTime: "4 min read",
    icon: <MapPin size={22} className="text-pink-500" />,
    color: "bg-pink-100 text-pink-700",
    featuredImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Whether tracking energetic kids at theme parks or expensive bags on carousels, secure them both digitally with TagLink.",
    content: (
      <>
        <p>Traveling is inherently stressful at baseline. Whether you’re desperately trying to actively keep an eye on your highly energetic small kids at a densely crowded theme park, or anxiously trying to ensure your expensive checked luggage ultimately doesn't end up circling on the definitively wrong baggage carousel, you absolutely need a modern backup plan.</p>
        <p className="font-bold text-slate-900 mt-8 text-2xl">TagLink's Child and Luggage Tags are the ultimate travel companions.</p>
        <ul className="list-disc ml-6 mt-6 space-y-5">
          <li><strong>For Kids:</strong> Securely attach a highly durable PVC tag tightly to their backpack straps, shoelaces, or belt loop. If they ever unfortunately wander off to explore, any nearby adult can quickly scan it to instantly bring up their designated emergency contact info, vital allergy/medication needs, and an impossibly easy button to WhatsApp you immediately right there on the spot.</li>
          <li><strong>For Luggage:</strong> Flimsy traditional paper airline tags easily get randomly ripped off on conveyor belts, and writing your exact home address/phone number in sharpie marker is a massive glaring privacy risk while sitting in airports. TagLink expertly keeps your private information totally secure behind a sophisticated dynamic QR code layer. If your beloved bag is tragically lost in transit by the airline, engaging "Lost Mode" securely lets helpful baggage handlers immediately ping you their exact precise GPS location coordinate.</li>
        </ul>
        <p className="mt-8 text-xl text-slate-800 font-medium">Travel objectively isn't supposed to be strictly about frantically worrying over bags and kids. It's really about making beautiful lasting memories. Let TagLink expertly handle the hard security logic, so you can thoroughly enjoy the relaxing trip.</p>
      </>
    )
  }
];

export default function Blog() {
  const [activePostId, setActivePostId] = useState(null);

  // SEO Injection
  useEffect(() => {
    document.title = activePostId 
      ? `${BLOG_POSTS.find(p => p.id === activePostId)?.title} - TagLink Blog` 
      : "TagLink Blog - Modern QR Safety Insights";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = activePostId 
      ? BLOG_POSTS.find(p => p.id === activePostId)?.excerpt 
      : "Read the latest guides and feature updates about securing your family, property, and luggage using TagLink's smart QR ecosystem.";

    const scriptId = 'blog-schema-jsonld';
    let schemaScript = document.getElementById(scriptId);
    
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = activePostId ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": BLOG_POSTS.find(p => p.id === activePostId)?.title,
      "image": BLOG_POSTS.find(p => p.id === activePostId)?.featuredImage,
      "datePublished": BLOG_POSTS.find(p => p.id === activePostId)?.datePublishedIso,
      "description": BLOG_POSTS.find(p => p.id === activePostId)?.excerpt,
      "author": { "@type": "Organization", "name": "TagLink" }
    } : {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "TagLink Knowledge Base",
      "blogPost": BLOG_POSTS.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.featuredImage,
        "datePublished": post.datePublishedIso
      }))
    };

    schemaScript.textContent = JSON.stringify(schemaData);
    window.scrollTo(0, 0);

    return () => { if (schemaScript) schemaScript.remove(); };
  }, [activePostId]);

  const activePost = activePostId ? BLOG_POSTS.find(p => p.id === activePostId) : null;
  const relatedPosts = activePostId ? BLOG_POSTS.filter(p => p.id !== activePostId).slice(0, 3) : [];

  if (activePost) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        {/* Back Navigation */}
        <button 
          onClick={() => setActivePostId(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 font-semibold transition-colors mt-8"
        >
          <ArrowLeft size={20} /> Back to all articles
        </button>

        {/* Article Header */}
        <div className="space-y-6 text-center">
          <div className="flex justify-center items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${activePost.color}`}>
              {activePost.icon} {activePost.readTime}
            </span>
            <span>&bull;</span>
            <span>{activePost.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {activePost.title}
          </h1>
        </div>

        {/* Massive Hero Image */}
        <div className="w-full h-80 md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
          <img 
            src={activePost.featuredImage} 
            alt={activePost.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-slate prose-lg md:prose-xl max-w-3xl mx-auto prose-p:text-slate-600 prose-li:text-slate-600">
          {activePost.content}
        </div>

        {/* Social Share / Break */}
        <div className="max-w-3xl mx-auto border-t border-b border-slate-100 py-8 flex justify-between items-center">
          <p className="font-bold text-slate-900">Found this helpful?</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors">
            <Share2 size={18} /> Share Article
          </button>
        </div>

        {/* Related Posts Grid */}
        <div className="max-w-4xl mx-auto pt-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Read next</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => setActivePostId(post.id)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col"
              >
                <div className="h-40 overflow-hidden">
                  <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-violet-600 mb-2 uppercase tracking-widest">{post.readTime}</div>
                  <h4 className="font-bold text-slate-900 leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Grid / Main View
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">
      {/* Header Section */}
      <div className="text-center space-y-4 py-12 md:py-20 bg-gradient-to-b from-violet-50/50 to-transparent rounded-[3rem] mt-6">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          The TagLink <span className="text-violet-600">Blog</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto px-4">
          Discover how digital QR tags are completely revolutionizing safety, convenience, and privacy for families, hosts, and travelers.
        </p>
      </div>

      {/* Grid Posts Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-0">
        {BLOG_POSTS.map((post) => (
          <article 
            key={post.id} 
            onClick={() => setActivePostId(post.id)}
            className="flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
          >
            {/* Image Banner */}
            <div className="w-full h-56 relative overflow-hidden bg-slate-100">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm bg-white/95 backdrop-blur-sm ${post.color}`}>
                {post.icon}
                {post.readTime.toUpperCase()}
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                <BookOpen size={14} />
                {post.date}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 leading-tight group-hover:text-violet-600 transition-colors line-clamp-3 mb-4">
                {post.title}
              </h2>

              <p className="text-slate-500 text-lg leading-relaxed mix-blend-multiply line-clamp-3 mb-6 flex-1">
                {post.excerpt}
              </p>

              <div className="mt-auto flex items-center gap-2 font-bold text-violet-600 group-hover:translate-x-1 transition-transform">
                Read Article &rarr;
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
