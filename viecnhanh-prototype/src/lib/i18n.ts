"use client";
import { CITIES, type CityId } from "./data";
import { useApp } from "./store";

/** Worker app language: Vietnamese (default), English, or Japanese (for demos & judges). */
export type WLang = "vi" | "ja" | "en";

export const useLang = (): WLang => useApp((s) => s.config.workerLang ?? "vi");
export const getLang = (): WLang => useApp.getState().config.workerLang ?? "vi";

const EN_DICT: Record<string, string> = {
  // Shell & navigation
  "Điều hướng chính": "Main navigation",
  "Việc làm": "Jobs",
  "Hồ sơ đã gửi": "Applications",
  "Tôi": "Me",
  "Tìm việc": "Search jobs",
  "Tìm theo nghề, công ty, thành phố…": "Search by role, company, city…",
  "Xoá từ khoá": "Clear search",
  "Ngôn ngữ": "Language",
  "Tài khoản": "Account",
  "Hồ sơ của tôi": "My profile",
  "Thông báo": "Notifications",
  "Quản lý hồ sơ": "Edit profile",
  "Giao diện": "Appearance",
  "Sáng": "Light",
  "Tối": "Dark",
  "Tự động": "Auto",
  "Đã đăng xuất": "Signed out",
  "Đăng xuất": "Sign out",
  "Quay lại": "Back",
  "Nhà máy": "Plant",

  // Filters & listing
  "Việc làm tại Aichi": "Jobs in Aichi",
  "Việc phù hợp với bạn": "Jobs matched to you",
  "Lương thực nhận rõ ràng": "Clear take-home pay estimates",
  "Xem việc hợp tay nghề của bạn": "See jobs matched to your skills",
  "Đăng nhập Zalo · 3 câu hỏi · miễn phí": "Zalo sign-in · 3 questions · free",
  "Đăng nhập": "Sign in",
  "Lọc nhanh": "Quick filters",
  "Rất phù hợp": "Great fit",
  "Có ký túc xá": "Dorm available",
  "Ca ngày": "Day shift",
  "Gần tôi": "Near me",
  "Có người Việt": "Vietnamese staff",
  "Thực nhận > ¥200k": "Take-home > ¥200k",
  "Kết quả": "Results",
  "Chưa có việc khớp bộ lọc": "No jobs match your filters",
  "Bỏ bớt bộ lọc hoặc thử từ khác.": "Remove a filter or try another keyword.",
  "Xoá bộ lọc": "Clear filters",
  "Chưa có việc phù hợp với visa hiện tại": "No matching jobs for your current visa yet",
  "Kiểm tra lại thông tin visa và tay nghề trong hồ sơ.": "Review your visa and skills in your profile.",
  "Kiểm tra hồ sơ": "Review profile",
  "Việc nổi bật": "Featured jobs",
  "Việc phù hợp nhất với bạn": "Best match for you",
  "Có người Việt đang làm": "Vietnamese workers here",
  "Nhà máy mới đang tuyển gấp": "New plants hiring urgently",
  "Việc khác trong ngành": "Other jobs in this field",
  "Lương và mốc thời gian là ước tính. Bạn luôn là người quyết định ứng tuyển.": "Pay and dates are estimates. You always decide whether to apply.",

  // Right rail (jobs/page.tsx)
  "AI tóm tắt về bạn": "Your AI summary",
  "Chưa đăng nhập": "Not signed in",
  "Đăng nhập bằng Zalo, trả lời 3 câu để AI chấm mức phù hợp cho từng việc.": "Sign in with Zalo and answer 3 questions so AI scores your fit for each job.",
  "Sửa hồ sơ": "Edit profile",
  "Tay nghề": "Skills",
  "Tiếng Nhật": "Japanese",
  "Visa": "Visa",
  "Sẵn sàng": "Available",
  "Trợ lý AI của bạn": "Your AI assistant",
  "Hỏi về lương, ký túc xá hay ngày bắt đầu, bằng tiếng Việt.": "Ask about take-home pay, dorms, or start dates.",
  "“Việc nào lương thực nhận trên ¥200k?”": "“Which jobs pay over ¥200k take-home?”",

  // Job row & pass
  "Đã ứng tuyển": "Applied",
  "/tháng": "/mo",
  "Đã xác minh": "Verified",
  "Đang xác minh": "Verifying",
  "KINTRA đã xác minh": "Verified by KINTRA",
  "Đang tuyển": "Hiring",
  "Không hợp visa": "Visa mismatch",
  "thực nhận mỗi tháng · ước tính": "est. monthly take-home",
  " · cùng thành phố với bạn": " · in your city",

  // Bento & PeersTile
  "Người Việt ở đây": "Vietnamese coworkers",
  "Chưa có người Việt nào làm ở đây. Bạn có thể là người đầu tiên.": "No Vietnamese workers here yet. You could be the first.",
  "Xem việc có người Việt": "See jobs with Vietnamese coworkers",
  "Hỏi Senpai · ẩn danh": "Ask a Senpai · anonymous",
  "Tiêu chí": "Criteria",
  "HR còn bao lâu": "HR response timer",
  "HR trả lời trong": "HR replies in",
  "Thời gian HR còn lại": "Time remaining for HR reply",
  "Lộ trình tay nghề": "Skill path",
  "Xem cách": "See how",
  "Đủ điều kiện ứng tuyển": "Ready to apply",
  "Hỏi trợ lý AI": "Ask AI assistant",

  // Job detail
  "Không tìm thấy việc này.": "Job not found.",
  "Về danh sách": "Back to jobs",
  "Nhà máy mới": "New plant",
  "Đăng nhập để AI chấm mức phù hợp": "Sign in for AI match scoring",
  "AI chấm từ hồ sơ của bạn": "Scored by AI from your profile",
  "Thông tin chính": "Key details",
  "Thực nhận/tháng": "Monthly take-home",
  "ước tính": "estimate",
  "Địa điểm": "Location",
  "Bắt đầu sớm nhất": "Earliest start",
  "dự kiến ›": "est. ›",
  "Mục trong tin tuyển dụng": "Job sections",
  "Vì sao hợp": "Why it fits",
  "Lương & khấu trừ": "Pay & deductions",
  "Công việc": "Job details",
  "AI gợi ý": "AI insight",
  "Việc này có hợp với bạn không?": "Is this job a good fit?",
  "Đăng nhập bằng Zalo, trả lời 3 câu. AI kiểm visa, chấm mức phù hợp và cho biết bạn còn thiếu gì.": "Sign in with Zalo and answer 3 questions. AI checks visa eligibility, scores fit, and flags missing items.",
  "Đăng nhập để xem mức phù hợp": "Sign in to see match fit",
  "Vì sao việc này hợp với bạn": "Why this job fits you",
  "Hiểu mức phù hợp của bạn": "Understand your match",
  "Visa của bạn không cho phép việc này": "Your residence status doesn't allow this job",
  "Tăng mức": "Boost fit",
  "AI đánh giá từng tiêu chí": "AI criterion breakdown",
  "Xem lộ trình pháp lý đến ngày đi làm": "View legal timeline to day one",
  "Bắt đầu sớm nhất · xem lộ trình": "Earliest start · view timeline",
  "Hợp đồng": "Contract",
  "Nếu không gia hạn, KINTRA xếp việc tiếp trong 24h.": "If not renewed, KINTRA matches your next job within 24h.",
  "Ca làm": "Shift",
  "Tăng ca": "Overtime",
  "Ký túc xá": "Dormitory",
  "Không": "None",
  "Kỹ năng": "Required skills",
  "Ký túc xá & tiện ích · ảnh minh hoạ": "Dorm & facilities · illustrative photos",
  "Tư cách lưu trú yêu cầu:": "Eligible residence statuses:",
  "hoặc": "or",
  "Công ty và việc tương tự": "Company & similar jobs",
  "Xác minh": "Verification",
  "Việc tương tự": "Similar jobs",
  "Đăng nhập để ứng tuyển · miễn phí": "Sign in to apply · free",
  "Xem lời mời phỏng vấn": "View interview invite",
  "Đã ứng tuyển · xem trạng thái": "Applied · view status",
  "Cập nhật kinh nghiệm": "Update experience",
  "Vẫn ứng tuyển ngay": "Apply anyway",
  "Không ứng tuyển được với visa hiện tại": "Cannot apply with current visa",
  "Đã gửi hồ sơ": "Application sent",
  "Gửi hồ sơ cho nhà máy?": "Send application to plant?",
  "Xem trạng thái hồ sơ": "View application status",
  "Chụp thẻ cư trú để tiếp tục": "Scan residence card to continue",
  "Gửi hồ sơ": "Submit application",
  "Trả lời câu hỏi của nhà máy": "Answer employer questions",
  "Xem lại": "Review",
  "Đang chờ · cam kết 24h": "Pending · 24h guarantee",
  "HR phải trả lời trước": "HR must reply before",
  "Xác minh theo tầng": "Tiered verification",
  "Xem việc không cần giấy tờ · Ứng tuyển cần thẻ cư trú": "Browse without documents · Residence card needed to apply",
  "Nhà máy chỉ được nhận người có tư cách lưu trú đúng ngành. Chụp 1 lần, dùng cho mọi đơn.": "Plants can only hire workers with eligible residence status. Scan once, reuse for all applications.",
  "Bạn chưa ở mức Rất phù hợp.": "You're not at Great fit yet.",
  "Hồ sơ vẫn được gửi, HR sẽ thấy nhãn “ứng tuyển khi chưa đủ tiêu chí”.": "Your application will still be sent, tagged “applied below criteria” for HR.",
  "Đã chọn sẵn câu trả lời gợi ý. Hãy kiểm tra và đổi nếu chưa đúng với bạn.": "Suggested answers are preselected. Review and change any that don't match you.",
  "Thẻ cư trú đã kiểm tra": "Residence card checked",
  "HR thấy tư cách lưu trú, không thấy số thẻ": "HR sees your visa status, never your card number",
  "Kỹ năng, chứng chỉ, tiếng Nhật": "Skills, certifications, Japanese level",
  "Kèm mức phù hợp và lý do": "With match score and reasons",
  "Ngày bắt đầu và khu vực": "Start date and area",
  "Tài khoản ngân hàng chỉ hỏi sau khi được duyệt": "Bank details are only requested after approval",
  "Xem 3 việc khác": "See 3 other jobs",

  // start.ts & legalPath
  "Đổi công ty cần xin chuyển đổi tư cách lưu trú, thường mất khoảng 6–9 tuần. Mùa cao điểm tháng 3–4 có thể lâu hơn.": "Changing employers requires a Change of Status application (~6–9 weeks, longer during the Mar–Apr peak).",
  "Tư cách lưu trú của bạn không cần xin chuyển đổi.": "Your residence status doesn't require a status-change application.",
  "HR duyệt hồ sơ": "HR approves application",
  "HR trả lời trong 24 giờ. Bạn nhận lời mời phỏng vấn qua app và Zalo OA.": "HR replies within 24 hours. You receive interview invites in-app and via Zalo OA.",
  "Ngày đầu đi làm": "First day at work",
  "Học an toàn bằng tiếng Việt trước ca đầu tiên. Mang thẻ cư trú.": "Complete safety training in Vietnamese before your first shift. Bring your residence card.",
  "Công ty gửi giấy tờ": "Company sends documents",
  "Công ty mới gửi hợp đồng và giấy tờ cần cho đơn. KINTRA nhắc công ty nếu chậm.": "The new employer sends your contract and immigration forms. KINTRA follows up if delayed.",
  "Nộp đơn chuyển đổi tư cách lưu trú": "File Change of Status",
  "Nộp tại Cục Xuất nhập cảnh Nagoya. Bắt buộc theo luật khi người có Kỹ năng đặc định đổi công ty.": "Filed at Nagoya Immigration Bureau. Legally required when SSW holders switch employers.",
  "Cục Xuất nhập cảnh xét đơn": "Immigration review",
  "Thường 41–64 ngày theo thống kê của Cục. Trong lúc chờ, bạn vẫn làm ở chỗ cũ nếu còn hợp đồng.": "Typically 41–64 days per ISA statistics. You may keep working under your current contract while waiting.",
  "Nhận thẻ cư trú mới": "Receive new residence card",
  "Thẻ mới ghi công ty mới. Từ đây bạn được phép đi làm chỗ mới.": "Your new card lists the new employer. Once received, you can start working there.",

  // Calendar / Zalo
  "Nhắc lịch KINTRA": "KINTRA reminder",
};

function translateEn(vi: string): string {
  if (EN_DICT[vi]) return EN_DICT[vi];

  let m: RegExpMatchArray | null;
  if ((m = vi.match(/^(\d+) việc$/))) return `${m[1]} jobs`;
  if ((m = vi.match(/^Cần (\d+) người$/))) return `${m[1]} openings`;
  if ((m = vi.match(/^(\d+) người$/))) return `${m[1]} openings`;
  if ((m = vi.match(/^(\d+) người Việt$/))) return `${m[1]} Vietnamese staff`;
  if ((m = vi.match(/^(\d+) người Việt đang làm ở đây$/))) return `${m[1]} Vietnamese workers here`;
  if ((m = vi.match(/^Còn (\d+) bước để rất phù hợp$/))) return `${m[1]} step${m[1] === "1" ? "" : "s"} to Great fit`;
  if ((m = vi.match(/^Thử việc (\d+) tháng( · có thể gia hạn)?$/)))
    return `${m[1]}-month probation${m[2] ? " · renewable" : ""}`;
  if ((m = vi.match(/^Bắt đầu (.+?) · dự kiến$/))) return `Starts ${m[1]} · est.`;
  if ((m = vi.match(/^(.+?) · dự kiến$/))) return `${m[1]} · est.`;
  if ((m = vi.match(/^Bắt đầu sớm nhất (.+?), dự kiến\. Xem lộ trình( pháp lý)?$/)))
    return `Earliest start ${m[1]} (est.). View timeline`;
  if ((m = vi.match(/^cách ~(\d+) km$/))) return `~${m[1]} km away`;
  if ((m = vi.match(/^ · cách ~(\d+) km$/))) return ` · ~${m[1]} km away`;
  if ((m = vi.match(/^Gần chỗ bạn ở · dưới (\d+) km$/))) return `Near you · under ${m[1]} km`;
  if ((m = vi.match(/^~(\d+) giờ\/tháng$/))) return `~${m[1]} hrs/mo`;
  if ((m = vi.match(/^Có · (.+)$/))) return `Yes · ${m[1]}`;
  if ((m = vi.match(/^Từ (.+)$/))) return `${m[1]}+`;
  if ((m = vi.match(/^Lưu (.+)$/))) return `Save ${m[1]}`;
  if ((m = vi.match(/^Bỏ lưu (.+)$/))) return `Unsave ${m[1]}`;
  if ((m = vi.match(/^Chào (.+?) · (.+), Aichi$/))) return `Hi ${m[1]} · ${m[2]}, Aichi`;
  if ((m = vi.match(/^Nhà xưởng (.+?) \(minh hoạ\)$/))) return `${m[1]} plant (illustrative)`;
  if ((m = vi.match(/^Tiện ích (.+?) (\d+) \(minh hoạ\)$/))) return `${m[1]} facility ${m[2]} (illustrative)`;
  if ((m = vi.match(/^Thông báo, (\d+) hồ sơ đang chờ$/))) return `Notifications, ${m[1]} pending`;
  if ((m = vi.match(/^(\d+) hồ sơ đang chờ$/))) return `${m[1]} pending`;
  if ((m = vi.match(/^Đã gửi cho (.+)$/))) return `Sent to ${m[1]}`;
  if ((m = vi.match(/^Nhà máy hỏi thêm (\d+) câu$/))) return `${m[1]} extra employer question${m[1] === "1" ? "" : "s"}`;
  if ((m = vi.match(/^Ứng tuyển · HR trả lời trong (\d+)h$/))) return `Apply · HR replies in ${m[1]}h`;
  if ((m = vi.match(/^Nếu HR chưa trả lời trong (\d+) giờ, bạn được gợi ý ngay 3 việc khác\.( Kết quả báo trong app và qua Zalo OA\.)?$/)))
    return `If HR doesn't reply within ${m[1]} hours, we'll immediately suggest 3 other jobs.${m[2] ? " Updates arrive in-app and on Zalo OA." : ""}`;
  if ((m = vi.match(/^AI chấm lại: (.+?) → (.+)$/))) {
    const mapFit = (s: string) => EN_DICT[s] ?? (s === "Có thể phù hợp" ? "Possible fit" : s === "Chưa phù hợp" ? "Not a fit yet" : s);
    return `AI rescored: ${mapFit(m[1])} → ${mapFit(m[2])}`;
  }
  if ((m = vi.match(/^(.+?), (.+?), thực nhận (.+?) mỗi tháng, bắt đầu sớm nhất (.+?), dự kiến$/)))
    return `${m[1]}, ${m[2]}, ${m[3]}/mo est. take-home, earliest start ${m[4]} (est.)`;
  if ((m = vi.match(/^(.+?) Trong lúc chờ: vẫn làm ở chỗ cũ nếu còn hợp đồng · ứng lương theo ngày công vẫn dùng được\.$/)))
    return `${m[1]} While waiting, you can keep working at your current job and access earned wage advances.`;
  if ((m = vi.match(/^(.+?) đang xem hồ sơ của bạn$/))) return `${m[1]} is reviewing your application`;
  if ((m = vi.match(/^(.+?) mời bạn phỏng vấn · đã gửi qua Zalo OA$/))) return `${m[1]} invited you to an interview · sent via Zalo OA`;
  if ((m = vi.match(/^(.+?) đã trả lời · xem lý do và gợi ý$/))) return `${m[1]} replied · see reason & suggestions`;
  if ((m = vi.match(/^(.+?) chưa trả lời sau 24h · có 3 việc gợi ý$/))) return `${m[1]} didn't reply in 24h · 3 suggested jobs ready`;

  return vi;
}

/** t("tiếng Việt", "日本語", "English?") theo ngôn ngữ đang chọn. */
export function useT() {
  const lang = useLang();
  return (vi: string, ja: string, en?: string) => (lang === "ja" ? ja : lang === "en" ? (en ?? translateEn(vi)) : vi);
}

/** Dùng ngoài component (toast, hàm tiện ích). */
export const tNow = (vi: string, ja: string, en?: string) => {
  const lang = useApp.getState().config.workerLang ?? "vi";
  return lang === "ja" ? ja : lang === "en" ? (en ?? translateEn(vi)) : vi;
};

export const jobTitle = (job: { title: string; titleEn?: string; titleJa?: string }, lang: WLang) =>
  lang === "ja" ? (job.titleJa || job.title) : lang === "en" ? (job.titleEn || job.title) : job.title;

export const cityName = (city: CityId, lang: WLang) => (lang === "ja" ? CITIES[city].ja : CITIES[city].vi);

const PERK_MAP: Record<string, { en: string; ja: string }> = {
  "Nhà máy mới · mở 12/2026": { en: "New plant · opens 12/2026", ja: "新工場 · 2026年12月開設" },
  "Ký túc xá 1 người/phòng": { en: "Private dorm room", ja: "個室寮" },
  "Xe đưa đón từ ga": { en: "Station shuttle bus", ja: "駅からの送迎バス" },
  "Chỉ ca ngày": { en: "Day shift only", ja: "日勤のみ" },
  "Nghỉ thứ 7 & CN": { en: "Sat & Sun off", ja: "土日休み" },
  "Gần ga JR Kariya": { en: "Near JR Kariya Sta.", ja: "JR刈谷駅近く" },
  "Trợ cấp đi lại": { en: "Commute allowance", ja: "交通費支給" },
  "Lương cao nhất khu vực": { en: "Top pay in area", ja: "地域トップクラスの時給" },
  "Không cần đứng máy": { en: "No machine operation", ja: "マシン操作なし" },
  "Ký túc xá rẻ": { en: "Low-cost dorm", ja: "格安寮" },
  "Phụ cấp ca đêm 25%": { en: "25% night-shift allowance", ja: "夜勤手当25%" },
  "Xe đưa đón": { en: "Shuttle bus", ja: "送迎バス" },
  "Thưởng 2 lần/năm": { en: "Bonuses 2x/year", ja: "賞与年2回" },
  "Ký túc xá có wifi": { en: "Dorm with Wi-Fi", ja: "寮にWi-Fiあり" },
  "Tăng lương sau 6 tháng": { en: "Raise after 6 months", ja: "6か月後に昇給" },
  "Gần biển, yên tĩnh": { en: "Quiet coastal area", ja: "海近く・静かな環境" },
  "Phụ cấp tay nghề": { en: "Skill allowance", ja: "技能手当あり" },
  "Bếp chung trong ký túc xá": { en: "Shared dorm kitchen", ja: "寮に共用キッチン" },
  "Gần nhà · đi xe đạp được": { en: "Bikeable distance", ja: "自転車通勤可" },
  "Ca ngày cố định": { en: "Fixed day shift", ja: "固定日勤" },
  "Việc nhẹ, ít tăng ca": { en: "Light work, low OT", ja: "軽作業・残業少なめ" },
  "Lương cao": { en: "High pay", ja: "高時給" },
  "Đào tạo máy 5 trục": { en: "5-axis CNC training", ja: "5軸加工研修あり" },
  "Phụ cấp ca đêm": { en: "Night-shift allowance", ja: "夜勤手当あり" },
  "Thưởng tay nghề hàng quý": { en: "Quarterly skill bonus", ja: "四半期技能賞与" },
  "Phụ cấp chứng chỉ JIS": { en: "JIS cert. allowance", ja: "JIS資格手当" },
  "Lương cao nhất ngành hàn": { en: "Top welding pay", ja: "溶接業界トップ時給" },
  "Đồ bảo hộ cấp miễn phí": { en: "Free PPE provided", ja: "保護具無料支給" },
  "Tuyển số lượng lớn": { en: "Mass hiring", ja: "大量募集" },
  "Có người Việt hướng dẫn": { en: "Vietnamese trainer on-site", ja: "ベトナム人指導員あり" },
  "Việc nhẹ, phù hợp nữ": { en: "Light work", ja: "軽作業" },
  "Căng tin ¥300/bữa": { en: "¥300 cafeteria meals", ja: "食堂1食300円" },
  "Môi trường sạch, điều hoà": { en: "Clean & air-conditioned", ja: "空調完備・クリーン環境" },
  "Nhà máy xe điện mới": { en: "New EV plant", ja: "新EV工場" },
  "Ký túc xá mới xây": { en: "Brand-new dorm", ja: "新築寮" },
  "Ngồi làm, không đứng máy": { en: "Seated inspection", ja: "座り作業" },
  "Đào tạo máy đo 3D": { en: "CMM training", ja: "三次元測定機研修" },
  "Gần trung tâm Nagoya": { en: "Near central Nagoya", ja: "名古屋中心部近く" },
  "Ký túc xá ¥15.000": { en: "¥15,000/mo dorm", ja: "寮費月15,000円" },
  "Phụ cấp móc cẩu": { en: "Slinging allowance", ja: "玉掛け手当" },
  "Việc ổn định, ít tăng ca": { en: "Steady work, low OT", ja: "安定勤務・残業少なめ" },
  "Thưởng an toàn hàng tháng": { en: "Monthly safety bonus", ja: "無事故手当（毎月）" },
  "Gần đường cao tốc, có xe đưa đón": { en: "Near highway, shuttle bus", ja: "IC近く・送迎あり" },
  "Bắt đầu trong 1 tuần": { en: "Start within 1 week", ja: "1週間以内に勤務開始" },
  "Việc nhẹ": { en: "Light work", ja: "軽作業" },
  "Ăn ca miễn phí": { en: "Free shift meals", ja: "まかない無料" },
};

export const perkLabel = (perk: string, lang: WLang) =>
  lang === "vi" ? perk : (PERK_MAP[perk]?.[lang] ?? perk);
