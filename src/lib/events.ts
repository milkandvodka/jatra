import media from "./media.json";

export const CATEGORIES = ["Music", "Dance", "Comedy", "Food", "Workshops", "Talks", "Sport", "Festivals", "Trips"] as const;
export const AREAS = ["Old Town", "Unit 1–3", "Saheed Nagar", "Jaydev Vihar", "Nayapalli", "Patia", "Khandagiri", "Dhauli", "Out of town"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Area = (typeof AREAS)[number];
export type Tier = { id: string; name: string; price: number; capacity: number; sold: number; note?: string };
export type Picture = { src: string; w: number; h: number; alt: string };

export type EventItem = {
  slug: string;
  title: string;
  category: Category;
  area: Area;
  venue: string;
  address: string;
  summary: string;
  about: string[];
  schedule: [string, string][];
  goodToKnow: string[];
  host: string;
  image: Picture;
  tiers: Tier[];
  start: string; // ISO with +05:30
  end: string;
  userCreated?: boolean;
  hostEmail?: string;
  createdAt?: string;
};

type MediaKey = keyof typeof media;
export const pic = (key: MediaKey, alt: string): Picture => {
  const m = media[key];
  return { src: m.src, w: m.w, h: m.h, alt };
};

/* ---------- time, always Indian Standard Time ---------- */

const IST = "Asia/Kolkata";
export const todayIST = (now = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(now); // YYYY-MM-DD
export const addDays = (ymd: string, n: number) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};
export const isoAt = (ymd: string, hhmm: string) => `${ymd}T${hhmm}:00+05:30`;
export const dayOf = (iso: string) => todayIST(new Date(iso));

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...o });
const fWeekday = fmt({ weekday: "short" });
const fDay = fmt({ weekday: "short", day: "numeric", month: "short" });
const fLongDay = fmt({ weekday: "long", day: "numeric", month: "long" });
const fTime = fmt({ hour: "numeric", minute: "2-digit", hour12: true });

export const weekday = (iso: string) => fWeekday.format(new Date(iso));
export const shortDate = (iso: string) => fDay.format(new Date(iso));
export const longDate = (iso: string) => fLongDay.format(new Date(iso));
export const time = (iso: string) => fTime.format(new Date(iso)).replace(" ", " ").toLowerCase();
export const timeRange = (a: string, b: string) => `${time(a)}–${time(b)}`;
export const when = (e: Pick<EventItem, "start" | "end">) => {
  const sameDay = dayOf(e.start) === dayOf(e.end);
  return sameDay ? `${shortDate(e.start)}, ${timeRange(e.start, e.end)}` : `${shortDate(e.start)} to ${shortDate(e.end)}`;
};

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (n: number) => (n === 0 ? "Free" : inr.format(n));
export const fromPrice = (e: EventItem) => {
  const prices = e.tiers.map((t) => t.price);
  const min = Math.min(...prices);
  if (Math.max(...prices) === 0) return "Free";
  return min === 0 ? `Free to ${inr.format(Math.max(...prices))}` : prices.length > 1 ? `From ${inr.format(min)}` : inr.format(min);
};
export const seatsLeft = (e: EventItem, extra: Record<string, number> = {}) =>
  e.tiers.reduce((n, t) => n + Math.max(0, t.capacity - t.sold - (extra[t.id] ?? 0)), 0);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

/* ---------- sample events (demonstration content) ----------
   Dates are offsets from today, so the listings never go stale. */

type Seed = Omit<EventItem, "start" | "end"> & { day: number; from: string; to: string; days?: number };

const seeds: Seed[] = [
  {
    slug: "sunset-at-udayagiri",
    title: "Sunset at Udayagiri",
    category: "Trips",
    area: "Khandagiri",
    venue: "Udayagiri caves",
    address: "Khandagiri, Bhubaneswar 751030",
    summary: "A slow walk through the Jain rock-cut caves, ending on the ridge as the light goes.",
    about: [
      "The caves at Udayagiri were cut into the sandstone more than two thousand years ago as cells for monks. We climb through them in the late afternoon, stopping at the Rani Gumpha friezes and the Hathi Gumpha inscription.",
      "The walk ends on the top of the hill, facing west over the city, with lemon tea from the stall at the foot of the steps.",
    ],
    schedule: [["4:30 pm", "Meet at the ticket gate"], ["4:45 pm", "Rani and Ganesha caves"], ["5:30 pm", "Hathi Gumpha inscription"], ["5:50 pm", "Sunset from the ridge"]],
    goodToKnow: ["About 300 steps, some uneven.", "Monument entry fee is included.", "Flat shoes; the stone is slippery after rain."],
    host: "Old Town on Foot",
    image: pic("udayagiri", "A rock-cut cave front with stone pillars set into a sandstone hill"),
    tiers: [{ id: "walk", name: "Walk", price: 299, capacity: 25, sold: 17 }],
    day: 0, from: "16:30", to: "18:15",
  },
  {
    slug: "open-mic-patia",
    title: "Open mic at Patia",
    category: "Comedy",
    area: "Patia",
    venue: "Long Table Café",
    address: "KIIT Road, Patia, Bhubaneswar 751024",
    summary: "Ten new comics, five minutes each, in English, Odia and whatever falls in between.",
    about: [
      "A weekly open mic for people trying stand-up for the first, second or tenth time. Sign-ups close at 7 pm; the line-up is drawn from a jar.",
      "Expect hostel stories, Infocity commutes and at least one joke about the price of pakhala in Patia.",
    ],
    schedule: [["7:00 pm", "Comic sign-ups close"], ["8:00 pm", "First set"], ["9:15 pm", "Short break"], ["9:30 pm", "Headline spot"]],
    goodToKnow: ["Some language is for adults.", "The café serves food; order at the counter.", "Comics perform free. Pick the Comic ticket."],
    host: "Patia Laughs",
    image: pic("open-mic", "A microphone on a stand in front of a dark stage"),
    tiers: [
      { id: "audience", name: "Audience", price: 199, capacity: 60, sold: 41 },
      { id: "comic", name: "Comic", price: 0, capacity: 10, sold: 7, note: "Five-minute slot" },
    ],
    day: 1, from: "20:00", to: "22:00",
  },
  {
    slug: "late-food-walk-saheed-nagar",
    title: "Late food walk, Saheed Nagar",
    category: "Food",
    area: "Saheed Nagar",
    venue: "Saheed Nagar market",
    address: "Near Maharishi College Road, Saheed Nagar, Bhubaneswar 751007",
    summary: "Dahibara aloo dum, gupchup and a hot chhena jhili, eaten standing up at the stalls that open after dark.",
    about: [
      "Saheed Nagar is where the city eats after work. We walk five stalls in two hours and try one thing at each, chosen by the people who run them.",
      "Tastings are included in the ticket. Bring an appetite and some cash for anything you want to take home.",
    ],
    schedule: [["7:30 pm", "Meet at the market gate"], ["7:45 pm", "Dahibara aloo dum"], ["8:30 pm", "Gupchup and chaat"], ["9:15 pm", "Chhena jhili to finish"]],
    goodToKnow: ["Vegetarian throughout.", "Tell the host about allergies when you book.", "About 1.5 km on foot."],
    host: "Old Town on Foot",
    image: pic("food-stall", "A busy roadside food stall lit up at night with people waiting at the counter"),
    tiers: [{ id: "walk", name: "Walk and tastings", price: 449, capacity: 18, sold: 11 }],
    day: 2, from: "19:30", to: "21:30",
  },
  {
    slug: "mardala-and-odissi",
    title: "Mardala and Odissi",
    category: "Dance",
    area: "Unit 1–3",
    venue: "Rabindra Mandap",
    address: "Sachivalaya Marg, Unit 1, Bhubaneswar 751001",
    summary: "A guru and her students dance to a live mardala, the barrel drum that keeps Odissi's time.",
    about: [
      "The evening opens with the mardala alone, so you can hear the patterns the dancers' feet answer. Then come three pieces: a Mangalacharan, a Pallavi and an abhinaya from the Gita Govinda.",
      "Before the second half the drummer explains how a bol becomes a step. Ask questions; this is meant for first-timers as much as for rasikas.",
    ],
    schedule: [["6:30 pm", "Doors open"], ["7:00 pm", "Mardala solo"], ["7:20 pm", "Mangalacharan and Pallavi"], ["8:10 pm", "Abhinaya: Gita Govinda"]],
    goodToKnow: ["Seating is unreserved within each tier.", "Wheelchair access at the side entrance.", "No flash photography."],
    host: "Ekamra Arts Circle",
    image: pic("odissi-blue", "An Odissi dancer in a blue costume and silver jewellery, mid-step on a dark stage"),
    tiers: [
      { id: "balcony", name: "Balcony", price: 249, capacity: 120, sold: 64 },
      { id: "stalls", name: "Stalls", price: 499, capacity: 200, sold: 151 },
    ],
    day: 2, from: "18:30", to: "20:45",
  },
  {
    slug: "odissi-under-the-torana",
    title: "Odissi under the torana",
    category: "Dance",
    area: "Old Town",
    venue: "Mukteswar Temple grounds",
    address: "Kedar Gouri Vihar, Old Town, Bhubaneswar 751002",
    summary: "An open-air Odissi recital in front of the tenth-century stone arch, lit by lamps.",
    about: [
      "The torana at Mukteswar is the most photographed arch in Odisha. For one evening it becomes the back wall of a stage, with the dancers framed inside it.",
      "Two soloists and a group of six perform a programme built around the temple's own carvings. Sit on the mats near the front or on chairs further back.",
    ],
    schedule: [["5:45 pm", "Gates open, lamps lit"], ["6:30 pm", "Solo: Batu"], ["7:00 pm", "Group: Dashavatar"], ["7:45 pm", "Solo: Moksha"]],
    goodToKnow: ["Shoes off on the temple platform.", "Mats are free; chairs are a separate ticket.", "Gentle slope from the road."],
    host: "Ekamra Arts Circle",
    image: pic("odissi-red", "An Odissi dancer in a red and white costume, arms raised, against a black background"),
    tiers: [
      { id: "mat", name: "Floor mat", price: 0, capacity: 150, sold: 118, note: "Front rows" },
      { id: "chair", name: "Chair", price: 299, capacity: 80, sold: 52 },
    ],
    day: 3, from: "18:30", to: "20:15",
  },
  {
    slug: "pattachitra-in-a-day",
    title: "Pattachitra in a day",
    category: "Workshops",
    area: "Unit 1–3",
    venue: "Ekamra Haat",
    address: "Madhusudan Marg, Unit 3, Bhubaneswar 751001",
    summary: "Paint a small scroll the Raghurajpur way: tamarind-seed glue, chalk ground, natural colours, one brush hair at a time.",
    about: [
      "Painters from Raghurajpur show you how a patta is prepared from cloth, glue and chalk, how the colours are ground from stone and shell, and how a border is laid out before anything else.",
      "You leave with your own finished panel, about the size of a postcard, and the brushes you painted it with.",
    ],
    schedule: [["10:00 am", "Preparing the patta"], ["11:30 am", "Grinding colours"], ["1:00 pm", "Lunch, included"], ["2:00 pm", "Painting your panel"]],
    goodToKnow: ["All materials included.", "Ages 12 and up.", "Wear clothes that can take a stain."],
    host: "Pata Collective",
    image: pic("pattachitra", "Detail of a Pattachitra scroll painting with figures, cows and floral borders in red, yellow and green"),
    tiers: [{ id: "seat", name: "Workshop seat", price: 1200, capacity: 16, sold: 9 }],
    day: 4, from: "10:00", to: "16:00",
  },
  {
    slug: "evening-ragas-at-rajarani",
    title: "Evening ragas at Rajarani",
    category: "Music",
    area: "Old Town",
    venue: "Rajarani Temple lawns",
    address: "Tankapani Road, Old Town, Bhubaneswar 751002",
    summary: "Sitar and tabla on the lawn of the red sandstone temple, from dusk until the evening ragas run out.",
    about: [
      "Rajarani has no deity, which makes it a natural concert hall: an open lawn, a temple of red-gold stone and very little traffic noise once the sun is down.",
      "The programme follows the clock. It opens with Yaman as the light fades and closes with a late raga after nine.",
    ],
    schedule: [["5:30 pm", "Gates open"], ["6:00 pm", "Raga Yaman"], ["7:15 pm", "Tabla solo"], ["7:45 pm", "Raga Bageshri"]],
    goodToKnow: ["Bring a shawl; the lawn cools fast.", "Front rows are on durries.", "Parking on Tankapani Road."],
    host: "Ekamra Arts Circle",
    image: pic("rajarani", "The Rajarani temple, a red sandstone tower on a lawn, under a pale sky"),
    tiers: [
      { id: "lawn", name: "Lawn", price: 349, capacity: 200, sold: 96 },
      { id: "front", name: "Front rows", price: 699, capacity: 60, sold: 48 },
    ],
    day: 5, from: "18:00", to: "21:30",
  },
  {
    slug: "the-chhena-poda-trail",
    title: "The chhena poda trail",
    category: "Food",
    area: "Old Town",
    venue: "Starts at Lingaraj Market",
    address: "Lingaraj Road, Old Town, Bhubaneswar 751002",
    summary: "Four sweet shops, four versions of Odisha's burnt cheesecake, and a vote at the end.",
    about: [
      "Chhena poda is fresh cheese, sugar and cardamom baked until the outside caramelises. Every shop swears by its own oven. We taste four, from a sixty-year-old counter to a new kitchen in Unit 1.",
      "The walk ends with a blind tasting and a vote. The winner gets a mention on this page next week.",
    ],
    schedule: [["4:00 pm", "Meet at Lingaraj Market"], ["4:20 pm", "The old counter"], ["5:10 pm", "Rasagola detour"], ["5:45 pm", "Blind tasting"]],
    goodToKnow: ["Contains milk and sugar, lots of both.", "About 3 km, partly by auto.", "Autos included in the ticket."],
    host: "Old Town on Foot",
    image: pic("chhena-poda", "A slice of chhena poda, a caramelised cheese cake, on a dark plate"),
    tiers: [{ id: "trail", name: "Trail", price: 549, capacity: 14, sold: 6 }],
    day: 6, from: "16:00", to: "18:30",
  },
  {
    slug: "telling-time-by-the-konark-wheel",
    title: "Telling time by the Konark wheel",
    category: "Talks",
    area: "Old Town",
    venue: "Odisha State Museum auditorium",
    address: "Lewis Road, Bhubaneswar 751014",
    summary: "An astronomer and a sculptor on how the stone wheels of the Sun Temple work as sundials.",
    about: [
      "The twenty-four wheels carved on the Sun Temple at Konark have eight thick spokes and eight thin ones. Read with the shadow of the axle, they tell the time to within a few minutes.", // taste-skill-ignore: the shadow of a sundial, not a CSS shadow
      "This talk walks through the geometry with full-size photographs, then hands over to a stone carver who has made replicas of the wheel for thirty years.",
    ],
    schedule: [["5:30 pm", "Doors open"], ["6:00 pm", "The geometry of the wheel"], ["6:40 pm", "Carving a wheel"], ["7:10 pm", "Questions"]],
    goodToKnow: ["Free, but booking holds your seat.", "Talk in English, questions in Odia welcome.", "Museum galleries close at 5 pm."],
    host: "Sky & Stone Talks",
    image: pic("konark-wheel", "A carved stone chariot wheel from the Konark Sun Temple, with spokes and detailed reliefs"),
    tiers: [{ id: "seat", name: "Seat", price: 0, capacity: 180, sold: 122 }],
    day: 7, from: "18:00", to: "19:30",
  },
  {
    slug: "throw-your-first-pot",
    title: "Throw your first pot",
    category: "Workshops",
    area: "Khandagiri",
    venue: "Kala Bhoomi crafts museum",
    address: "Ghatikia, Khandagiri, Bhubaneswar 751003",
    summary: "Three hours on the wheel with a potter who has thrown the same terracotta forms for forty years.",
    about: [
      "Start with wedging the clay, then centring, which is harder than it looks. By the end you will have two or three small pots that the studio fires and keeps for you to collect.",
      "The session is in the courtyard of the crafts museum, so leave time to walk through the galleries afterwards.",
    ],
    schedule: [["11:00 am", "Wedging and centring"], ["12:00 pm", "Your first cylinder"], ["1:00 pm", "Bowls and trimming"], ["2:00 pm", "Finish"]],
    goodToKnow: ["Fired pots ready to collect in ten days.", "Aprons provided.", "Ages 10 and up."],
    host: "Clay Day Studio",
    image: pic("pottery", "Hands shaping wet clay on a spinning potter's wheel"),
    tiers: [{ id: "wheel", name: "Wheel and clay", price: 899, capacity: 12, sold: 5 }],
    day: 8, from: "11:00", to: "14:00",
  },
  {
    slug: "applique-night-market",
    title: "Appliqué night market",
    category: "Festivals",
    area: "Unit 1–3",
    venue: "Ekamra Haat",
    address: "Madhusudan Marg, Unit 3, Bhubaneswar 751001",
    summary: "Three evenings of Pipili appliqué, Sambalpuri weaves and Dokra brass, with makers at every stall.",
    about: [
      "Thirty stalls from Pipili, Sambalpur, Dhenkanal and Raghurajpur, open from five until ten. The canopies, lanterns and umbrellas are made for the market by the Pipili tailors who stitch the festival canopies.",
      "Each evening has one demonstration: appliqué cutting, ikat tie-dye and lost-wax casting.",
    ],
    schedule: [["5:00 pm", "Stalls open"], ["6:30 pm", "Demonstration of the evening"], ["8:00 pm", "Folk music on the lawn"], ["10:00 pm", "Close"]],
    goodToKnow: ["One ticket covers all three evenings.", "Most stalls take UPI.", "Step-free throughout."],
    host: "Pata Collective",
    image: pic("applique", "Pipili appliqué lanterns and umbrellas in bright red, yellow, green and blue"),
    tiers: [{ id: "entry", name: "Entry, all evenings", price: 50, capacity: 2000, sold: 740 }],
    day: 9, from: "17:00", to: "22:00", days: 3,
  },
  {
    slug: "sambalpuri-night",
    title: "Sambalpuri night",
    category: "Music",
    area: "Jaydev Vihar",
    venue: "Janata Maidan",
    address: "Jaydev Vihar, Bhubaneswar 751013",
    summary: "Dhol, nisan and tasa from western Odisha, and a dance floor that fills by the second song.",
    about: [
      "Three troupes from Sambalpur and Bargarh play the rhythms of the Dalkhai and Rasarkeli, with dancers in full Sambalpuri dress. After the stage sets, the floor is yours.",
      "Food stalls from Sambalpur sell chakuli pitha and mudhi mansa all evening.",
    ],
    schedule: [["6:30 pm", "Gates and food stalls"], ["7:30 pm", "Dalkhai troupe"], ["8:30 pm", "Rasarkeli and Karma"], ["9:30 pm", "Open floor"]],
    goodToKnow: ["Standing event with some seating.", "Loud; ear plugs at the info desk.", "Last entry 9 pm."],
    host: "Kosal Beats",
    image: pic("sambalpuri", "Sambalpuri folk dancers in printed saris caught in a beam of stage light"),
    tiers: [
      { id: "ground", name: "Ground", price: 299, capacity: 1500, sold: 610 },
      { id: "front", name: "Front pen", price: 799, capacity: 200, sold: 143 },
    ],
    day: 10, from: "19:00", to: "22:30",
  },
  {
    slug: "paper-boats-on-bindu-sagar",
    title: "Paper boats on Bindu Sagar",
    category: "Festivals",
    area: "Old Town",
    venue: "Bindu Sagar ghats",
    address: "Bindu Sagar, Old Town, Bhubaneswar 751002",
    summary: "Make a boita from banana bark and paper, set a lamp in it, and float it on the old temple tank before sunrise.",
    about: [
      "For centuries Odia families have floated little boats at dawn to remember the sailors who traded from Kalinga to Bali and Java. We gather on the steps of Bindu Sagar, fold and fit our boats, and let them go as the sky lightens.",
      "Kits are provided, or bring your own boat. Hot tea and chuda on the ghat afterwards.",
    ],
    schedule: [["5:00 am", "Gather on the eastern ghat"], ["5:15 am", "Making the boats"], ["5:50 am", "Lamps lit, boats float"], ["6:20 am", "Tea and chuda"]],
    goodToKnow: ["Steps down to the water; no rails.", "Kit includes bark, paper, lamp and wick.", "Children welcome with an adult."],
    host: "Old Town on Foot",
    image: pic("paper-boats", "Small paper and bark boats with flags floating on dark water among leaves"),
    tiers: [
      { id: "join", name: "Join in", price: 0, capacity: 300, sold: 188 },
      { id: "kit", name: "Join with boat kit", price: 149, capacity: 150, sold: 97 },
    ],
    day: 12, from: "05:00", to: "06:45",
  },
  {
    slug: "sunrise-at-dhauli",
    title: "Sunrise at Dhauli",
    category: "Trips",
    area: "Dhauli",
    venue: "Dhauli Shanti Stupa",
    address: "Dhauli Hills, Bhubaneswar 752002",
    summary: "Yoga and breathing on the hill where Ashoka gave up war, as the sun comes up over the Daya river.",
    about: [
      "Dhauli is where the Kalinga war ended and where Ashoka's rock edicts still stand. We meet at the foot of the hill in the dark, walk up to the white stupa and practise for an hour facing east.",
      "Suitable for complete beginners. Mats provided.",
    ],
    schedule: [["5:15 am", "Meet at the foot of the hill"], ["5:40 am", "Walk up to the stupa"], ["6:00 am", "Practice"], ["7:00 am", "The rock edicts, briefly"]],
    goodToKnow: ["Mats and water provided.", "Bus from Master Canteen at 4:45 am, booked separately.", "Wear layers."],
    host: "Kalinga Night Runners",
    image: pic("dhauli", "The white Shanti Stupa at Dhauli under a blue sky"),
    tiers: [{ id: "mat", name: "Mat", price: 199, capacity: 40, sold: 22 }],
    day: 13, from: "05:15", to: "07:30",
  },
  {
    slug: "kalinga-night-10k",
    title: "Kalinga night 10K",
    category: "Sport",
    area: "Nayapalli",
    venue: "Kalinga Stadium",
    address: "Nayapalli, Bhubaneswar 751012",
    summary: "Ten kilometres under the floodlights, starting and finishing on the stadium track.",
    about: [
      "The route leaves the stadium, loops through Nayapalli and Jaydev Vihar on closed roads and comes back for a final lap on the athletics track.",
      "Chip timing, water every 2.5 km and a 5K for anyone who would rather not do ten.",
    ],
    schedule: [["6:00 pm", "Bib collection"], ["7:15 pm", "Warm-up on the track"], ["7:30 pm", "10K start"], ["7:40 pm", "5K start"]],
    goodToKnow: ["Ages 16 and up for the 10K.", "Bag drop at gate 3.", "Results online the same night."],
    host: "Kalinga Night Runners",
    image: pic("kalinga-stadium", "The entrance of Kalinga Stadium with its long stands, palms and the road in front"),
    tiers: [
      { id: "5k", name: "5K", price: 499, capacity: 600, sold: 288 },
      { id: "10k", name: "10K", price: 699, capacity: 900, sold: 512 },
      { id: "10k-tee", name: "10K with tee", price: 999, capacity: 300, sold: 201 },
    ],
    day: 15, from: "19:30", to: "21:30",
  },
  {
    slug: "day-trip-to-raghurajpur",
    title: "Day trip to Raghurajpur",
    category: "Trips",
    area: "Out of town",
    venue: "Raghurajpur heritage village",
    address: "Pickup at Master Canteen Square, Bhubaneswar 751001",
    summary: "A bus to the village where every house is a painter's studio, with lunch at a family home.",
    about: [
      "Raghurajpur, near Puri, is one long street of painted houses where families make pattachitra, palm-leaf engravings and masks. We spend the day visiting four workshops and the gotipua dance school.",
      "Lunch is cooked by one of the painting families. The bus is back in the city by 6 pm.",
    ],
    schedule: [["7:00 am", "Bus leaves Master Canteen"], ["9:00 am", "Village walk"], ["1:00 pm", "Lunch with a painting family"], ["3:30 pm", "Gotipua school"]],
    goodToKnow: ["Bus, lunch and village fee included.", "About two hours each way.", "Bring cash for purchases."],
    host: "Pata Collective",
    image: pic("raghurajpur", "A house in Raghurajpur with its walls painted in red and white patterns"),
    tiers: [{ id: "seat", name: "Bus seat and lunch", price: 1499, capacity: 40, sold: 27 }],
    day: 16, from: "07:00", to: "18:00",
  },
  {
    slug: "gotipua-the-boy-dancers",
    title: "Gotipua: the boy dancers",
    category: "Dance",
    area: "Unit 1–3",
    venue: "Rabindra Mandap",
    address: "Sachivalaya Marg, Unit 1, Bhubaneswar 751001",
    summary: "The acrobatic dance form older than Odissi, performed by the boys of a village gurukul.",
    about: [
      "Gotipua began when boys dressed as girls took over the temple dances. It is faster and more acrobatic than Odissi, with human pyramids and backbends held through whole songs.",
      "This troupe trains in Raghurajpur and performs in Bhubaneswar twice a year.",
    ],
    schedule: [["6:00 pm", "Doors"], ["6:30 pm", "First half"], ["7:15 pm", "Interval"], ["7:30 pm", "Bandha nritya"]],
    goodToKnow: ["Allocated seating.", "Running time 90 minutes.", "Wheelchair spaces in the stalls."],
    host: "Ekamra Arts Circle",
    image: pic("gotipua", "A gotipua dancer in a jewelled headdress and painted face bending low over an oil lamp"),
    tiers: [
      { id: "balcony", name: "Balcony", price: 249, capacity: 120, sold: 41 },
      { id: "stalls", name: "Stalls", price: 499, capacity: 200, sold: 88 },
    ],
    day: 18, from: "18:30", to: "20:00",
  },
  {
    slug: "night-fair-on-the-mahanadi",
    title: "Night fair on the Mahanadi",
    category: "Festivals",
    area: "Out of town",
    venue: "Cuttack riverfront",
    address: "Pickup at Master Canteen Square, Bhubaneswar 751001",
    summary: "A ride to Cuttack's riverside fair: boat-shaped gates, a thousand stalls and thunia pitha by the kilo.",
    about: [
      "The fair on the banks of the Mahanadi is one of the largest open-air markets in Asia. Our bus leaves at five, gives you three hours on the ground and brings you back before midnight.",
      "A host stays at a fixed meeting point all evening in case anyone gets lost in the crowd.",
    ],
    schedule: [["5:00 pm", "Bus leaves Master Canteen"], ["6:00 pm", "Arrive at the fair"], ["9:00 pm", "Meet at the boat gate"], ["10:30 pm", "Back in Bhubaneswar"]],
    goodToKnow: ["Very crowded; keep valuables close.", "Return bus included.", "Fair entry is free."],
    host: "Old Town on Foot",
    image: pic("river-fair", "A huge illuminated gate shaped like a boat above a crowded fair at night"),
    tiers: [{ id: "ride", name: "Return ride", price: 399, capacity: 80, sold: 46 }],
    day: 20, from: "17:00", to: "22:30",
  },
];

export function sampleEvents(now = new Date()): EventItem[] {
  const today = todayIST(now);
  return seeds.map(({ day, from, to, days = 1, ...e }) => ({
    ...e,
    start: isoAt(addDays(today, day), from),
    end: isoAt(addDays(today, day + days - 1), to),
  }));
}

/** Headliners for the season procession, in the order they pass. */
export const SEASON = [
  "odissi-under-the-torana",
  "applique-night-market",
  "sambalpuri-night",
  "paper-boats-on-bindu-sagar",
  "kalinga-night-10k",
  "gotipua-the-boy-dancers",
  "night-fair-on-the-mahanadi",
];

/** Cover pictures an organizer can choose from when hosting. */
export const COVERS: Picture[] = [
  pic("mukteswar-torana", "The stone arch of the Mukteswar temple in Bhubaneswar's Old Town"),
  pic("lingaraj", "The Lingaraj temple towers in Bhubaneswar under a blue sky"),
  pic("city-night", "Light trails of traffic on a Bhubaneswar road at night"),
  pic("pipili-shop", "A Pipili shop hung with appliqué lanterns and umbrellas"),
  pic("rath-yatra", "The three chariots of the Rath Yatra above a large crowd"),
  pic("pattachitra", "Detail of a Pattachitra scroll painting"),
  pic("dahibara", "Dahibara with green chutney and red sauce on a dark plate"),
  pic("bindu-sagar-1880", "An old photograph of the temple in the middle of the Bindu Sagar lake"),
];
