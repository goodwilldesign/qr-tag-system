import { useState, useEffect } from 'react';
import { BookOpen, MapPin, KeySquare, CarFront, Baby, Bell, ChevronDown, ChevronUp } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Don't Lose Your Best Friend: Why GPS QR Pet Tags Are Better Than Microchips",
    date: "March 15, 2026",
    datePublishedIso: "2026-03-15T08:00:00+00:00",
    readTime: "3 min read",
    icon: <Baby size={22} className="text-amber-500" />,
    color: "bg-amber-50 border-amber-200 text-amber-600",
    featuredImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1200",
    excerpt: "If your pet wanders off, you want them back fast. Learn why QR tags are completely revolutionizing pet safety and offering immediate peace of mind.",
    content: (
      <>
        <p>If your pet wanders off, you want them back fast. Microchips are essential, but they rely on a kind stranger catching your dog and driving them to a vet with a specialized scanner during business hours. That takes time—time you spend worrying.</p>
        <p className="font-bold text-slate-900 mt-6 text-xl">Enter the TagLink QR Pet Tag.</p>
        <p>With TagLink, anyone with a smartphone becomes an instant rescuer.</p>
        <ul className="list-disc ml-6 mt-4 space-y-3">
          <li><strong>Instant Information:</strong> One scan opens a secure page showing your pet’s name, essential medical notes (like severe allergies or daily medications), and the vet's contact number.</li>
          <li><strong>Instant GPS Routing:</strong> With our "Lost Mode," the finder sees a glowing red banner prompting them to share their precise GPS location with you at the tap of a button.</li>
          <li><strong>Instant Communication:</strong> No need to give out your personal number explicitly. A single button lets the finder launch a WhatsApp chat or phone call directly to you.</li>
        </ul>
        <p className="mt-6">It's the ultimate peace of mind hanging right on their collar. Create yours digitally for free, or order our premium laser-engraved steel tags today!</p>
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
    color: "bg-blue-50 border-blue-200 text-blue-600",
    featuredImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Ditch the messy printed binders and complicated welcome PDFs. Discover how scanning a single stylish QR code gives your guests a 5-star digital arrival.",
    content: (
      <>
        <p>Running an Airbnb, homestay, or rental property? Ditch the messy printed binders and complicated welcome PDFs. All you need is a single TagLink QR House Rental Tag placed on your kitchen counter or entryway.</p>
        <p className="font-bold text-slate-900 mt-6 text-xl">When your guests scan the custom tag, they instantly see:</p>
        <ul className="list-disc ml-6 mt-4 space-y-3">
          <li><strong>Stunning Photo Galleries:</strong> Beautifully formatted property images.</li>
          <li><strong>Real-time Status:</strong> A clear "Available" or "Booked" indicator to prevent awkward overlaps on check-in day.</li>
          <li><strong>The Essentials:</strong> Wi-Fi networks and fast-copy passwords right at their fingertips.</li>
          <li><strong>Amenities Library:</strong> A master list of everything your property offers (pool access codes, exact parking bay numbers, gym locations, out-of-bounds areas).</li>
          <li><strong>Instant Host Contact:</strong> A WhatsApp button that instantly connects them with you or your property manager effortlessly in case of emergencies, without searching for emails.</li>
        </ul>
        <p className="mt-6">It looks professional, incredibly modern, and saves you countless hours of answering the exact same "What's the Wi-Fi password?" texts. Welcome to the future of hosting!</p>
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
    color: "bg-violet-50 border-violet-200 text-violet-600",
    featuredImage: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Quiet down your home and get discrete notifications exactly when someone is outside, giving you total peace while a baby is sleeping.",
    content: (
      <>
        <p>We've all been there: The baby is finally asleep, or you’re in the middle of a vitally important Zoom meeting, and <em>DING DONG!</em> The delivery driver rings that loud, obnoxious analog doorbell at the worst possible time.</p>
        <p className="font-bold text-slate-900 mt-6 text-xl">Enter the TagLink Doorbell Tag.</p>
        <p>It’s incredibly simple, yet completely revolutionizes how you receive your daily visitors.</p>
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
    color: "bg-emerald-50 border-emerald-200 text-emerald-600",
    featuredImage: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Navigating shared parking lots or accidentally blocking someone in? Let people easily notify you without putting your phone number on display.",
    content: (
      <>
        <p>Navigating shared commercial parking lots, exceptionally tight apartment building bays, or accidentally double-parking slightly blocking someone in can be a major daily headache. Often, the only way someone can urgently contact you is by honking aggressively and continuously, simply hoping you hear them eventually.</p>
        <p className="font-bold text-slate-900 mt-6 text-xl">The TagLink Parking Tag fixes this permanently.</p>
        <p>Placed visibly and neatly on your vehicle dashboard or corner windshield, it instantly allows absolutely anyone to reach you anonymously via a secure WhatsApp conversation or a masked Phone Call, without ever explicitly exposing your sensitive personal cell number to the open world.</p>
        <ul className="list-disc ml-6 mt-4 space-y-3">
          <li><strong>Emergency Situations:</strong> Is your car blocking someone in?</li>
          <li><strong>Good Samaritan Alerts:</strong> Did you accidentally leave your headlights beaming on or a side window deeply cracked during an approaching rainstorm?</li>
          <li><strong>Clear Identification:</strong> A quick scan brings up 1-tap "Quick Alerts", allowing passing good Samaritans to proactively notify you instantly. Plus, the page displays a beautiful custom hero image of your vehicle so people undeniably know they have scanned the right vehicle owner.</li>
        </ul>
        <p className="mt-6 font-bold">Be a significantly more polite Parker—get a protective TagLink Vehicle Tag today.</p>
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
    color: "bg-pink-50 border-pink-200 text-pink-600",
    featuredImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200",
    excerpt: "Whether tracking energetic kids at theme parks or expensive bags on carousels, secure them both digitally with TagLink.",
    content: (
      <>
        <p>Traveling is inherently stressful at baseline. Whether you’re desperately trying to actively keep an eye on your highly energetic small kids at a densely crowded theme park, or anxiously trying to ensure your expensive checked luggage ultimately doesn't end up circling on the definitively wrong baggage carousel, you absolutely need a modern backup plan.</p>
        <p className="font-bold text-slate-900 mt-6 text-xl">TagLink's Child and Luggage Tags are the ultimate travel companions.</p>
        <ul className="list-disc ml-6 mt-4 space-y-4">
          <li><strong>For Kids:</strong> Securely attach a highly durable PVC tag tightly to their backpack straps, shoelaces, or belt loop. If they ever unfortunately wander off to explore, any nearby adult can quickly scan it to instantly bring up their designated emergency contact info, vital allergy/medication needs, and an impossibly easy button to WhatsApp you immediately right there on the spot.</li>
          <li><strong>For Luggage:</strong> Flimsy traditional paper airline tags easily get randomly ripped off on conveyor belts, and writing your exact home address/phone number in sharpie marker is a massive glaring privacy risk while sitting in airports. TagLink expertly keeps your private information totally secure behind a sophisticated dynamic QR code layer. If your beloved bag is tragically lost in transit by the airline, engaging "Lost Mode" securely lets helpful baggage handlers immediately ping you their exact precise GPS location coordinate.</li>
        </ul>
        <p className="mt-6 text-lg text-slate-800">Travel objectively isn't supposed to be strictly about frantically worrying over bags and kids. It's really about making beautiful lasting memories. Let TagLink expertly handle the hard security logic, so you can thoroughly enjoy the relaxing trip.</p>
      </>
    )
  }
];

export default function Blog() {
  const [expandedId, setExpandedId] = useState(null);

  // SEO Injection
  useEffect(() => {
    // Basic Meta Tags
    document.title = "TagLink Blog - Modern QR Safety Insights";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Read the latest guides and feature updates about securing your family, property, and luggage using TagLink's smart QR ecosystem.";

    // JSON-LD Schema.org Data
    const scriptId = 'blog-schema-jsonld';
    let schemaScript = document.getElementById(scriptId);
    
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "TagLink Knowledge Base",
      "description": "Guides and tutorials on leveraging QR tags for daily life safety.",
      "url": window.location.href,
      "blogPost": BLOG_POSTS.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.featuredImage,
        "datePublished": post.datePublishedIso,
        "dateModified": post.datePublishedIso,
        "author": {
          "@type": "Organization",
          "name": "TagLink",
          "url": window.location.origin
        },
        "publisher": {
          "@type": "Organization",
          "name": "TagLink",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/logo.png`
          }
        },
        "description": post.excerpt
      }))
    };

    schemaScript.textContent = JSON.stringify(schemaData);

    return () => {
      // Cleanup schema on unmount to avoid duplicates if returning later
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          The TagLink <span className="text-violet-600">Blog</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Discover how digital QR tags are completely revolutionizing safety, convenience, and privacy for families, hosts, and travelers.
        </p>
      </div>

      {/* Blog Posts Feed */}
      <div className="space-y-10">
        {BLOG_POSTS.map((post) => {
          const isExpanded = expandedId === post.id;

          return (
            <article 
              key={post.id} 
              className={`bg-white rounded-[2rem] border overflow-hidden transition-all duration-300 ${isExpanded ? 'border-violet-200 shadow-xl shadow-violet-500/10' : 'border-slate-100 shadow-sm hover:shadow-md'}`}
            >
              {/* Featured Image Banner */}
              <div 
                className="w-full h-48 md:h-64 lg:h-72 bg-slate-100 overflow-hidden cursor-pointer relative group"
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
              >
                <img 
                  src={post.featuredImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity p-6">
                  <span className="text-white font-semibold flex items-center gap-2">
                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    {isExpanded ? 'Hide Article' : 'Read Article'}
                  </span>
                </div>
                
                {/* Floating Tag Category Badge */}
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-sm bg-white/95 backdrop-blur-sm ${post.color}`}>
                  {post.icon}
                  {post.readTime.toUpperCase()}
                </div>
              </div>

              {/* Main Card Content */}
              <div className="p-6 md:p-8 relative bg-white">
                <div 
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {post.date}
                    </span>
                  </div>

                  <h2 className={`text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight transition-colors ${isExpanded && 'text-violet-800'}`}>
                    {post.title}
                  </h2>
                </div>

                {/* Collapsed Preview */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'h-0 opacity-0 overflow-hidden m-0' : 'mt-4 opacity-100'}`}>
                  <p className="text-slate-600 text-lg leading-relaxed mix-blend-multiply">
                    {post.excerpt}
                  </p>
                  <button 
                    className="mt-5 text-violet-600 font-bold hover:text-violet-800 transition-colors flex items-center gap-2 group"
                    onClick={() => setExpandedId(post.id)}
                  >
                    Read Full Article <ChevronDown size={18} className="transition-transform group-hover:translate-y-0.5" />
                  </button>
                </div>

                {/* Expanded Content View */}
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[3000px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                  <div className="prose prose-slate prose-lg max-w-none pt-4 border-t border-slate-100">
                    <div className="text-slate-700 leading-loose">
                      {post.content}
                    </div>
                  </div>
                  
                  {/* Footer Collapse Button */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      className="text-slate-500 font-bold hover:text-slate-800 transition-colors flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl"
                      onClick={() => setExpandedId(null)}
                    >
                      <ChevronUp size={18} /> Collapse Article
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
