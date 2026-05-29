/**
 * backend/scripts/seed.js
 *
 * Development seed script.
 * Populates the database with sample users, posts (with categories/hashtags),
 * comments, follows, likes, bookmarks, and notifications.
 *
 * Intended for local/dev environments only.
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dns from 'dns'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

// Import models
import { User } from '../models/User.js'
import { Post } from '../models/Post.js'
import { Comment } from '../models/Comment.js'
import { Follow } from '../models/Follow.js'
import { Like } from '../models/Like.js'
import { Bookmark } from '../models/Bookmark.js'
import { Notification } from '../models/Notification.js'
import { Repost } from '../models/Repost.js'
import { UserHashtagInteraction } from '../models/UserHashtagInteraction.js'

// Configure DNS fallback resolver for SRV records dynamically in connection

// ─── DATA TEMPLATES FOR GENERATION ──────────────────────────────────────────

const categories = [
  'movies', 'photography', 'art', 'food', 'lifestyle',
  'travel', 'football', 'cricket', 'fitness', 'technology',
  'gaming', 'books', 'fashion', 'music', 'nature'
]

const unsplashImages = {
  movies: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=800&auto=format'
  ],
  photography: [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format'
  ],
  art: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format'
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format'
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format'
  ],
  travel: [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format'
  ],
  football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1577223625856-75891274c27a?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format'
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format'
  ],
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format'
  ],
  gaming: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format'
  ],
  books: [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=800&auto=format'
  ],
  music: [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=800&auto=format'
  ],
  nature: [
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format',
    'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?q=80&w=800&auto=format'
  ]
}

const captions = {
  movies: [
    'Finally watched the new sci-fi epic. The worldbuilding and cinematography are breathtaking! #movies #scifi #cinematography',
    'Analyzing the screenwriting structure of classic 90s thrillers. Pure genius. #screenwriting #movies #cinema',
    'Ranked my top 5 film directors of all time. Who is on your list? #movies #directors #film',
    'The acting performance in this new release is Oscar-worthy. What a tour de force! #acting #movies #review',
    'Can we talk about the incredible score in this movie? It perfectly sets the tone. #soundtrack #movies #score'
  ],
  photography: [
    'Chasing the golden hour in the heart of the city. Shadows tell stories. #photography #goldenhour #streetphotography',
    'Developing some black and white 35mm film in the lab. The grain is beautiful. #filmphotography #grain #monochrome',
    'Capturing the macro details of morning dew. Nature is the ultimate artist. #macrophotography #photography #nature',
    'Testing out my new prime lens. The depth of field is incredibly buttery. #photography #lens #bokeh',
    'A candid moment captured in the bustling city streets. #streetphotography #candid #bnw'
  ],
  art: [
    'Putting the finishing brush strokes on my latest oil painting. Exploring light. #art #painting #oilpainting',
    'Sketched this study of anatomy this afternoon. Charcoal is so expressive. #sketching #charcoal #art',
    'Visiting the modern art gallery. This abstract sculpture is highly provocative. #sculpture #gallery #modernart',
    'Digital painting progress. Loving the neon color scheme in this cyberpunk portrait. #digitalart #conceptart #cyberpunk',
    'Art is not what you see, but what you make others see. #creativity #inspiration #artwork'
  ],
  food: [
    'Baked a fresh loaf of artisanal sourdough bread today. That crust! #food #sourdough #baking #recipe',
    'Making a slow-cooked ragù that has been simmering for 6 hours. The aroma is heavenly. #cooking #pasta #recipe #foodie',
    'Quick 10-minute healthy lunch: Avocado toast with poached egg and chili flakes. #food #healthyrecipe #breakfast',
    'Exploring the complex spices of traditional street food. Absolutely delicious. #streetfood #foodporn #spices',
    'Indulging in a classic French pastry. The layers of butter are pure art. #pastry #croissant #foodie'
  ],
  lifestyle: [
    'Slow mornings: Fresh coffee, quiet music, and a good notebook. #lifestyle #slowliving #morningvibes',
    'Redecorating my study space for a calmer, distraction-free environment. #aesthetic #studyspace #decor',
    'A quick guide on organizing your weekly routine to avoid burnout. #productivity #wellness #lifestyle',
    'Enjoying a weekend walk in the park. Finding peace in the simple routines. #mindfulness #wellbeing',
    'Creating daily habits that compound into positive changes. #personaldevelopment #motivation'
  ],
  travel: [
    'Waking up to a misty morning in the valleys of Kyoto. Truly magical. #travel #japan #kyoto #explore',
    'Exploring the historical cobblestone streets of Rome. So much history in every corner. #travel #rome #italy',
    'Backpacking through the rugged peaks of Patagonia. The wind is fierce but the views are worth it. #patagonia #adventure #hiking',
    'Tasting local delicacies at the night market. Sights, sounds, and smells! #travel #nightmarket #foodtravel',
    'Travel makes one modest. You see what a tiny place you occupy in the world. #travelgram #wanderlust'
  ],
  football: [
    'What a tactical masterclass in the match last night. That high press was relentless! #football #tactics #matchday',
    'Absolute stunner of a goal in the 90th minute! The stadium went absolutely wild! #football #goal #premierleague',
    'Debating the best midfielders in Europe this season. Stats vs eye test. #football #midfielders #discussion',
    'Pre-season training has officially started. Building stamina and squad cohesion. #football #training #fitness',
    'The passion in the stands is what makes this game beautiful. Fandom at its best. #footballfans #derby'
  ],
  cricket: [
    'A phenomenal century under immense pressure. That cover drive was pure elegance! #cricket #testmatch #century',
    'What a spell of fast bowling! Swing and seam movement at its absolute finest. #cricket #bowling #ashes',
    'Analyzing the pitch conditions for the upcoming T20 final. Spin will play a huge role. #cricket #t20 #matchpreview',
    'Cricket in the park. The best way to spend a warm summer afternoon. #cricket #weekendcricket',
    'The legendary rivalry continues. High stakes, intense drama, outstanding cricket. #cricket #indvspak #rivalry'
  ],
  fitness: [
    'Hit a new personal record on deadlifts today! Consistency yields results. #fitness #deadlift #gymmotivation',
    'Active recovery day: 5km jog followed by deep stretching and mobility work. #running #flexibility #wellness',
    'Meal prep Sunday. Nutrition is 80% of the battle. Fuel your body right. #mealprep #fitness #nutrition',
    'Pushing through the final set when your muscles are screaming. Mind over matter. #workout #noexcuses #bodybuilding',
    'Striving for progress, not perfection. Keep showing up for yourself. #fitnessjourney #healthylifestyle'
  ],
  technology: [
    'The speed of AI advancements is dizzying. What tools are actually saving you time? #technology #ai #developer',
    'Building a modular keyboard from scratch. Lubing the switches is tedious but satisfying. #mechanicalkeyboards #diy #tech',
    'Clean desk setup update. Minimalist workspace, maximum focus. #setup #minimalism #tech',
    'Exploring the architecture of distributed database systems. Scaling is hard. #softwareengineering #databases #backend',
    'Technology is best when it brings people together. #innovation #futuretech'
  ],
  gaming: [
    'Starting my third playthrough of Elden Ring with a completely new build. #gaming #eldenring #rpg',
    'The storytelling in modern gaming rivals the best of cinema. Absolutely hooked. #gaming #storytelling #videogames',
    'Clutched a 1v4 round in the tactical shooter tournament! Hands are shaking. #gaming #esports #clutch',
    'Reviewing the visual design of indie games. Sometimes less is so much more. #indiegames #gamedev #design',
    'Retro gaming night. Replaying the classic platformers that started it all. #retrogaming #nostalgia'
  ],
  books: [
    'Just finished reading "Atomic Habits" by James Clear. Highly recommend for practical habit changes. #books #reading #habits',
    'Spending a rainy afternoon lost in a classic dystopian novel. The prose is haunting. #books #readinglist #dystopian',
    'My home library collection is growing. Out of shelf space but I keep buying more! #bookstagram #library #bibliophile',
    'Discussing the character development of anti-heroes in classic literature. #books #literature #analysis',
    'A book is a dream that you hold in your hand. #readingtime #bookworm'
  ],
  fashion: [
    'Curating a minimalist capsule wardrobe for the upcoming season. Quality over quantity. #fashion #capsulewardrobe #style',
    'Loving the resurgence of earthy tones and relaxed silhouettes. Comfort meets style. #fashion #streetwear #styleinspiration',
    'A look behind the scenes of sustainable fabric sourcing. Ethics in style. #sustainablefashion #fashiondesign',
    'Styling a classic trench coat for three different occasions. Versatility is key. #fashiontips #outfitoftheday',
    'Fashion is what you buy, style is what you do with it. #fashionblogger #trends'
  ],
  music: [
    'This new indie folk album has been on repeat all day. The acoustic guitar work is sublime. #music #indiefolk #acoustic',
    'Late night vinyl session. The analog warmth of old record players is unmatched. #music #vinyl #analog',
    'Synthesizer jam session. Dialing in some warm analog basslines. #synthesizer #musicproduction #jam',
    'A breakdown of the chord progressions that evoke nostalgia in pop music. #musictheory #songwriting #music',
    'Music is the shorthand of emotion. #instrumental #playlist'
  ],
  nature: [
    'Hiking through the towering redwoods. You feel so tiny next to these giants. #nature #hiking #redwoods #outdoors',
    'Spent the weekend camping under a clear starry sky. No signal, no worries. #camping #adventure #naturelovers',
    'Watching the autumn leaves fall. A beautiful reminder of the cycles of change. #nature #autumn #reflection',
    'The serene sound of a mountain stream. Best therapy in the world. #nature #mountains #peace',
    'In all things of nature there is something of the marvelous. #landscape #wilderness'
  ]
}

const commentTemplates = {
  movies: [
    'Absolutely spot on! Couldn’t agree more.',
    'I found the pacing a bit slow, but the acting was top tier.',
    'Wait, who was the director again?',
    'This movie has been on my watchlist forever! Need to see it.',
    'That scene with the score swelling was pure cinematic magic.',
    'Definitely one of my favorites from this year.'
  ],
  photography: [
    'Wow, the lighting in this is spectacular!',
    'What camera body and lens setup did you use?',
    'The grain gives it such a nostalgic look.',
    'Incredible composition. Great eye!',
    'Stunning shot! The focus is perfect.',
    'Beautifully captured moment.'
  ],
  art: [
    'The texture in this painting is mesmerizing!',
    'Wow, the color palette is so vibrant.',
    'Do you sell prints of this artwork?',
    'Incredible talent. The detail is mindblowing!',
    'This speaks to me on so many levels.',
    'Lovely study of light and shade.'
  ],
  food: [
    'This looks absolutely mouthwatering!',
    'Recipe please! Need to make this tonight.',
    'Simmering slow is definitely the secret key.',
    'My attempt at sourdough never looks this good! Tips?',
    'Yum! Saving this post for later.',
    'Cooking therapy at its absolute best.'
  ],
  lifestyle: [
    'Such a cozy setup. Love this vibe!',
    'I needed this reminder today. Thanks!',
    'Organizing my routine has saved me from burnout.',
    'What notebook brand is that? Looks clean.',
    'Slow mornings are the best.',
    'Love the focus on small daily habits!'
  ],
  travel: [
    'Incredible view! Kyoto is truly beautiful.',
    'Adding this to my bucket list immediately.',
    'Which hotel did you stay at? Looking for recommendations.',
    'Backpacking there must be intense but gorgeous.',
    'Stunning scenery. Thanks for sharing the tips!',
    'Wanderlust is hitting me hard right now.'
  ],
  football: [
    'What a match! Unbelievable performance.',
    'The refereeing was questionable, but tactics won out.',
    'Best league in the world, hands down.',
    'Pre-season looking strong. Up the team!',
    'Agreed, his work rate off the ball is highly underrated.',
    'Absolute absolute class!'
  ],
  cricket: [
    'That cover drive was textbook perfection.',
    'Phenomenonal bowling spell. Decimated the top order.',
    'Spin will definitely turn the game on Day 3.',
    'Classic cricket afternoon. Love it.',
    'What a rivalry. Always delivers high drama.',
    'Magnificent century!'
  ],
  fitness: [
    'Awesome lift! That looked strong.',
    'Active recovery is so crucial, nice work.',
    'Meal prep is indeed the hardest part to master.',
    'Keep grinding, consistency pays off!',
    'Inspiring progress. What is the routine?',
    'Mind over matter always.'
  ],
  technology: [
    'AI tool fatigue is real, but some are absolute lifesavers.',
    'That custom build looks incredibly clean!',
    'Minimalist setups definitely boost coding productivity.',
    'Distributed systems scaling is a whole different beast.',
    'What switches did you end up using on that keyboard?',
    'Tech progress is moving too fast!'
  ],
  gaming: [
    'Elden Ring builds are endless. What stats are you focusing on?',
    'Agreed, storytelling in games has peaked recently.',
    '1v4 clutch is INSANE! Nice play.',
    'Indie games have been outperforming AAA titles in design.',
    'Nostalgia overload. Love retro gaming.',
    'What a masterpiece of a game.'
  ],
  books: [
    'Atomic Habits changed my entire daily routine. Great book!',
    'Dystopian novels hit different on rainy days.',
    'No such thing as too many books! Buy more shelves.',
    'Anti-heroes make the story so much more complex.',
    'Lovely review. Adding it to my reading list.',
    'Reading is the best escape.'
  ],
  fashion: [
    'Capsule wardrobes are so efficient. Looks great.',
    'Earthy tones are definitely the wave this season.',
    'Sustainable fashion is the future. Respect!',
    'Love the styling options. Very versatile.',
    'Great outfit inspiration!',
    'Comfort and style combined perfectly.'
  ],
  music: [
    'Acoustic folk music is perfect for winding down.',
    'Vinyl records sound so much richer.',
    'Nice jam session! What synth is that?',
    'Music theory makes songwriting so fascinating.',
    'This track has been on repeat for me too.',
    'Beautiful melody.'
  ],
  nature: [
    'Redwood hikes are spiritual experiences.',
    'Camping under the stars is pure therapy.',
    'Beautiful colors. Nature is stunning.',
    'Serene views. Makes you appreciate the outdoors.',
    'Stunning landscape photo!',
    'Perfect escape from the city noise.'
  ]
}

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────────

const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomSelect = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomSubset = (arr, size) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, size)
}

// ─── SEED SCRIPT MAIN ───────────────────────────────────────────────────────

async function seed() {
  try {
    const isLocalFlag = process.argv.includes('--local')
    const isClusterFlag = process.argv.includes('--cluster') || process.argv.includes('--atlas')
    
    let mongoUri
    let modeText = 'Cluster'

    if (isLocalFlag) {
      mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = 'Local (CLI Flag)'
    } else if (isClusterFlag) {
      mongoUri = process.env.MONGO_URI
      modeText = 'Cluster (CLI Flag)'
    } else if (process.env.MONGO_CONNECTION_MODE === 'local') {
      mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = 'Local (Env Mode)'
    } else {
      // Default to MONGO_URI if present, fallback to local
      mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/verse-app'
      modeText = process.env.MONGO_URI ? 'Cluster (Default)' : 'Local (Fallback)'
    }

    console.log(`Attempting to connect to MongoDB in ${modeText} mode for seeding...`)

    // Set DNS servers to Google public DNS only for Atlas SRV connections to resolve SRV records
    if (mongoUri.startsWith('mongodb+srv://') && !mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
      try {
        dns.setServers(['8.8.8.8'])
      } catch (dnsErr) {
        console.warn(`Failed to set DNS servers: ${dnsErr.message}`)
      }
    }

    console.log('Connecting to database...')
    await mongoose.connect(mongoUri)
    console.log(`Database connected successfully (${modeText}): ${mongoose.connection.host}`)

    // Clear existing data (preserving real users whose email does not end in @example.com)
    console.log('Clearing existing seeded collections (preserving real users)...')
    
    // Find all seeded users (emails ending with @example.com)
    const seededUsers = await User.find({ email: { $regex: /@example\.com$/i } }, '_id')
    const seededUserIds = seededUsers.map(u => u._id)

    // Delete seeded users
    await User.deleteMany({ _id: { $in: seededUserIds } })

    // Delete posts made by seeded users
    await Post.deleteMany({ author: { $in: seededUserIds } })

    // Delete comments, likes, bookmarks, reposts, follows, notifications, and hashtag interactions created by seeded users
    await Promise.all([
      Comment.deleteMany({ user: { $in: seededUserIds } }),
      Like.deleteMany({ user: { $in: seededUserIds } }),
      Bookmark.deleteMany({ user: { $in: seededUserIds } }),
      Repost.deleteMany({ user: { $in: seededUserIds } }),
      UserHashtagInteraction.deleteMany({ user: { $in: seededUserIds } }),
      Follow.deleteMany({ $or: [{ follower: { $in: seededUserIds } }, { following: { $in: seededUserIds } }] }),
      Notification.deleteMany({ $or: [{ recipient: { $in: seededUserIds } }, { sender: { $in: seededUserIds } }] })
    ])

    // Clean up orphaned records referencing deleted posts
    const remainingPosts = await Post.find({}, '_id')
    const remainingPostIds = remainingPosts.map(p => p._id)

    await Promise.all([
      Comment.deleteMany({ post: { $nin: remainingPostIds } }),
      Like.deleteMany({ post: { $nin: remainingPostIds } }),
      Bookmark.deleteMany({ post: { $nin: remainingPostIds } }),
      Repost.deleteMany({ post: { $nin: remainingPostIds } }),
      Notification.deleteMany({ post: { $nin: remainingPostIds } })
    ])

    // Recalculate followers/following/posts counts for remaining (real) users
    const realUsers = await User.find({ email: { $not: /@example\.com$/i } })
    for (const user of realUsers) {
      const [followersCount, followingCount, postsCount] = await Promise.all([
        Follow.countDocuments({ following: user._id }),
        Follow.countDocuments({ follower: user._id }),
        Post.countDocuments({ author: user._id, isDeleted: false })
      ])
      user.followersCount = followersCount
      user.followingCount = followingCount
      user.postsCount = postsCount
      await user.save()
    }
    
    console.log('Seed collections cleaned (real users preserved).')

    // 1. Generate Users
    console.log('Generating 1,500 users...')
    const userTypes = {
      LURKER: 'lurker',
      CASUAL: 'casual',
      CREATOR: 'creator',
      INFLUENCER: 'influencer'
    }

    // Pre-generate a single password hash to avoid slow bcrypt execution 1500 times
    console.log('Generating password hash for accounts (password123)...')
    const passwordHash = await bcrypt.hash('password123', 10)

    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
      'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
      'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
    const hobbies = ['cook', 'wander', 'snap', 'hike', 'code', 'read', 'fit', 'gamer', 'style', 'music_fan']

    const usersData = []
    
    // Distribute user types
    // Total 1500 users
    // Lurkers: 45% = 675
    // Casuals: 35% = 525
    // Creators: 15% = 225
    // Influencers: 5% = 75
    for (let i = 0; i < 1500; i++) {
      let type = userTypes.LURKER
      if (i >= 675 && i < 1200) type = userTypes.CASUAL
      else if (i >= 1200 && i < 1425) type = userTypes.CREATOR
      else if (i >= 1425) type = userTypes.INFLUENCER

      const firstName = randomSelect(firstNames)
      const lastName = randomSelect(lastNames)
      const hobby = randomSelect(hobbies)
      const randNum = randomRange(100, 999)
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${hobby}${randNum}`
      const email = `${username}@example.com`

      // Primary interests (pick 2-4 categories)
      const userInterests = randomSubset(categories, randomRange(2, 4))
      const interestScores = {}
      categories.forEach(cat => {
        if (userInterests.includes(cat)) {
          // high affinity for selected
          interestScores[cat] = parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) // 0.60 to 1.00
        } else if (Math.random() > 0.6) {
          // slight affinity for some unselected
          interestScores[cat] = parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)) // 0.10 to 0.40
        }
        // others are omitted
      })

      // Bios depending on type
      let bio = ''
      if (type === userTypes.LURKER) {
        bio = `Silent observer of beautiful things. Interested in ${userInterests.join(', ')}.`
      } else if (type === userTypes.CASUAL) {
        bio = `Just writing my thoughts. Hobbies: ${hobby}. Lover of ${userInterests[0]} & ${userInterests[1]}.`
      } else if (type === userTypes.CREATOR) {
        bio = `Creative soul | Sharing my daily work in ${userInterests.slice(0, 2).join(' & ')} | Hit follow for updates!`
      } else {
        bio = `✨ Digital Creator & Curator ✨ | Focused on ${userInterests[0].toUpperCase()} | Business: contact@${username}.com`
      }

      usersData.push({
        _id: new mongoose.Types.ObjectId(),
        username,
        email,
        password: passwordHash,
        bio,
        profilePicture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        profilePicturePublicId: '',
        coverPhoto: '',
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        interestScores,
        onboardingInterests: userInterests,
        privacy: 'public',
        // metadata for temporary use in script
        tempType: type,
        tempInterests: userInterests
      })
    }

    const lurkers = usersData.filter(u => u.tempType === userTypes.LURKER)
    const casuals = usersData.filter(u => u.tempType === userTypes.CASUAL)
    const creators = usersData.filter(u => u.tempType === userTypes.CREATOR)
    const influencers = usersData.filter(u => u.tempType === userTypes.INFLUENCER)

    console.log(`User types breakdown: 
      - Lurkers: ${lurkers.length}
      - Casuals: ${casuals.length}
      - Creators: ${creators.length}
      - Influencers: ${influencers.length}`)

    // 2. Generate Posts
    console.log('Generating 1,500 posts...')
    const postsData = []

    // Lurkers: 0 posts
    // Casuals: 300 casuals post 1 post each = 300 posts
    const activeCasuals = randomSubset(casuals, 300)
    activeCasuals.forEach(user => {
      const category = randomSelect(user.tempInterests)
      const postCaptions = captions[category]
      const capText = randomSelect(postCaptions)
      const imgUrl = randomSelect(unsplashImages[category])
      
      // Extract hashtags
      const tags = capText.match(/#[a-zA-Z0-9_]+/g) || []

      postsData.push({
        _id: new mongoose.Types.ObjectId(),
        author: user._id,
        content: capText,
        imageUrl: `${imgUrl}&q=80&w=600&auto=format`,
        imagePublicId: 'synthetic_image',
        likesCount: 0,
        bookmarksCount: 0,
        commentsCount: 0,
        category,
        hashtags: tags,
        isDeleted: false,
        createdAt: new Date(Date.now() - randomRange(1, 10) * 24 * 3600000) // 1-10 days ago
      })
      user.postsCount++
    })

    // Creators: 3-4 posts each = 225 creators * 3.5 avg = 800 posts
    creators.forEach(user => {
      const numPosts = randomRange(3, 4)
      for (let p = 0; p < numPosts; p++) {
        const category = randomSelect(user.tempInterests)
        const postCaptions = captions[category]
        const capText = randomSelect(postCaptions)
        const imgUrl = randomSelect(unsplashImages[category])
        const tags = capText.match(/#[a-zA-Z0-9_]+/g) || []

        postsData.push({
          _id: new mongoose.Types.ObjectId(),
          author: user._id,
          content: capText,
          imageUrl: `${imgUrl}&q=80&w=600&auto=format`,
          imagePublicId: 'synthetic_image',
          likesCount: 0,
          bookmarksCount: 0,
          commentsCount: 0,
          category,
          hashtags: tags,
          isDeleted: false,
          createdAt: new Date(Date.now() - randomRange(1, 15) * 24 * 3600000)
        })
        user.postsCount++
      }
    })

    // Influencers: 5-6 posts each = 75 influencers * 5.3 avg = 400 posts
    influencers.forEach(user => {
      const numPosts = randomRange(5, 6)
      for (let p = 0; p < numPosts; p++) {
        const category = user.tempInterests[0] // focus heavily on primary category
        const postCaptions = captions[category]
        const capText = randomSelect(postCaptions)
        const imgUrl = randomSelect(unsplashImages[category])
        const tags = capText.match(/#[a-zA-Z0-9_]+/g) || []

        postsData.push({
          _id: new mongoose.Types.ObjectId(),
          author: user._id,
          content: capText,
          imageUrl: `${imgUrl}&q=80&w=800&auto=format`, // slightly wider image for influencers
          imagePublicId: 'synthetic_image',
          likesCount: 0,
          bookmarksCount: 0,
          commentsCount: 0,
          category,
          hashtags: tags,
          isDeleted: false,
          createdAt: new Date(Date.now() - randomRange(1, 30) * 24 * 3600000)
        })
        user.postsCount++
      }
    })

    console.log(`Total posts generated: ${postsData.length}`)

    // 3. Generate Follows
    console.log('Generating follows network graph (~35,000 links)...')
    const followsData = []
    const followPairs = new Set()

    const addFollow = (followerObj, followingObj) => {
      const pairKey = `${followerObj._id}-${followingObj._id}`
      if (followPairs.has(pairKey)) return false
      followPairs.add(pairKey)

      followsData.push({
        follower: followerObj._id,
        following: followingObj._id,
        createdAt: new Date(Date.now() - randomRange(5, 60) * 24 * 3600000)
      })

      followerObj.followingCount++
      followingObj.followersCount++
      return true
    }

    // Heavy distribution skewing:
    // - Every user follows 15-25 random influencers (making influencers get ~1500 * 20 = 30,000 follows)
    // - Every user follows 3-6 creators sharing at least one interest category
    // - Every user follows 1-2 random casual users
    usersData.forEach(follower => {
      // Follow influencers
      const numInfluencersToFollow = randomRange(15, 25)
      const influencersToFollow = randomSubset(influencers, numInfluencersToFollow)
      influencersToFollow.forEach(inf => {
        if (inf._id.toString() !== follower._id.toString()) {
          addFollow(follower, inf)
        }
      })

      // Follow creators with shared interests
      const numCreatorsToFollow = randomRange(3, 6)
      const eligibleCreators = creators.filter(c => 
        c._id.toString() !== follower._id.toString() &&
        c.tempInterests.some(cat => follower.tempInterests.includes(cat))
      )
      const creatorsToFollow = randomSubset(eligibleCreators.length > 0 ? eligibleCreators : creators, numCreatorsToFollow)
      creatorsToFollow.forEach(c => {
        addFollow(follower, c)
      })

      // Follow a few casuals
      const numCasualsToFollow = randomRange(1, 2)
      const casualsToFollow = randomSubset(casuals, numCasualsToFollow)
      casualsToFollow.forEach(cas => {
        if (cas._id.toString() !== follower._id.toString()) {
          addFollow(follower, cas)
        }
      })
    })

    console.log(`Total follows relationships generated: ${followsData.length}`)

    // 4. Generate Likes (~160,000 likes)
    console.log('Generating likes (~160,000 likes)...')
    const likesData = []
    const likedPairs = new Set()

    // Determine users who have interest in a category
    const usersByCategory = {}
    categories.forEach(cat => {
      usersByCategory[cat] = usersData.filter(u => u.tempInterests.includes(cat))
    })

    postsData.forEach(post => {
      // Determine how many likes this post receives
      let likesTarget = 0
      const authorObj = usersData.find(u => u._id.toString() === post.author.toString())
      if (authorObj.tempType === userTypes.INFLUENCER) {
        likesTarget = randomRange(300, 500)
      } else if (authorObj.tempType === userTypes.CREATOR) {
        likesTarget = randomRange(80, 150)
      } else {
        likesTarget = randomRange(10, 30)
      }

      // Candidate likers:
      // - First preference: Users who follow the author or share the category interest
      // - Fill the rest with random users
      const interestUsers = usersByCategory[post.category] || []
      const potentialLickers = [...interestUsers]

      // Select distinct users to like
      let likesCount = 0
      let attempts = 0
      const maxAttempts = likesTarget * 3

      while (likesCount < likesTarget && attempts < maxAttempts) {
        attempts++
        let liker = null
        if (Math.random() < 0.8 && potentialLickers.length > 0) {
          liker = randomSelect(potentialLickers)
        } else {
          liker = randomSelect(usersData)
        }

        if (liker._id.toString() !== post.author.toString()) {
          const key = `${post._id}-${liker._id}`
          if (!likedPairs.has(key)) {
            likedPairs.add(key)
            likesData.push({
              post: post._id,
              user: liker._id,
              createdAt: new Date(post.createdAt.getTime() + randomRange(1, 48) * 3600000) // within 48h of post
            })
            post.likesCount++
            likesCount++
          }
        }
      }
    })

    console.log(`Total likes generated: ${likesData.length}`)

    // 5. Generate Bookmarks (~25,000 bookmarks)
    console.log('Generating bookmarks (~25,000 bookmarks)...')
    const bookmarksData = []
    const bookmarkPairs = new Set()

    postsData.forEach(post => {
      let bookmarksTarget = 0
      const authorObj = usersData.find(u => u._id.toString() === post.author.toString())
      if (authorObj.tempType === userTypes.INFLUENCER) {
        bookmarksTarget = randomRange(40, 70)
      } else if (authorObj.tempType === userTypes.CREATOR) {
        bookmarksTarget = randomRange(15, 30)
      } else {
        bookmarksTarget = randomRange(1, 5)
      }

      const interestUsers = usersByCategory[post.category] || []
      let bookmarksCount = 0
      let attempts = 0
      const maxAttempts = bookmarksTarget * 3

      while (bookmarksCount < bookmarksTarget && attempts < maxAttempts) {
        attempts++
        let bookmarker = null
        if (Math.random() < 0.8 && interestUsers.length > 0) {
          bookmarker = randomSelect(interestUsers)
        } else {
          bookmarker = randomSelect(usersData)
        }

        if (bookmarker._id.toString() !== post.author.toString()) {
          const key = `${post._id}-${bookmarker._id}`
          if (!bookmarkPairs.has(key)) {
            bookmarkPairs.add(key)
            bookmarksData.push({
              post: post._id,
              user: bookmarker._id,
              createdAt: new Date(post.createdAt.getTime() + randomRange(2, 72) * 3600000)
            })
            post.bookmarksCount++
            bookmarksCount++
          }
        }
      }
    })

    console.log(`Total bookmarks generated: ${bookmarksData.length}`)

    // 6. Generate Comments (~5,000 comments)
    console.log('Generating comments (~5,000 comments)...')
    const commentsData = []

    postsData.forEach(post => {
      let commentsTarget = 0
      const authorObj = usersData.find(u => u._id.toString() === post.author.toString())
      if (authorObj.tempType === userTypes.INFLUENCER) {
        commentsTarget = randomRange(12, 18)
      } else if (authorObj.tempType === userTypes.CREATOR) {
        commentsTarget = randomRange(4, 9)
      } else {
        commentsTarget = randomRange(0, 2)
      }

      const interestUsers = usersByCategory[post.category] || []
      const commentPool = commentTemplates[post.category]

      for (let c = 0; c < commentsTarget; c++) {
        const commenter = randomSelect(interestUsers.length > 0 ? interestUsers : usersData)
        const text = randomSelect(commentPool)

        commentsData.push({
          post: post._id,
          author: commenter._id,
          text,
          isDeleted: false,
          createdAt: new Date(post.createdAt.getTime() + randomRange(1, 36) * 3600000)
        })
        post.commentsCount++
      }
    })

    console.log(`Total comments generated: ${commentsData.length}`)

    // 7. Generate Reposts (~10,000 reposts)
    console.log('Generating reposts (~10,000 reposts)...')
    const repostsData = []
    const repostPairs = new Set()

    postsData.forEach(post => {
      let repostsTarget = 0
      const authorObj = usersData.find(u => u._id.toString() === post.author.toString())
      if (authorObj.tempType === userTypes.INFLUENCER) {
        repostsTarget = randomRange(20, 40)
      } else if (authorObj.tempType === userTypes.CREATOR) {
        repostsTarget = randomRange(5, 12)
      } else {
        repostsTarget = randomRange(0, 3)
      }

      const interestUsers = usersByCategory[post.category] || []
      let repostCount = 0
      let attempts = 0
      const maxAttempts = repostsTarget * 3

      while (repostCount < repostsTarget && attempts < maxAttempts) {
        attempts++
        let reposter = null
        if (Math.random() < 0.7 && interestUsers.length > 0) {
          reposter = randomSelect(interestUsers)
        } else {
          reposter = randomSelect(usersData)
        }

        if (reposter._id.toString() !== post.author.toString()) {
          const key = `${post._id}-${reposter._id}`
          if (!repostPairs.has(key)) {
            repostPairs.add(key)
            repostsData.push({
              post: post._id,
              user: reposter._id,
              createdAt: new Date(post.createdAt.getTime() + randomRange(2, 72) * 3600000)
            })
            post.repostsCount = (post.repostsCount || 0) + 1
            repostCount++
          }
        }
      }
    })

    console.log(`Total reposts generated: ${repostsData.length}`)

    // 8. Generate UserHashtagInteraction records from likes, comments, reposts
    console.log('Generating UserHashtagInteraction records...')
    const interactionMap = {} // key: `${userId}-${hashtag}`

    const trackInteraction = (userId, hashtags, action) => {
      for (const rawTag of hashtags) {
        const tag = rawTag.toLowerCase().replace(/^#/, '')
        const key = `${userId}-${tag}`
        if (!interactionMap[key]) {
          interactionMap[key] = { user: userId, hashtag: tag, likes: 0, comments: 0, reposts: 0, bookmarks: 0 }
        }
        interactionMap[key][action]++
      }
    }

    // Build post lookup for fast access
    const postById = {}
    postsData.forEach(p => { postById[p._id.toString()] = p })

    // Track likes
    likesData.forEach(like => {
      const post = postById[like.post.toString()]
      if (post && post.hashtags?.length > 0) {
        trackInteraction(like.user, post.hashtags, 'likes')
      }
    })

    // Track comments
    commentsData.forEach(comment => {
      const post = postById[comment.post.toString()]
      if (post && post.hashtags?.length > 0) {
        trackInteraction(comment.author, post.hashtags, 'comments')
      }
    })

    // Track reposts
    repostsData.forEach(repost => {
      const post = postById[repost.post.toString()]
      if (post && post.hashtags?.length > 0) {
        trackInteraction(repost.user, post.hashtags, 'reposts')
      }
    })

    // Track bookmarks
    bookmarksData.forEach(bookmark => {
      const post = postById[bookmark.post.toString()]
      if (post && post.hashtags?.length > 0) {
        trackInteraction(bookmark.user, post.hashtags, 'bookmarks')
      }
    })

    // Calculate scores for each interaction
    const STRONG_BOOST_THRESHOLD = 3
    const STRONG_BOOST_VALUE = 0.15
    const interactionsData = Object.values(interactionMap).map(rec => {
      const total = rec.likes + rec.comments + rec.reposts + rec.bookmarks
      const baseScore = (rec.likes * 0.05) + (rec.comments * 0.08) + (rec.reposts * 0.10) + (rec.bookmarks * 0.03)
      const strongBoost = total >= STRONG_BOOST_THRESHOLD ? STRONG_BOOST_VALUE : 0
      rec.score = parseFloat((baseScore + strongBoost).toFixed(4))
      rec.lastInteractedAt = new Date(Date.now() - randomRange(1, 72) * 3600000)
      return rec
    })

    console.log(`Total UserHashtagInteraction records: ${interactionsData.length}`)

    // ─── BULK INSERTIONS (WITH CHUNKING TO PREVENT RAM/TIMEOUT ISSUES) ─────
    console.log('Executing bulk insertions into MongoDB Atlas...')

    // Clean user metadata before inserting
    usersData.forEach(u => {
      delete u.tempType
      delete u.tempInterests
    })

    // Batch insert users (size 1500)
    console.log('Inserting users...')
    await User.insertMany(usersData, { ordered: false })
    console.log('Users inserted successfully.')

    // Batch insert posts (size 1500)
    console.log('Inserting posts...')
    await Post.insertMany(postsData, { ordered: false })
    console.log('Posts inserted successfully.')

    // Batch insert follows (size ~35,000) in chunks of 5,000
    console.log('Inserting follows...')
    const followChunks = chunkArray(followsData, 5000)
    for (let idx = 0; idx < followChunks.length; idx++) {
      await Follow.insertMany(followChunks[idx], { ordered: false })
      console.log(`Inserted follows chunk ${idx + 1}/${followChunks.length}`)
    }

    // Batch insert likes (size ~160,000) in chunks of 10,000
    console.log('Inserting likes...')
    const likeChunks = chunkArray(likesData, 10000)
    for (let idx = 0; idx < likeChunks.length; idx++) {
      await Like.insertMany(likeChunks[idx], { ordered: false })
      console.log(`Inserted likes chunk ${idx + 1}/${likeChunks.length}`)
    }

    // Batch insert bookmarks (size ~25,000) in chunks of 5,000
    console.log('Inserting bookmarks...')
    const bookmarkChunks = chunkArray(bookmarksData, 5000)
    for (let idx = 0; idx < bookmarkChunks.length; idx++) {
      await Bookmark.insertMany(bookmarkChunks[idx], { ordered: false })
      console.log(`Inserted bookmarks chunk ${idx + 1}/${bookmarkChunks.length}`)
    }

    // Batch insert comments (size ~5,000) in chunks of 2,000
    console.log('Inserting comments...')
    const commentChunks = chunkArray(commentsData, 2000)
    for (let idx = 0; idx < commentChunks.length; idx++) {
      await Comment.insertMany(commentChunks[idx], { ordered: false })
      console.log(`Inserted comments chunk ${idx + 1}/${commentChunks.length}`)
    }

    // Batch insert reposts (size ~10,000) in chunks of 5,000
    console.log('Inserting reposts...')
    const repostChunks = chunkArray(repostsData, 5000)
    for (let idx = 0; idx < repostChunks.length; idx++) {
      await Repost.insertMany(repostChunks[idx], { ordered: false })
      console.log(`Inserted reposts chunk ${idx + 1}/${repostChunks.length}`)
    }

    // Batch insert UserHashtagInteraction records in chunks of 5,000
    console.log('Inserting UserHashtagInteraction records...')
    const interactionChunks = chunkArray(interactionsData, 5000)
    for (let idx = 0; idx < interactionChunks.length; idx++) {
      await UserHashtagInteraction.insertMany(interactionChunks[idx], { ordered: false })
      console.log(`Inserted interaction chunk ${idx + 1}/${interactionChunks.length}`)
    }

    console.log('\n=========================================')
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!')
    console.log('=========================================')
    console.log(`Users created       : ${usersData.length}`)
    console.log(`Posts created       : ${postsData.length}`)
    console.log(`Follow links created: ${followsData.length}`)
    console.log(`Likes created       : ${likesData.length}`)
    console.log(`Bookmarks created   : ${bookmarksData.length}`)
    console.log(`Comments created    : ${commentsData.length}`)
    console.log(`Reposts created     : ${repostsData.length}`)
    console.log(`Interactions created: ${interactionsData.length}`)
    console.log('\nSample Creator Accounts (Password is "password123"):')
    const sampleCreators = creators.slice(0, 5)
    sampleCreators.forEach(c => {
      console.log(`- Username: ${c.username} | Email: ${c.email}`)
    })
    console.log('=========================================\n')

    process.exit(0)
  } catch (err) {
    console.error('Seeding encountered an error:', err)
    process.exit(1)
  }
}

function chunkArray(array, size) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// Execute
seed()
