// 40 việc bổ sung cho danh sách demo (công ty và số liệu là giả lập, phân bổ khắp Aichi).
import type { CertId, CityId, Field, Job, SkillId } from "./data";

type Row = [
  id: string, company: string, companyJa: string,
  title: string, titleEn: string, titleJa: string,
  city: CityId, hourly: number, shift: Job["shift"], otHours: number, dorm: number | null,
  required: SkillId[], nice: SkillId[], certs: CertId[], jlptMin: number,
  startWithinDays: number, headcount: number, perks: string[],
  extra?: { field?: Field; verified?: boolean; isNewPlant?: boolean; contractMonths?: number; bonus?: number },
];

const ROWS: Row[] = [
  // Tiện / phay CNC
  ["toyota-turn", "Toyota Gear Tech", "豊田ギアテック", "Tiện CNC bánh răng hộp số", "CNC gear turning", "ギアCNC旋盤", "toyota", 1460, "rotating", 25, 20000, ["cnc_lathe"], ["qc"], [], 1, 30, 40, ["Phụ cấp ca đêm 25%", "Xe đưa đón"], { isNewPlant: true, contractMonths: 3 }],
  ["kariya-turn", "Kariya Shaft Co.", "刈谷シャフト", "Vận hành tiện CNC trục xe", "Axle CNC turning", "シャフト旋盤", "kariya", 1500, "day", 18, 21000, ["cnc_lathe"], [], ["lathe_3"], 2, 30, 12, ["Chỉ ca ngày", "Thưởng 2 lần/năm"]],
  ["anjo-turn", "Anjo Seiki", "安城精機", "Tiện CNC chi tiết thuỷ lực", "Hydraulic parts CNC lathe", "油圧部品CNC旋盤", "anjo", 1440, "rotating", 20, 17000, ["cnc_lathe"], ["cnc_mill"], [], 1, 21, 18, ["Ký túc xá có wifi", "Tăng lương sau 6 tháng"]],
  ["nishio-turn", "Nishio Precision", "西尾精密", "Tiện CNC & đo kiểm", "CNC turning & gauging", "CNC旋盤・測定", "nishio", 1420, "day", 12, 16000, ["cnc_lathe"], ["qc"], [], 1, 45, 10, ["Nghỉ thứ 7 & CN", "Gần biển, yên tĩnh"]],
  ["okazaki-turn2", "Okazaki Valve", "岡崎バルブ", "Tiện CNC thân van", "Valve body CNC lathe", "バルブ旋盤", "okazaki", 1470, "rotating", 22, 19000, ["cnc_lathe"], [], [], 2, 30, 20, ["Phụ cấp tay nghề", "Bếp chung trong ký túc xá"], { contractMonths: 3 }],
  ["chiryu-turn", "Chiryu Metal Works", "知立メタル", "Tiện CNC phụ tùng ô tô", "Auto parts CNC lathe", "自動車部品旋盤", "chiryu", 1450, "day", 16, null, ["cnc_lathe"], ["qc"], [], 1, 14, 8, ["Gần nhà · đi xe đạp được", "Ca ngày cố định"]],
  ["toyokawa-turn", "Toyokawa Hydraulics", "豊川油圧", "Tiện CNC xi lanh", "Cylinder CNC lathe", "シリンダー旋盤", "toyokawa", 1410, "rotating", 28, 15000, ["cnc_lathe"], ["welding"], [], 1, 30, 25, ["Ký túc xá 1 người/phòng"], { isNewPlant: true }],
  ["obu-turn", "Obu Fastener", "大府ファスナー", "Tiện tự động đai ốc", "Automatic nut lathe", "ナット自動旋盤", "obu", 1390, "day", 10, 18000, ["cnc_lathe"], [], [], 1, 21, 15, ["Việc nhẹ, ít tăng ca"]],
  ["komaki-mill", "Komaki Mold Base", "小牧モールドベース", "Phay CNC khuôn", "CNC mold milling", "金型CNCフライス", "komaki", 1520, "day", 20, 22000, ["cnc_mill"], ["cnc_lathe"], [], 2, 30, 10, ["Lương cao", "Đào tạo máy 5 trục"]],
  ["kasugai-mill", "Kasugai Machining", "春日井マシニング", "Vận hành trung tâm gia công", "Machining center operator", "マシニングセンタ", "kasugai", 1480, "rotating", 24, 19000, ["cnc_mill"], ["qc"], [], 1, 30, 22, ["Phụ cấp ca đêm", "Xe đưa đón từ ga"]],
  ["toyota-mill", "Toyota Die Craft", "豊田ダイクラフト", "Phay CNC khuôn dập", "Press die CNC milling", "プレス金型加工", "toyota", 1540, "day", 18, 21000, ["cnc_mill"], ["cnc_lathe"], [], 2, 45, 6, ["Thưởng tay nghề hàng quý"], { isNewPlant: true }],
  ["handa-mill", "Handa Marine Parts", "半田マリンパーツ", "Phay CNC chi tiết tàu", "Marine parts CNC milling", "船舶部品フライス", "handa", 1430, "day", 14, 16000, ["cnc_mill"], [], [], 1, 30, 9, ["Nghỉ thứ 7 & CN"]],

  // Hàn
  ["toyota-weld", "Toyota Frame Works", "豊田フレーム", "Hàn khung xe bằng robot", "Robot frame welding", "ロボット溶接", "toyota", 1450, "rotating", 25, 20000, ["welding"], [], ["weld_jis"], 1, 30, 35, ["Phụ cấp chứng chỉ JIS"], { isNewPlant: true }],
  ["tokai-weld", "Tokai Steel Structure", "東海鋼構造", "Hàn kết cấu thép", "Structural steel welding", "鉄骨溶接", "tokai", 1560, "day", 30, 18000, ["welding"], [], ["weld_jis"], 1, 21, 14, ["Lương cao nhất ngành hàn"]],
  ["kariya-weld", "Kariya Exhaust", "刈谷エキゾースト", "Hàn ống xả", "Exhaust pipe welding", "排気管溶接", "kariya", 1420, "rotating", 22, 17000, ["welding"], ["assembly"], [], 1, 30, 20, ["Đồ bảo hộ cấp miễn phí"]],
  ["inazawa-weld", "Inazawa Elevator Parts", "稲沢エレベーター部品", "Hàn khung thang máy", "Elevator frame welding", "エレベーター枠溶接", "inazawa", 1470, "day", 16, 19000, ["welding"], [], [], 2, 45, 8, ["Chỉ ca ngày"]],

  // Lắp ráp
  ["toyota-assy", "Toyota Seat Systems", "豊田シートシステムズ", "Lắp ráp ghế ô tô", "Car seat assembly", "シート組立", "toyota", 1380, "rotating", 20, 18000, ["assembly"], ["qc"], [], 1, 14, 60, ["Tuyển số lượng lớn", "Có người Việt hướng dẫn"], { isNewPlant: true, contractMonths: 3 }],
  ["anjo-assy", "Anjo Electric", "安城電機", "Lắp ráp mô-tơ điện", "Electric motor assembly", "モーター組立", "anjo", 1360, "day", 12, 16000, ["assembly"], [], [], 1, 21, 30, ["Việc nhẹ, phù hợp nữ"]],
  ["kariya-assy", "Kariya Thermal", "刈谷サーマル", "Lắp ráp điều hoà xe", "Car A/C unit assembly", "カーエアコン組立", "kariya", 1400, "rotating", 25, 19000, ["assembly"], ["qc"], [], 1, 30, 45, ["Phụ cấp ca đêm", "Căng tin ¥300/bữa"]],
  ["ichinomiya-assy", "Ichinomiya Textile Machine", "一宮繊維機械", "Lắp ráp máy dệt", "Textile machine assembly", "繊維機械組立", "ichinomiya", 1350, "day", 10, 15000, ["assembly"], [], [], 2, 30, 10, ["Nghỉ thứ 7 & CN"]],
  ["komaki-assy", "Komaki Aero Parts", "小牧航空部品", "Lắp ráp linh kiện máy bay", "Aircraft parts assembly", "航空機部品組立", "komaki", 1450, "day", 15, 20000, ["assembly"], ["qc"], [], 2, 45, 12, ["Môi trường sạch, điều hoà"]],
  ["okazaki-assy", "Okazaki Mobility", "岡崎モビリティ", "Lắp ráp xe điện", "EV assembly line", "EV組立", "okazaki", 1420, "rotating", 22, 18000, ["assembly"], [], [], 1, 30, 80, ["Nhà máy xe điện mới", "Ký túc xá mới xây"], { isNewPlant: true, contractMonths: 6 }],

  // Kiểm tra chất lượng
  ["chiryu-qc", "Chiryu Inspection Center", "知立検査センター", "Kiểm tra ngoại quan linh kiện", "Visual parts inspection", "外観検査", "chiryu", 1340, "day", 10, null, ["qc"], ["assembly"], [], 1, 14, 20, ["Ngồi làm, không đứng máy"]],
  ["toyota-qc", "Toyota Metrology", "豊田計測", "Đo kiểm 3D (CMM)", "CMM inspection", "三次元測定", "toyota", 1480, "day", 15, 20000, ["qc"], ["cnc_lathe"], [], 2, 30, 6, ["Đào tạo máy đo 3D"]],
  ["nagoya-qc", "Nagoya Electronics", "名古屋エレクトロニクス", "Kiểm tra bo mạch điện tử", "PCB inspection", "基板検査", "nagoya", 1370, "rotating", 18, 22000, ["qc"], [], [], 1, 21, 25, ["Gần trung tâm Nagoya"]],
  ["kasugai-qc", "Kasugai Bearing", "春日井ベアリング", "Kiểm tra vòng bi", "Bearing inspection", "ベアリング検査", "kasugai", 1390, "day", 12, 17000, ["qc"], ["cnc_lathe"], [], 1, 30, 10, ["Chỉ ca ngày"]],

  // Ép nhựa / sơn
  ["toyohashi-mold2", "Toyohashi Auto Plastics", "豊橋オートプラスチック", "Ép nhựa cản xe", "Bumper injection molding", "バンパー成形", "toyohashi", 1370, "rotating", 30, 15000, ["molding"], [], [], 1, 21, 30, ["Ký túc xá ¥15.000"]],
  ["nishio-mold", "Nishio Polymer", "西尾ポリマー", "Vận hành máy ép & đổi khuôn", "Molding & die change", "成形・段取り", "nishio", 1400, "rotating", 24, 16000, ["molding"], ["qc"], ["tamakake"], 1, 30, 15, ["Phụ cấp móc cẩu"]],
  ["handa-mold", "Handa Resin Tech", "半田レジンテック", "Ép nhựa linh kiện điện", "Electrical parts molding", "電装部品成形", "handa", 1350, "day", 14, 14000, ["molding"], [], [], 1, 14, 12, ["Việc ổn định, ít tăng ca"]],
  ["toyota-paint", "Toyota Coating", "豊田コーティング", "Sơn tĩnh điện thân xe", "Body electrostatic painting", "静電塗装", "toyota", 1430, "rotating", 25, 19000, ["painting"], [], [], 1, 30, 20, ["Đồ bảo hộ cấp miễn phí"]],
  ["inazawa-paint", "Inazawa Finish", "稲沢フィニッシュ", "Sơn phủ chi tiết kim loại", "Metal parts coating", "金属塗装", "inazawa", 1380, "day", 15, 16000, ["painting"], ["qc"], [], 1, 21, 8, ["Chỉ ca ngày"]],

  // Xe nâng / đóng gói / kho
  ["tokai-forklift", "Tokai Logistics", "東海ロジスティクス", "Lái xe nâng kho thép", "Steel warehouse forklift", "鉄鋼倉庫フォーク", "tokai", 1420, "day", 20, 17000, ["forklift_op"], [], ["forklift"], 1, 14, 10, ["Thưởng an toàn hàng tháng"]],
  ["komaki-forklift", "Komaki Distribution", "小牧ディストリビューション", "Xe nâng & xuất nhập kho", "Forklift & shipping", "フォーク・入出荷", "komaki", 1400, "rotating", 22, 18000, ["forklift_op"], ["packing"], ["forklift"], 1, 21, 15, ["Gần đường cao tốc, có xe đưa đón"]],
  ["obu-pack", "Obu Parts Center", "大府パーツセンター", "Đóng gói phụ tùng xuất khẩu", "Export parts packing", "輸出梱包", "obu", 1300, "day", 10, 15000, ["packing"], ["forklift_op"], [], 1, 7, 25, ["Bắt đầu trong 1 tuần"]],
  ["kariya-pack", "Kariya Kitting", "刈谷キッティング", "Soạn & đóng gói linh kiện", "Parts kitting & packing", "部品キッティング", "kariya", 1320, "rotating", 18, 17000, ["packing"], ["assembly"], [], 1, 14, 30, ["Việc nhẹ"]],

  // Ngành thực phẩm (visa SSW sản xuất không làm được → bị ẩn bởi bộ lọc visa)
  ["toyokawa-food", "Toyokawa Noodle", "豊川製麺", "Dây chuyền mì udon", "Udon production line", "うどん製造", "toyokawa", 1250, "night", 10, 14000, ["packing"], [], [], 1, 14, 20, ["Ăn ca miễn phí"], { field: "food" }],
  ["nagoya-food2", "Nagoya Delica", "名古屋デリカ", "Chế biến món ăn sẵn", "Ready-meal processing", "惣菜製造", "nagoya", 1280, "rotating", 12, null, ["packing"], [], [], 1, 7, 35, [], { field: "food" }],
  ["ichinomiya-food", "Ichinomiya Bakery", "一宮ベーカリー", "Dây chuyền bánh mì", "Bakery line", "パン製造", "ichinomiya", 1260, "night", 8, 13000, ["packing"], [], [], 1, 14, 18, ["Ký túc xá rẻ"], { field: "food" }],
  ["handa-food", "Handa Vinegar Works", "半田醸造", "Đóng chai giấm & nước sốt", "Vinegar & sauce bottling", "酢・ソース充填", "handa", 1270, "day", 10, 14000, ["packing"], [], [], 1, 21, 12, ["Chỉ ca ngày"], { field: "food", verified: false }],
  ["anjo-food", "Anjo Fresh Foods", "安城フレッシュフーズ", "Sơ chế rau củ", "Vegetable prep line", "野菜加工", "anjo", 1240, "day", 5, 13000, ["packing"], [], [], 1, 7, 15, [], { field: "food", verified: false }],
];

export const EXTRA_JOBS: Job[] = ROWS.map(([id, company, companyJa, title, titleEn, titleJa, city, hourly, shift, otHours, dorm, required, nice, certs, jlptMin, startWithinDays, headcount, perks, extra = {}], i) => ({
  id, company, companyJa, title, titleEn, titleJa,
  field: extra.field ?? "mfg",
  city, hourly, shift, otHours, dorm,
  attendanceBonus: extra.bonus ?? (i % 3 === 0 ? 15000 : 10000),
  required, nice, certs, jlptMin, startWithinDays, headcount,
  verified: extra.verified ?? i % 5 !== 4,
  ...(extra.isNewPlant ? { isNewPlant: true } : {}),
  ...(extra.contractMonths ? { contractMonths: extra.contractMonths, renewable: true } : {}),
  perks,
}));
