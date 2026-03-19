import { useState } from 'react';
import { BookOpen, MapPin, KeySquare, CarFront, Baby, Bell } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: "Don't Lose Your Best Friend: Why GPS QR Pet Tags Are Better Than Microchips",
    date: "March 15, 2026",
    readTime: "3 min read",
    icon: <Baby size={24} className="text-amber-500" />,
    color: "bg-amber-50 border-amber-200",
    content: `If your pet wanders off, you want them back fast. Microchips are essential, but they rely on a kind stranger catching your dog and driving them to a vet with a specialized scanner during business hours. That takes time—time you spend worrying.

**Enter the TagLink QR Pet Tag.**

With TagLink, anyone with a smartphone becomes an instant rescuer. 
* **Instant Information:** One scan opens a secure page showing your pet’s name, essential medical notes (like severe allergies or daily medications), and the vet's contact number.
* **Instant GPS Routing:** With our "Lost Mode," the finder sees a glowing red banner prompting them to share their precise GPS location with you at the tap of a button.
* **Instant Communication:** No need to give out your personal number explicitly. A single button lets the finder launch a WhatsApp chat or phone call directly to you.

It's the ultimate peace of mind hanging right on their collar. Create yours digitally for free, or order our premium laser-engraved steel tags today!`
  },
  {
    id: 2,
    title: "Upgrade Your Airbnb: Redefining the Check-In Experience",
    date: "March 18, 2026",
    readTime: "4 min read",
    icon: <KeySquare size={24} className="text-blue-500" />,
    color: "bg-blue-50 border-blue-200",
    content: `Running an Airbnb, homestay, or rental property? Ditch the messy printed binders and complicated welcome PDFs. All you need is a single TagLink QR House Rental Tag placed on your kitchen counter or entryway.

When your guests scan the custom tag, they instantly see:
* **Stunning Photo Galleries:** Beautifully formatted property images.
* **Real-time Status:** A clear "Available" or "Booked" indicator.
* **The Essentials:** Wi-Fi networks and passwords right at their fingertips.
* **Amenities:** A master list of everything your property offers (pool codes, parking bay numbers, gym locations, etc.).
* **Instant Host Contact:** A WhatsApp button that instantly connects them with you or your property manager in case of emergencies.

It looks professional, modern, and saves you hours of answering the same "What's the Wi-Fi password?" texts. Welcome to the future of hosting!`
  },
  {
    id: 3,
    title: "The Digital Doorbell: Unmatched Privacy and Convenience",
    date: "March 19, 2026",
    readTime: "2 min read",
    icon: <Bell size={24} className="text-violet-500" />,
    color: "bg-violet-50 border-violet-200",
    content: `We've all been there: The baby is finally asleep, or you’re in the middle of an important Zoom meeting, and *DING DONG!* The delivery driver rings the loud, obnoxious doorbell.

Enter the **TagLink Doorbell Tag**. It’s incredibly simple, yet completely revolutionizes how you receive visitors.

Place the tag near your door instead of (or over) your old doorbell. When a visitor or delivery driver scans it, they will see your specific instructions: *"Please leave packages on the doormat. DO NOT KNOCK! Baby is sleeping."*

Even better, they can hit a button that sends a silent "Ding Dong!" digital notification straight to your phone. It preserves your peace, keeps your privacy protected, and ensures your packages are left exactly where they need to be.`
  },
  {
    id: 4,
    title: "Smart Parking Tags: The Ultimate Solution to Car Troubles",
    date: "March 19, 2026",
    readTime: "3 min read",
    icon: <CarFront size={24} className="text-emerald-500" />,
    color: "bg-emerald-50 border-emerald-200",
    content: `Navigating shared parking lots, tight apartment bays, or accidentally blocking someone in can be a headache. Often, the only way someone can contact you is by honking aggressively, hoping you hear them.

The **TagLink Parking Tag** fixes this permanently. Placed visibly on your dashboard or windshield, it allows anyone to instantly reach you anonymously via WhatsApp or Phone Call, without exposing your personal number to the open world. 

Is your car blocking someone in? Did you accidentally leave your headlights on or a window cracked during a storm? A quick scan brings up 1-tap "Quick Alerts", allowing good Samaritans to notify you instantly. Plus, the page displays a beautiful hero image of your vehicle so people know they have the right owner. Be a polite Parker—get a TagLink Vehicle Tag.`
  },
  {
    id: 5,
    title: "Travel Smarter: Securing Kids and Luggage on Vacation",
    date: "March 20, 2026",
    readTime: "4 min read",
    icon: <MapPin size={24} className="text-pink-500" />,
    color: "bg-pink-50 border-pink-200",
    content: `Traveling is stressful. Whether you’re trying to keep an eye on your energetic kids at a crowded theme park, or trying to ensure your expensive luggage doesn't end up on the wrong baggage carousel, you need a backup plan.

**TagLink's Child and Luggage Tags are the ultimate travel companions.**

* **For Kids:** Securely attach a PVC tag to their backpack or belt loop. If they wander off, an adult can scan it to instantly bring up their emergency contact info, vital medication needs, and a button to WhatsApp you immediately. 
* **For Luggage:** Traditional paper tags get ripped off, and writing your phone number in marker is a massive privacy risk. TagLink keeps your information secure behind a QR code. If your bag is lost, "Lost Mode" lets baggage handlers ping you their precise GPS location.

Travel isn't about worrying. It's about making memories. Let TagLink handle the security, so you can enjoy the trip.`
  }
];

export default function Blog() {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          The TagLink <span className="text-violet-600">Blog</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Discover how digital QR tags are revolutionizing safety, convenience, and privacy for families, hosts, and travelers.
        </p>
      </div>

      {/* Blog Posts Feed */}
      <div className="space-y-8">
        {BLOG_POSTS.map((post) => {
          const isExpanded = expandedId === post.id;

          return (
            <article 
              key={post.id} 
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div 
                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row gap-6 relative"
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
              >
                {/* Icon Column */}
                <div className={`w-16 h-16 shrink-0 rounded-2xl border flex items-center justify-center ${post.color}`}>
                  {post.icon}
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {post.readTime}
                    </span>
                    <span>&bull;</span>
                    <span>{post.date}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                    {post.title}
                  </h2>

                  <p className="text-slate-500 text-lg leading-relaxed line-clamp-3">
                    {post.content.split('\\n\\n')[0]}
                  </p>

                  <button 
                    className="mt-6 text-violet-600 font-bold hover:text-violet-700 hover:underline transition-all flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : post.id);
                    }}
                  >
                    {isExpanded ? 'Collapse Article' : 'Read Full Article'}
                  </button>
                </div>
              </div>

              {/* Expanded Content View */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden bg-slate-50 border-t border-slate-100 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 md:p-10 prose prose-slate prose-lg max-w-none prose-p:text-slate-600 prose-headings:text-slate-900 prose-li:text-slate-600 prose-strong:text-slate-800">
                  {post.content.split('\\n').map((line, idx) => {
                    if (line.trim().startsWith('* **')) {
                      // Custom bold parsing for bullet points
                      const parts = line.replace('* **', '').split('**');
                      return (
                        <li key={idx} className="ml-6 list-disc mb-2">
                          <strong>{parts[0]}</strong>{parts.slice(1).join('**')}
                        </li>
                      );
                    } else if (line.trim().startsWith('**')) {
                       const strongContent = line.replace(/\\*\\*/g, '');
                       return <p key={idx} className="font-bold text-slate-800 text-xl mt-6">{strongContent}</p>;
                    } else if (line.trim() !== '') {
                      return <p key={idx} className="mb-4">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
