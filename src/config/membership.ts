export type SportOption = {
  id: string;
  labelEn: string;
  labelMs: string;
};

export const membershipSports: readonly SportOption[] = [
  { id: "football", labelEn: "Football", labelMs: "Bola Sepak" },
  { id: "archery", labelEn: "Archery", labelMs: "Memanah" },
  { id: "tableTennis", labelEn: "Table-Tennis", labelMs: "Ping Pong" },
  { id: "badminton", labelEn: "Badminton", labelMs: "Badminton" },
  {
    id: "others",
    labelEn: "Others / Recreation Only",
    labelMs: "Lain-lain / Rekreasi Sahaja",
  },
] as const;

export const membershipUpload = {
  maxBytes: 2 * 1024 * 1024,
  accept: "image/jpeg,image/png",
} as const;
