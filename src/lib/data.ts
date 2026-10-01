export type JobStatus = "Open" | "In Progress" | "Completed";

export type Job = {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  postedBy: string;
  clientRating: number;
  distanceKm: number;
  when: string;
  urgent: boolean;
  status: JobStatus;
  applicants: Applicant[];
};

export type Applicant = {
  name: string;
  skill: string;
  rating: number;
  jobs: number;
  note: string;
};

export const categories = [
  "Gardener",
  "Cleaner",
  "Tutor",
  "Handyman",
  "Caretaker",
  "Painter",
  "Electrician",
  "Plumber",
];

export const categoryEmoji: Record<string, string> = {
  Gardener: "🌿",
  Cleaner: "🧽",
  Tutor: "📚",
  Handyman: "🔧",
  Caretaker: "🧡",
  Painter: "🎨",
  Electrician: "💡",
  Plumber: "🚿",
};

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Garden clean-up and hedge trimming",
    category: "Gardener",
    description:
      "Front and back yard needs a proper clean-up. Grass cutting, hedge trimming along the wall and removal of the garden waste. Tools are available on site, you just bring yourself.",
    budget: 450,
    location: "Belhar Ext 15, Cape Town",
    postedBy: "Fatima Adams",
    clientRating: 4.8,
    distanceKm: 1.2,
    when: "Sat, 8 Aug · 08:00",
    urgent: false,
    status: "Open",
    applicants: [
      {
        name: "Sipho Mthembu",
        skill: "Gardener",
        rating: 4.9,
        jobs: 47,
        note: "I live in Belhar Ext 13, can start early Saturday.",
      },
      {
        name: "Ashwin Petersen",
        skill: "Gardener · Handyman",
        rating: 4.6,
        jobs: 22,
        note: "I have my own weed eater and rake.",
      },
      {
        name: "Nomsa Dlamini",
        skill: "Gardener",
        rating: 4.7,
        jobs: 31,
        note: "Available all weekend, references from Symphony Way.",
      },
    ],
  },
  {
    id: "j2",
    title: "Deep clean 3-bedroom house before move-in",
    category: "Cleaner",
    description:
      "Moving into a new place on Symphony Way and it needs a full deep clean — windows, kitchen cupboards inside and out, bathrooms and floors. Cleaning materials provided.",
    budget: 700,
    location: "Symphony Way, Belhar",
    postedBy: "Riyaad Isaacs",
    clientRating: 4.9,
    distanceKm: 2.4,
    when: "Thu, 6 Aug · 09:00",
    urgent: true,
    status: "Open",
    applicants: [
      {
        name: "Lindiwe Mokoena",
        skill: "Cleaner",
        rating: 5.0,
        jobs: 63,
        note: "I do deep cleans every week, can bring a helper at no extra cost.",
      },
      {
        name: "Charmaine Fortuin",
        skill: "Cleaner · Caretaker",
        rating: 4.8,
        jobs: 38,
        note: "Available Thursday from 08:00.",
      },
    ],
  },
  {
    id: "j3",
    title: "Grade 10 Maths tutor — twice a week",
    category: "Tutor",
    description:
      "Looking for a patient tutor for my son, Grade 10 Maths. Two sessions a week, an hour each, at our home near Modderdam Road. Ongoing until exams.",
    budget: 250,
    location: "Modderdam Road, Belhar",
    postedBy: "Zanele Ngcobo",
    clientRating: 4.7,
    distanceKm: 3.1,
    when: "Tue & Thu · 16:00",
    urgent: false,
    status: "In Progress",
    applicants: [
      {
        name: "Thabo Ndlovu",
        skill: "Tutor",
        rating: 4.9,
        jobs: 18,
        note: "UWC student, third year BSc. I tutor Maths and Physical Science.",
      },
    ],
  },
  {
    id: "j4",
    title: "Fix leaking kitchen tap and geyser overflow",
    category: "Plumber",
    description:
      "Kitchen mixer tap has been dripping for two weeks and the geyser overflow pipe drips onto the driveway. Need someone who can diagnose and fix same day.",
    budget: 600,
    location: "Voortrekker Road, Bellville South",
    postedBy: "Gavin Solomons",
    clientRating: 4.5,
    distanceKm: 4.6,
    when: "Wed, 5 Aug · 10:00",
    urgent: true,
    status: "Open",
    applicants: [
      {
        name: "Ebrahim Davids",
        skill: "Plumber",
        rating: 4.8,
        jobs: 55,
        note: "Qualified plumber, 12 years. I can come through at 10:00.",
      },
    ],
  },
  {
    id: "j5",
    title: "Paint two bedrooms — walls and ceilings",
    category: "Painter",
    description:
      "Two bedrooms need a fresh coat, white ceilings and soft grey walls. Paint already bought, you bring brushes and rollers.",
    budget: 1800,
    location: "Belhar Ext 22, Cape Town",
    postedBy: "Michelle Jantjies",
    clientRating: 4.6,
    distanceKm: 1.8,
    when: "Mon, 10 Aug · 08:30",
    urgent: false,
    status: "Open",
    applicants: [],
  },
  {
    id: "j6",
    title: "Install outside plug points and security light",
    category: "Electrician",
    description:
      "Need two weatherproof plug points at the back door and a motion sensor security light above the garage. Certificate of compliance would be a bonus.",
    budget: 1200,
    location: "Belhar Ext 13, Cape Town",
    postedBy: "Pieter van Wyk",
    clientRating: 4.9,
    distanceKm: 2.9,
    when: "Fri, 7 Aug · 13:00",
    urgent: false,
    status: "Completed",
    applicants: [
      {
        name: "Wesley Arendse",
        skill: "Electrician",
        rating: 4.9,
        jobs: 41,
        note: "Registered electrician, I can issue a CoC.",
      },
    ],
  },
];

export const testimonials = [
  {
    name: "Fatima Adams",
    role: "Community Member · Belhar Ext 15",
    quote:
      "I posted a garden job on a Thursday night and by Saturday morning Sipho was here with his own tools. Paid him R450 and the yard has never looked better.",
    rating: 5,
  },
  {
    name: "Sipho Mthembu",
    role: "Worker · Gardener, Belhar Ext 13",
    quote:
      "Before Connectly I stood at the corner of Symphony Way hoping for piece work. Now I get three to four jobs a week from people right here in the community.",
    rating: 5,
  },
  {
    name: "Zanele Ngcobo",
    role: "Community Member · Modderdam Road",
    quote:
      "Found a Maths tutor for my son two streets away. Seeing the ratings and reviews first made me comfortable to let someone into my home.",
    rating: 5,
  },
];

export const conversations = [
  {
    id: "c1",
    name: "Sipho Mthembu",
    role: "Gardener",
    last: "Perfect, I'll be there Saturday at 8.",
    time: "12:41",
    unread: 2,
  },
  {
    id: "c2",
    name: "Lindiwe Mokoena",
    role: "Cleaner",
    last: "Does the price include the windows outside?",
    time: "11:05",
    unread: 1,
  },
  {
    id: "c3",
    name: "Thabo Ndlovu",
    role: "Tutor",
    last: "Thursday's session went well, he's improving.",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "c4",
    name: "Ebrahim Davids",
    role: "Plumber",
    last: "I'll bring the washer and the flexi pipe.",
    time: "Mon",
    unread: 0,
  },
];

export const chatThread: Record<
  string,
  { from: "me" | "them"; text: string; time: string }[]
> = {
  c1: [
    { from: "them", text: "Goeie dag! I saw your garden clean-up job in Ext 15.", time: "12:18" },
    { from: "me", text: "Hi Sipho! Yes it's still open. Can you do this Saturday?", time: "12:22" },
    {
      from: "them",
      text: "Saturday works. I can start 08:00 and I'll be done before 13:00.",
      time: "12:30",
    },
    { from: "me", text: "Great. R450 as posted, and the garden waste must go too.", time: "12:36" },
    { from: "them", text: "Perfect, I'll be there Saturday at 8.", time: "12:41" },
  ],
  c2: [
    { from: "them", text: "Hi, I applied for the deep clean on Symphony Way.", time: "10:52" },
    { from: "me", text: "Hi Lindiwe, thanks. It's a 3-bedroom, empty house.", time: "10:58" },
    { from: "them", text: "Does the price include the windows outside?", time: "11:05" },
  ],
  c3: [
    { from: "them", text: "Thursday's session went well, he's improving.", time: "Yesterday" },
  ],
  c4: [{ from: "them", text: "I'll bring the washer and the flexi pipe.", time: "Mon" }],
};

export const notifications = [
  {
    icon: "👋",
    title: "Sipho Mthembu applied to your job",
    body: "Garden clean-up and hedge trimming · Belhar Ext 15",
    time: "8 min ago",
    unread: true,
  },
  {
    icon: "💬",
    title: "New message from Lindiwe Mokoena",
    body: "Does the price include the windows outside?",
    time: "1 hour ago",
    unread: true,
  },
  {
    icon: "✅",
    title: "Job marked complete",
    body: "Wesley Arendse completed 'Install outside plug points'",
    time: "Yesterday",
    unread: true,
  },
  {
    icon: "⭐",
    title: "You received a 5-star review",
    body: "Fatima Adams: 'Hard worker, arrived on time.'",
    time: "2 days ago",
    unread: false,
  },
  {
    icon: "💰",
    title: "Payment released",
    body: "R1 200 for the electrical job in Belhar Ext 13",
    time: "3 days ago",
    unread: false,
  },
];

export const transactions = [
  { job: "Install outside plug points", client: "Pieter van Wyk", amount: 1200, date: "1 Aug 2026" },
  { job: "Hedge trimming & lawn", client: "Fatima Adams", amount: 450, date: "28 Jul 2026" },
  { job: "Deep clean 2-bedroom flat", client: "Riyaad Isaacs", amount: 700, date: "25 Jul 2026" },
  { job: "Paint garage door", client: "Michelle Jantjies", amount: 550, date: "19 Jul 2026" },
  { job: "Fix leaking tap", client: "Gavin Solomons", amount: 380, date: "14 Jul 2026" },
];

export const weeklyEarnings = [
  { day: "Mon", amount: 450 },
  { day: "Tue", amount: 0 },
  { day: "Wed", amount: 700 },
  { day: "Thu", amount: 380 },
  { day: "Fri", amount: 1200 },
  { day: "Sat", amount: 900 },
  { day: "Sun", amount: 0 },
];

export const applications = {
  Applied: [
    { job: "Paint two bedrooms", client: "Michelle Jantjies", budget: 1800, when: "Applied 2 days ago" },
    { job: "Fix leaking kitchen tap", client: "Gavin Solomons", budget: 600, when: "Applied yesterday" },
  ],
  Shortlisted: [
    { job: "Deep clean 3-bedroom house", client: "Riyaad Isaacs", budget: 700, when: "Shortlisted today" },
  ],
  Hired: [
    { job: "Garden clean-up and hedge trimming", client: "Fatima Adams", budget: 450, when: "Starts Sat 08:00" },
  ],
  Rejected: [
    { job: "Weekend caretaker for elderly parent", client: "Denise Cloete", budget: 950, when: "Position filled" },
  ],
};

export const reviews = [
  {
    name: "Fatima Adams",
    rating: 5,
    text: "Arrived exactly on time and worked straight through. The yard looks brand new.",
    date: "28 Jul 2026",
  },
  {
    name: "Pieter van Wyk",
    rating: 5,
    text: "Neat work and explained everything. Would definitely hire again.",
    date: "1 Aug 2026",
  },
  {
    name: "Riyaad Isaacs",
    rating: 4,
    text: "Good job overall, just arrived twenty minutes late because of the taxi.",
    date: "25 Jul 2026",
  },
];

export const rand = (n: number) => `R${n.toLocaleString("en-ZA")}`;
