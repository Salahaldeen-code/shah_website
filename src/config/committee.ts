export type CommitteeMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    behance?: string;
    instagram?: string;
  };
};

/** PSR committee organization chart (sample members — replace with real photos/names). */
export const committeeMembers: CommitteeMember[] = [
  {
    id: "president",
    name: "Ahmad Rizal",
    role: "President",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    social: { linkedin: "#" },
  },
  {
    id: "deputy",
    name: "Siti Nurhaliza",
    role: "Deputy President",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    social: { linkedin: "#", instagram: "#" },
  },
  {
    id: "secretary",
    name: "Lim Wei Jie",
    role: "Honorary Secretary",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    social: { linkedin: "#" },
  },
  {
    id: "treasurer",
    name: "Priya Menon",
    role: "Honorary Treasurer",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    social: { linkedin: "#" },
  },
  {
    id: "sports",
    name: "Daniel Chong",
    role: "Sports Director",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    social: { twitter: "#", linkedin: "#" },
  },
  {
    id: "recreation",
    name: "Aisyah Rahman",
    role: "Recreation Officer",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    social: { instagram: "#", linkedin: "#" },
  },
];
