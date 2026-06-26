import React, { useState, useEffect } from 'react';
import { getJournalPostBySlug } from '../../services/journalService.js';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const POSTS_CONTENT = {
  "genesis-camellia-assamica": {
    tag: "Heritage Account",
    date: "May 2026",
    readTime: "8 min read",
    title: "The Genesis of Camellia Assamica: Deep in the Chabua Basin",
    subtitle: "Before Darjeeling. Before Ceylon. There was Chabua.",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1800",
    content: [
      {
        type: "paragraph",
        text: "In 1823, a Scottish explorer named Robert Bruce was guided by Singpho tribal chiefs to a grove of wild tea trees growing natively in the dense riverine forests of Upper Assam. What he discovered would change the global commodities trade forever — yet the story of Chabua, the precise origin point of this discovery, remains largely untold."
      },
      {
        type: "heading",
        text: "The Singpho Custodians"
      },
      {
        type: "paragraph",
        text: "The Singpho people of northeastern Assam had been cultivating and consuming wild Camellia sinensis var. assamica for centuries before European contact. Their preparation — a fermented, oil-cured leaf called 'miang' — bore little resemblance to the steamed Japanese teas or oxidized Chinese varieties that dominated global markets. It was indigenous, unrefined, and profoundly powerful in character."
      },
      {
        type: "paragraph",
        text: "When Bruce met Bessa Gaum, the Singpho chief, he was shown plantations that had existed for generations — not wild stragglers, but cultivated rows with intentional spacing and selective harvesting. The British colonial narrative would later frame this as a 'discovery' of wild trees. The Singpho knew better."
      },
      {
        type: "heading",
        text: "The Soil of Chabua"
      },
      {
        type: "paragraph",
        text: "What makes Chabua's terroir singular is the convergence of geological forces unique to Upper Assam. The region sits atop deep alluvial deposits carried by the Brahmaputra over millennia — a nutrient-rich volcanic loam unlike anything found in Darjeeling's rocky hillside or Ceylon's red laterite. The pH registers between 4.5 and 5.5: precisely ideal for Camellia sinensis to express its fullest enzymatic complexity."
      },
      {
        type: "paragraph",
        text: "Coupled with an annual rainfall exceeding 2,800mm, dense morning river mist that suppresses harsh ultraviolet exposure, and temperatures that rarely exceed 34°C during the second flush, the result is a leaf with exceptional cell density, elevated thearubigin content, and a natural sweetness that requires no artificial enhancement."
      },
      {
        type: "heading",
        text: "1837: The Year It Became Official"
      },
      {
        type: "paragraph",
        text: "It was not until 1837 that Chabua received formal recognition as the foundational estate of India's organized tea industry. The first experimental plantations, overseen by the Assam Tea Company, produced leaves that astonished London tasters at the 1839 public auction. The liquor was described as 'strikingly amber, full in body, clean of astringency, and possessed of a malt sweetness unknown in any imported variety.'"
      },
      {
        type: "paragraph",
        text: "Chabua First Leaf draws its name and identity from this precise moment — not as nostalgia, but as accountability. We are custodians of the original standard. Everything we produce is measured against that 1839 description."
      }
    ],
    relatedSlugs: ["nocturnal-aeration-withering", "singpho-tribe-tea-origins"]
  },
  "thermal-calibration-infusions": {
    tag: "Technical Ritual",
    date: "April 2026",
    readTime: "5 min read",
    title: "The Physics of Thermal Calibration in Wholistic Infusions",
    subtitle: "Temperature is not a preference. It is a variable that determines chemistry.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1800",
    content: [
      {
        type: "paragraph",
        text: "The most common error among otherwise dedicated tea drinkers is the assumption that boiling water is appropriate for all varieties. For Assam Orthodox teas, this is a category error that destroys precisely the compounds that make the leaves worth acquiring."
      },
      {
        type: "heading",
        text: "What Happens at Boiling Point"
      },
      {
        type: "paragraph",
        text: "At 100°C, water carries dissolved oxygen levels near zero. The rapid agitation of a full boil mechanically ruptures delicate cell walls in the leaf before controlled diffusion can occur. The result is a simultaneous extraction of theaflavins (desirable), tannins (manageable in moderation), and degraded volatile aromatic compounds (irreversible loss) — producing a harsh, flat cup that bears no resemblance to the leaf's true profile."
      },
      {
        type: "heading",
        text: "The 92°C–95°C Window"
      },
      {
        type: "paragraph",
        text: "Our Assam Orthodox Gold and Clonal Imperial varieties perform optimally between 92°C and 95°C. At this range, the water retains enough dissolved oxygen to support gradual cell wall diffusion. The leaf opens progressively rather than rupturing — releasing honey top notes, malt mid-tones, and clean tannin structure in sequenced waves across the steeping window."
      },
      {
        type: "paragraph",
        text: "For our Heritage Smoked Souchong — where the bold phenolic smoke compounds require more aggressive extraction — we recommend 98°C to unlock the full atmospheric character without washing out the underlying blackberry and molasses base notes."
      }
    ],
    relatedSlugs: ["gaiwan-versus-teapot", "nocturnal-aeration-withering"]
  }
};

const FALLBACK = {
  tag: "Estate Chronicles",
  date: "2026",
  readTime: "6 min read",
  title: "From the Estate",
  subtitle: "Notes from the gardens of Chabua.",
  image: "https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=1800",
  content: [
    { type: "paragraph", text: "This entry is being prepared by our editorial team. Please return soon for the full account." }
  ],
  relatedSlugs: []
};

export default function JournalPost() {
  const { slug } = useParams();

  // Start from the hardcoded seed so the page never renders empty.
  const [post, setPost] = useState(POSTS_CONTENT[slug] || FALLBACK);

  useEffect(() => {
    // Reset to seed on slug change, then try to upgrade from the backend.
    setPost(POSTS_CONTENT[slug] || FALLBACK);

    let cancelled = false;
    (async () => {
      try {
        const dbPost = await getJournalPostBySlug(slug);
        // Only override if the DB row actually carries body content.
        if (!cancelled && dbPost?.content?.length > 0) {
          setPost(dbPost);
        }
      } catch {
        /* keep the hardcoded seed / fallback */
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);


  return (
    <div className="min-h-screen bg-brand-cream text-brand-charcoal pt-20">

      {/* Hero Image */}
      <motion.div
        className="w-full h-[50vh] md:h-[60vh] overflow-hidden relative bg-brand-charcoal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/70 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-6 md:px-12 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="font-sans text-xs tracking-widest uppercase text-brand-gold mb-3">
              {post.tag} · {post.date} · {post.readTime}
            </p>
            <h1 className="font-serif text-3xl md:text-5xl text-brand-cream tracking-wide leading-tight">
              {post.title}
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 md:px-12 py-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-muted mb-12">
          <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/journal" className="hover:text-brand-gold transition-colors">Journal</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-forest">{post.tag}</span>
        </div>

        {/* Subtitle */}
        {post.subtitle && (
          <motion.p
            className="font-serif italic text-xl md:text-2xl text-brand-forest/70 leading-relaxed mb-12 border-l-2 border-brand-gold pl-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {post.subtitle}
          </motion.p>
        )}

        {/* Content Blocks */}
        <div className="space-y-8">
          {post.content.map((block, i) => {
            if (block.type === "heading") {
              return (
                <motion.h2
                  key={i}
                  className="font-serif text-2xl md:text-3xl text-brand-forest tracking-wide mt-12 mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {block.text}
                </motion.h2>
              );
            }
            return (
              <motion.p
                key={i}
                className="font-sans font-light text-brand-charcoal/80 text-base md:text-lg leading-relaxed tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {block.text}
              </motion.p>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-brand-gold/20 my-16" />

        {/* Back Link */}
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest text-brand-muted hover:text-brand-forest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to The Journal
        </Link>
      </article>
    </div>
  );
}