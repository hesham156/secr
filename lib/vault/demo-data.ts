export type DemoVaultItem = {
  id: string;
  title: string;
  website: string;
  url: string;
  username: string;
  password: string;
  category: string;
  tags: string[];
  favorite: boolean;
  updatedAt: string;
  createdAt: string;
};

export const demoVaultItems: DemoVaultItem[] = [
  {
    id: "github",
    title: "GitHub",
    website: "github.com",
    url: "https://github.com",
    username: "dev@example.com",
    password: "CorrectHorseBatteryStaple!52",
    category: "Development",
    tags: ["code", "team"],
    favorite: true,
    createdAt: "2026-07-12",
    updatedAt: "2026-08-21"
  },
  {
    id: "email",
    title: "Email",
    website: "mail.example.com",
    url: "https://mail.example.com",
    username: "owner@example.com",
    password: "short7",
    category: "Communication",
    tags: ["personal"],
    favorite: false,
    createdAt: "2025-03-04",
    updatedAt: "2025-03-04"
  },
  {
    id: "cloud",
    title: "Cloud Console",
    website: "cloud.example.com",
    url: "https://cloud.example.com",
    username: "admin@example.com",
    password: "CorrectHorseBatteryStaple!52",
    category: "Infrastructure",
    tags: ["admin"],
    favorite: true,
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10"
  }
];
