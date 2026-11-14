// Demo data. All factories, people and amounts are fictional (ZEN Kaiz rule: no real company names).
// Place names are real Aichi municipalities.

export type VisaId =
  | "ssw1_mfg"
  | "ssw2_mfg"
  | "ssw1_food"
  | "intern"
  | "student"
  | "resident"
  | "engineer";

export type Field = "mfg" | "food";

export const VISAS: Record<
  VisaId,
  { vi: string; ja: string; en: string; short: string; fields: Field[] | "any"; weeklyHourCap?: number; block?: string }
> = {
  ssw1_mfg: {
    vi: "Kỹ năng đặc định 1 · Sản xuất công nghiệp",
    ja: "特定技能1号・工業製品製造業",
    en: "SSW (i) · Industrial manufacturing",
    short: "SSW1 · 製造",
    fields: ["mfg"],
  },
  ssw2_mfg: {
    vi: "Kỹ năng đặc định 2 · Sản xuất công nghiệp",
    ja: "特定技能2号・工業製品製造業",
    en: "SSW (ii) · Industrial manufacturing",
    short: "SSW2 · 製造",
    fields: ["mfg"],
  },
  ssw1_food: {
    vi: "Kỹ năng đặc định 1 · Chế biến thực phẩm",
    ja: "特定技能1号・飲食料品製造業",
    en: "SSW (i) · Food manufacturing",
    short: "SSW1 · 食品",
    fields: ["food"],
  },
  intern: {
    vi: "Thực tập sinh kỹ năng",
    ja: "技能実習",
    en: "Technical intern",
    short: "技能実習",
    fields: [],
    block: "Thực tập sinh không được tự chuyển nơi làm. Cần chuyển sang Kỹ năng đặc định trước.",
  },
  student: {
    vi: "Du học",
    ja: "留学",
    en: "Student",
    short: "留学",
    fields: "any",
    weeklyHourCap: 28,
  },
  resident: {
    vi: "Định cư · Vĩnh trú · Vợ/chồng người Nhật",
    ja: "定住者・永住者・日本人の配偶者等",
    en: "Resident (no work limit)",
    short: "定住/永住",
    fields: "any",
  },
  engineer: {
    vi: "Kỹ sư · Tri thức nhân văn · Nghiệp vụ quốc tế",
    ja: "技術・人文知識・国際業務",
    en: "Engineer / Specialist",
    short: "技人国",
    fields: [],
    block: "Visa kỹ sư không cho phép làm việc trực tiếp trên dây chuyền.",
  },
};

export type SkillId =
  | "cnc_lathe"
  | "cnc_mill"
  | "welding"
  | "forklift_op"
  | "assembly"
  | "qc"
  | "molding"
  | "painting"
  | "packing";

export const SKILLS: Record<SkillId, { vi: string; ja: string; en: string }> = {
  cnc_lathe: { vi: "Tiện CNC", ja: "CNC旋盤", en: "CNC lathe" },
  cnc_mill: { vi: "Phay CNC", ja: "CNCフライス", en: "CNC milling" },
  welding: { vi: "Hàn", ja: "溶接", en: "Welding" },
  forklift_op: { vi: "Lái xe nâng", ja: "フォークリフト", en: "Forklift" },
  assembly: { vi: "Lắp ráp", ja: "組立", en: "Assembly" },
  qc: { vi: "Kiểm tra chất lượng", ja: "検査", en: "Inspection / QC" },
  molding: { vi: "Ép nhựa", ja: "成形", en: "Injection molding" },
  painting: { vi: "Sơn", ja: "塗装", en: "Painting" },
  packing: { vi: "Đóng gói", ja: "梱包", en: "Packing" },
};

// Partial credit between related skills (0..1).
export const RELATED: Partial<Record<SkillId, Partial<Record<SkillId, number>>>> = {
  cnc_mill: { cnc_lathe: 0.6 },
  cnc_lathe: { cnc_mill: 0.6 },
  qc: { assembly: 0.5 },
  assembly: { qc: 0.5, packing: 0.4 },
  molding: { assembly: 0.4 },
};

export type CertId = "forklift" | "weld_jis" | "lathe_3" | "tamakake";

export const CERTS: Record<CertId, { vi: string; ja: string; en: string }> = {
  forklift: { vi: "Chứng chỉ xe nâng", ja: "フォークリフト運転技能講習", en: "Forklift licence" },
  weld_jis: { vi: "Chứng chỉ hàn JIS", ja: "JIS溶接技能者", en: "JIS welding cert." },
  lathe_3: { vi: "Kỹ năng tiện cấp 3", ja: "技能検定3級（旋盤）", en: "Lathe skill test L3" },
  tamakake: { vi: "Móc cẩu (Tamakake)", ja: "玉掛け", en: "Slinging (Tamakake)" },
};

export type CityId = "nagoya" | "toyota" | "kariya" | "anjo" | "okazaki" | "toyohashi" | "chiryu" | "komaki" | "ichinomiya" | "kasugai" | "toyokawa" | "handa" | "nishio" | "inazawa" | "tokai" | "obu";

export const CITIES: Record<CityId, { vi: string; ja: string; lat: number; lng: number }> = {
  nagoya: { vi: "Nagoya", ja: "名古屋市", lat: 35.181, lng: 136.906 },
  toyota: { vi: "Toyota-shi", ja: "豊田市", lat: 35.083, lng: 137.156 },
  kariya: { vi: "Kariya-shi", ja: "刈谷市", lat: 34.989, lng: 137.002 },
  anjo: { vi: "Anjo-shi", ja: "安城市", lat: 34.959, lng: 137.08 },
  okazaki: { vi: "Okazaki-shi", ja: "岡崎市", lat: 34.954, lng: 137.174 },
  toyohashi: { vi: "Toyohashi-shi", ja: "豊橋市", lat: 34.769, lng: 137.391 },
  chiryu: { vi: "Chiryu-shi", ja: "知立市", lat: 35.0, lng: 137.05 },
  komaki: { vi: "Komaki-shi", ja: "小牧市", lat: 35.291, lng: 136.912 },
  ichinomiya: { vi: "Ichinomiya-shi", ja: "一宮市", lat: 35.304, lng: 136.803 },
  kasugai: { vi: "Kasugai-shi", ja: "春日井市", lat: 35.247, lng: 136.972 },
  toyokawa: { vi: "Toyokawa-shi", ja: "豊川市", lat: 34.826, lng: 137.376 },
  handa: { vi: "Handa-shi", ja: "半田市", lat: 34.892, lng: 136.938 },
  nishio: { vi: "Nishio-shi", ja: "西尾市", lat: 34.862, lng: 137.062 },
  inazawa: { vi: "Inazawa-shi", ja: "稲沢市", lat: 35.248, lng: 136.78 },
  tokai: { vi: "Tokai-shi", ja: "東海市", lat: 35.023, lng: 136.902 },
  obu: { vi: "Obu-shi", ja: "大府市", lat: 35.012, lng: 136.963 },
};

export function distanceKm(a: CityId, b: CityId) {
  const A = CITIES[a], B = CITIES[b];
  const R = 6371, toRad = Math.PI / 180;
  const dLat = (B.lat - A.lat) * toRad, dLng = (B.lng - A.lng) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(A.lat * toRad) * Math.cos(B.lat * toRad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const JLPT = ["Chưa có", "N5", "N4", "N3", "N2+"] as const; // index = level 0..4
export const JLPT_SHORT = ["—", "N5", "N4", "N3", "N2+"] as const;

export const START_OPTIONS = [
  { days: 0, vi: "Ngay", sub: "trong tuần này" },
  { days: 14, vi: "2 tuần", sub: "sau khi báo nghỉ" },
  { days: 30, vi: "1 tháng", sub: "báo nghỉ 30 ngày" },
  { days: 60, vi: "2 tháng+", sub: "chưa gấp" },
] as const;

export type Profile = {
  name: string;
  nationality: "VN" | "ID" | "PH";
  visa: VisaId;
  cardExpiry: string; // ISO date
  skills: Partial<Record<SkillId, number>>; // years of experience
  certs: CertId[];
  jlpt: number; // 0..4
  availableInDays: number;
  city: CityId;
  relocate: boolean; // ok to move if dorm provided
  otherSkills?: string; // free text ("Khác")
  otherCerts?: string;
  province: string; // hometown province in Vietnam, used to match a hometown senpai
  currentCompany?: string; // only used to avoid matching a senpai at the same company; never shown
};

export type Option = { vi: string; en: string; ja: string };
export type Question = { id: string; vi: string; en: string; ja: string; options: Option[] };

export type Job = {
  id: string;
  company: string;
  companyJa: string;
  title: string;
  titleEn: string;
  titleJa: string;
  field: Field;
  city: CityId;
  hourly: number;
  shift: "day" | "rotating" | "night";
  otHours: number; // typical monthly overtime
  dorm: number | null; // monthly dorm fee, null = no dorm
  attendanceBonus: number;
  required: SkillId[];
  nice: SkillId[];
  certs: CertId[];
  jlptMin: number;
  startWithinDays: number;
  headcount: number;
  contractMonths?: number; // trial contract length, if any
  renewable?: boolean;
  verified: boolean; // company checked by KINTRA
  isNewPlant?: boolean;
  perks: string[];
  questions?: Question[]; // extra questions set up by the employer
};

export const JOBS: Job[] = [
  {
    id: "mikawa-cnc",
    company: "Mikawa Precision",
    companyJa: "三河精密工業",
    title: "Vận hành máy tiện CNC",
    titleEn: "CNC lathe operator",
    titleJa: "CNC旋盤オペレーター",
    field: "mfg",
    city: "toyota",
    hourly: 1480,
    shift: "rotating",
    otHours: 20,
    dorm: 22000,
    attendanceBonus: 15000,
    required: ["cnc_lathe"],
    nice: ["qc"],
    certs: [],
    jlptMin: 1,
    startWithinDays: 45,
    headcount: 300,
    verified: true,
    contractMonths: 3,
    renewable: true,
    isNewPlant: true,
    perks: ["Nhà máy mới · mở 12/2026", "Ký túc xá 1 người/phòng", "Xe đưa đón từ ga"],
    questions: [
      { id: "night", vi: "Bạn làm được ca đêm luân phiên không?", en: "Can work rotating night shifts?", ja: "夜勤ありの交替勤務は可能？", options: [{ vi: "Được", en: "Yes", ja: "可能" }, { vi: "Chỉ ca ngày", en: "Day shift only", ja: "日勤のみ" }] },
      { id: "interview", vi: "Bạn muốn phỏng vấn theo cách nào?", en: "Preferred interview format", ja: "希望の面接方法", options: [{ vi: "Tại nhà máy", en: "On-site at the plant", ja: "工場で対面" }, { vi: "Online qua Zalo", en: "Online via Zalo", ja: "Zaloでオンライン" }] },
    ],
  },
  {
    id: "okazaki-nc",
    company: "Okazaki Axle Works",
    companyJa: "岡崎アクスル",
    title: "Tiện tự động & kiểm tra trục",
    titleEn: "Auto-lathe & shaft inspection",
    titleJa: "自動旋盤・シャフト検査",
    field: "mfg",
    city: "okazaki",
    hourly: 1430,
    shift: "day",
    otHours: 15,
    dorm: 18000,
    attendanceBonus: 10000,
    required: ["cnc_lathe"],
    nice: ["qc"],
    certs: [],
    jlptMin: 2,
    startWithinDays: 45,
    headcount: 30,
    verified: true,
    perks: ["Chỉ ca ngày", "Nghỉ thứ 7 & CN"],
  },
  {
    id: "kariya-mill",
    company: "Kariya Parts Lab",
    companyJa: "刈谷パーツラボ",
    title: "Gia công phay CNC",
    titleEn: "CNC milling machinist",
    titleJa: "CNCフライス加工",
    field: "mfg",
    city: "kariya",
    hourly: 1450,
    shift: "day",
    otHours: 25,
    dorm: null,
    attendanceBonus: 10000,
    required: ["cnc_mill"],
    nice: [],
    certs: [],
    jlptMin: 2,
    startWithinDays: 30,
    headcount: 12,
    verified: true,
    perks: ["Gần ga JR Kariya", "Trợ cấp đi lại"],
  },
  {
    id: "okazaki-weld",
    company: "Okazaki Steel Craft",
    companyJa: "岡崎スチールクラフト",
    title: "Thợ hàn bán tự động CO₂",
    titleEn: "Semi-auto CO₂ welder",
    titleJa: "半自動CO₂溶接",
    field: "mfg",
    city: "okazaki",
    hourly: 1550,
    shift: "day",
    otHours: 20,
    dorm: 20000,
    attendanceBonus: 10000,
    required: ["welding"],
    nice: [],
    certs: ["weld_jis"],
    jlptMin: 2,
    startWithinDays: 30,
    headcount: 8,
    verified: true,
    perks: ["Lương cao nhất khu vực"],
  },
  {
    id: "anjo-forklift",
    company: "Anjo Components",
    companyJa: "安城コンポーネンツ",
    title: "Lái xe nâng nội bộ nhà máy",
    titleEn: "In-plant forklift driver",
    titleJa: "構内フォークリフト",
    field: "mfg",
    city: "anjo",
    hourly: 1380,
    shift: "rotating",
    otHours: 20,
    dorm: 18000,
    attendanceBonus: 10000,
    required: ["forklift_op"],
    nice: [],
    certs: ["forklift"],
    jlptMin: 1,
    startWithinDays: 14,
    headcount: 15,
    verified: false,
    perks: ["Không cần đứng máy"],
  },
  {
    id: "toyohashi-mold",
    company: "Toyohashi Resin",
    companyJa: "豊橋樹脂",
    title: "Vận hành máy ép nhựa",
    titleEn: "Injection molding operator",
    titleJa: "射出成形オペレーター",
    field: "mfg",
    city: "toyohashi",
    hourly: 1350,
    shift: "rotating",
    otHours: 30,
    dorm: 15000,
    attendanceBonus: 10000,
    required: ["molding"],
    nice: ["qc"],
    certs: [],
    jlptMin: 1,
    startWithinDays: 30,
    headcount: 25,
    verified: true,
    perks: ["Ký túc xá rẻ"],
  },
  {
    id: "nagoya-food",
    company: "Minato Bento Factory",
    companyJa: "港弁当工場",
    title: "Dây chuyền chế biến cơm hộp",
    titleEn: "Bento production line",
    titleJa: "弁当製造ライン",
    field: "food",
    city: "nagoya",
    hourly: 1300,
    shift: "night",
    otHours: 10,
    dorm: null,
    attendanceBonus: 5000,
    required: ["packing"],
    nice: [],
    certs: [],
    jlptMin: 1,
    startWithinDays: 14,
    headcount: 40,
    verified: true,
    perks: [],
  },
];

export const jobById = (id: string) => JOBS.find((j) => j.id === id);

// The key client's new plant — HR dashboard defaults to it.
export const KEY_JOB_ID = "mikawa-cnc";

// Demo persona from the M1 interview (Tuấn Anh, 26, lathe operator).
export const DEMO_PROFILE: Profile = {
  name: "Nguyễn Tuấn Anh",
  nationality: "VN",
  visa: "ssw1_mfg",
  cardExpiry: "2028-03-31",
  skills: { cnc_lathe: 3 },
  certs: [],
  jlpt: 2,
  availableInDays: 30,
  city: "chiryu",
  relocate: true,
  province: "Nghệ An",
  currentCompany: "Kariya Parts",
};

// Browsing without login: a neutral profile so take-home and start dates can be shown. Never scored or shown as a person.
export const GUEST_PROFILE: Profile = {
  name: "Khách",
  nationality: "VN",
  visa: "ssw1_mfg",
  cardExpiry: "2099-12-31",
  skills: {},
  certs: [],
  jlpt: 0,
  availableInDays: 0,
  city: "nagoya",
  relocate: true,
  province: "",
};

// Other applicants for HR view. hoursAgo is relative to first app load.
export type SeedCandidate = {
  id: string;
  profile: Profile;
  jobId: string;
  hoursAgo: number;
  status: "sent" | "viewed" | "approved" | "rejected";
  safetyDone?: boolean;
};

const P = (p: Partial<Profile> & Pick<Profile, "name">): Profile => ({
  nationality: "VN",
  visa: "ssw1_mfg",
  cardExpiry: "2028-01-01",
  skills: {},
  certs: [],
  jlpt: 2,
  availableInDays: 14,
  city: "toyota",
  relocate: true,
  province: "Hà Tĩnh",
  ...p,
});

export const SEED_CANDIDATES: SeedCandidate[] = [
  { id: "c1", jobId: KEY_JOB_ID, hoursAgo: 1.2, status: "sent", profile: P({ name: "Trần Văn Hùng", skills: { cnc_lathe: 5, qc: 2 }, certs: ["lathe_3"], jlpt: 3, availableInDays: 14, city: "toyota" }) },
  { id: "c2", jobId: KEY_JOB_ID, hoursAgo: 20.6, status: "viewed", profile: P({ name: "Lê Thị Mai", skills: { cnc_lathe: 2, qc: 3 }, jlpt: 2, availableInDays: 0, city: "okazaki" }) },
  { id: "c3", jobId: KEY_JOB_ID, hoursAgo: 22.8, status: "sent", profile: P({ name: "Phạm Quốc Bảo", skills: { cnc_lathe: 4 }, jlpt: 1, availableInDays: 30, city: "kariya" }) },
  { id: "c4", jobId: KEY_JOB_ID, hoursAgo: 6, status: "sent", profile: P({ name: "Rizky Pratama", nationality: "ID", skills: { cnc_mill: 3, cnc_lathe: 1 }, jlpt: 2, availableInDays: 14, city: "anjo" }) },
  { id: "c5", jobId: KEY_JOB_ID, hoursAgo: 11, status: "viewed", profile: P({ name: "Đỗ Minh Khang", visa: "resident", skills: { cnc_lathe: 6, qc: 4 }, certs: ["lathe_3", "tamakake"], jlpt: 3, availableInDays: 0, city: "kariya" }) },
  { id: "c6", jobId: KEY_JOB_ID, hoursAgo: 30, status: "approved", safetyDone: true, profile: P({ name: "Vũ Thanh Tùng", skills: { cnc_lathe: 3, assembly: 2 }, jlpt: 2, availableInDays: 14, city: "chiryu" }) },
  { id: "c7", jobId: KEY_JOB_ID, hoursAgo: 27, status: "sent", profile: P({ name: "Maria Santos", nationality: "PH", skills: { assembly: 3, qc: 2 }, jlpt: 2, availableInDays: 14, city: "komaki" }) },
  { id: "c8", jobId: KEY_JOB_ID, hoursAgo: 15, status: "rejected", profile: P({ name: "Hoàng Văn Nam", skills: { packing: 2 }, jlpt: 1, availableInDays: 60, city: "nagoya" }) },
  // Auto-excluded by visa gate (never shown in the ranked list).
  { id: "x1", jobId: KEY_JOB_ID, hoursAgo: 3, status: "sent", profile: P({ name: "Ngô Văn Lực", visa: "ssw1_food", skills: { cnc_lathe: 2 } }) },
  { id: "x2", jobId: KEY_JOB_ID, hoursAgo: 8, status: "sent", profile: P({ name: "Bùi Thị Hạnh", visa: "intern", skills: { cnc_lathe: 2 } }) },
  { id: "x3", jobId: KEY_JOB_ID, hoursAgo: 9, status: "sent", profile: P({ name: "Kim Tuấn", visa: "engineer", skills: { cnc_lathe: 1 }, jlpt: 4 }) },
];

// Demo data — mô phỏng, không phải số liệu thật.
// Vietnamese workers already at each plant. Only askable + attendance-verified people can be asked (hometown senpai).
export type Peer = { id: string; name: string; years: number; quote: string; rating: number; askable: boolean; province: string; attendanceVerified: boolean };
export const PEERS: Record<string, { count: number; peers: Peer[] }> = {
  "mikawa-cnc": {
    count: 12,
    peers: [
      { id: "pe1", name: "Đặng Văn Hùng", years: 2, quote: "Tăng ca đúng mô tả, ký túc xá sạch.", rating: 4.6, askable: true, province: "Nghệ An", attendanceVerified: true },
      { id: "pe2", name: "Lý Thị Thu", years: 1, quote: "Tổ trưởng người Nhật dễ tính, dạy kỹ.", rating: 4.4, askable: true, province: "Thanh Hoá", attendanceVerified: true },
      { id: "pe3", name: "Cao Minh Đức", years: 3, quote: "Ca đêm hơi mệt nhưng phụ cấp tốt.", rating: 4.2, askable: false, province: "Nam Định", attendanceVerified: true },
    ],
  },
  "okazaki-nc": {
    count: 5,
    peers: [
      { id: "pe4", name: "Vương Quốc Huy", years: 2, quote: "Việc đều, ít tăng ca hơn quảng cáo.", rating: 4.0, askable: true, province: "Hà Tĩnh", attendanceVerified: true },
    ],
  },
};

// Demo data — mô phỏng. Key client: 3-month trial, 300 workers in week 1 (M3 market event). Day index is 0-based.
export const HIRE_PLAN = { jobId: KEY_JOB_ID, target: 300, days: 7, filledByDay: [38, 41, 35, 44, 0, 0, 0], today: 3, queued: 212 }; // queued = applications still waiting this week

export const JPY_TO_VND = 172; // reference rate for display only
