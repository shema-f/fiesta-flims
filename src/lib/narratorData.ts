export interface Narrator {
  id: number;
  name: string;
  bio: string;
  rating: number;
  moviesCount: number;
  followers: string;
  image: string;
  tags: string[];
  featured?: boolean;
}

const allInterpreterNames = [
  "Rocky", "Junior Giti", "Yanga", "Sankara", "Savimbi", "Saga", "Gaheza",
  "B The Great", "Ambassador", "B.Man", "Bingo", "Buringanire", "Caleb",
  "Chapa", "Cyber", "Da Prince", "Didier", "Dr David", "Dylan", "Fasterman",
  "Fey", "Fred", "Genius", "Habibu", "Hakim", "Jackson", "Jonathan", "Jovi",
  "K.David", "Kappo", "Kim", "Lee Creator", "Master P", "Moses", "Mr Fire",
  "Mr Jingo", "Mr. Jeromy", "Mr.Nice", "Mungeli", "Mutibano", "Nkuba",
  "Oliver", "P.K", "Perfect", "Professor", "Remy", "Robert", "Romeo", "Rumuri",
  "Rwakilala", "Ryan", "Saiger", "Scratch", "Sikov", "Silver", "Siniya",
  "Sir Lex's", "Six", "The Future", "Tristar", "Vj Diva", "Vj Eric", "Vj Ice",
  "Vj King", "Vj Steppin", "Vj Tcr", "Yakuza", "Yeah man", "Yusufu", "Zacky"
];

const tagOptions = [
  ["Comedy", "Action", "Classic"],
  ["Romance", "Drama", "Family"],
  ["Action", "Thriller", "Adventure"],
  ["Animation", "Comedy", "Teen"],
  ["Classic", "Documentary", "War"],
  ["Children", "Fantasy", "Family"]
];

const interpreterImages: Record<string, string> = {
  "Rocky Kimomo": "/interpreters/Rocky Kimomo.png",
  "Rocky": "/interpreters/Rocky Kimomo.png",
  "Junior Giti": "/interpreters/Junior Giti.png",
  "Sankara": "/interpreters/Sankara.png",
  "Savimbi": "/interpreters/savimbi.png",
  "Saga": "/interpreters/saga.png",
  "Gaheza": "/interpreters/Gaheza.png",
  "B The Great": "/interpreters/B the great.png",
  "Dylan": "/interpreters/Dylan.png",
  "Yanga": "/interpreters/Yanga.png",
  "P.K": "/interpreters/PK.png",
  "PK": "/interpreters/PK.png",
  "Siniya": "/interpreters/siniya.png",
};

export const narratorsData: Narrator[] = allInterpreterNames.map((name, index) => {
  const isFeatured = ["Rocky", "Junior Giti", "Sankara"].includes(name);
  const rating = 4.5 + Math.random() * 0.5;
  const moviesCount = Math.floor(50 + Math.random() * 200);
  const followers = (1 + Math.random() * 3).toFixed(1) + "M";
  const tags = tagOptions[index % tagOptions.length];

  let image = interpreterImages[name] || "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20portrait%20of%20a%20Rwandan%20voice%20artist%20narrator&image_size=square_hd";

  return {
    id: index + 1,
    name: name,
    bio: `Talented Kinyarwanda interpreter known for amazing ${tags[0].toLowerCase()} movie narrations.`,
    rating: parseFloat(rating.toFixed(1)),
    moviesCount: moviesCount,
    followers: followers,
    image: image,
    tags: tags,
    featured: isFeatured
  };
});

export const featuresData = [
  {
    icon: "🎬",
    title: "Unique Content Features",
    items: [
      "Agasobanuye narrations – Exclusive Kinyarwanda-dubbed films",
      "Community dubbing uploads – Fans can upload their own versions",
      "Local film partnerships – Showcase Rwandan cinema",
      "Educational mode – Use narrations for language learning"
    ]
  },
  {
    icon: "📱",
    title: "Offline & Low-Internet Features",
    items: [
      "Offline downloads – Save movies on Wi-Fi",
      "Adaptive bitrate streaming – Auto-adjust quality (144p–720p)",
      "Audio-only mode – Listen to narrations",
      "Smart downloads – Auto-manage your library"
    ]
  },
  {
    icon: "🌍",
    title: "Community & Social Features",
    items: [
      "Narrator profiles – Highlight famous voices",
      "Fan rating system – Rate narrators and versions",
      "Interactive comments – Live reactions during playback",
      "Local leaderboards – Rank narrators by popularity"
    ]
  },
  {
    icon: "💰",
    title: "Monetization & Partnerships",
    items: [
      "Ad-supported free tier",
      "Premium subscription",
      "Telecom bundles with MTN Rwanda & Airtel",
      "Exclusive content deals"
    ]
  }
];
