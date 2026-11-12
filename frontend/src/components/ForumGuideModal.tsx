import React, { useState } from 'react';
import {
  X,
  Layers,
  MessageSquare,
  Users,
  Search,
  Layout,
  Bell,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart3,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface ForumGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForumGuideModal: React.FC<ForumGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'components' | 'management'>('components');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-night-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-night-900 border border-night-line rounded-lg shadow-2xl flex flex-col overflow-hidden text-parchment"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-night-line bg-night-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-brass/10 border border-brass/40 flex items-center justify-center text-brass">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-parchment flex items-center gap-2">
                <span>Cẩm nang Diễn đàn Trực tuyến</span>
                <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-brass/15 text-brass-light border border-brass/30 font-medium">
                  AstroAI Playbook
                </span>
              </h2>
              <p className="text-xs text-parchment-dim">
                Cấu trúc tiêu chuẩn của một Forum & Phương pháp quản trị vận hành cộng đồng hiệu quả
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-parchment-dim hover:text-parchment hover:bg-night-800 rounded transition"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-night-line bg-night-950/40 px-6">
          <button
            onClick={() => setActiveTab('components')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'components'
                ? 'border-brass text-brass-light'
                : 'border-transparent text-parchment-dim hover:text-parchment'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>I. Những thành phần cần có của một Forum</span>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'management'
                ? 'border-brass text-brass-light'
                : 'border-transparent text-parchment-dim hover:text-parchment'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>II. Cách quản lý một Forum hiệu quả</span>
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {activeTab === 'components' ? (
            <div className="space-y-6">
              <div className="p-4 bg-night-800/60 border border-brass/20 rounded-lg">
                <p className="text-xs text-parchment-muted leading-relaxed">
                  Một diễn đàn trực tuyến chuẩn cần được cấu trúc rõ ràng để người dùng dễ dàng thảo luận và tìm kiếm thông tin:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Categories & Boards */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-brass-light font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>1. Hệ thống Danh mục và Chủ đề (Categories & Boards)</span>
                  </div>
                  <p className="text-xs text-parchment-muted leading-relaxed">
                    Phân chia các chuyên mục lớn nhỏ khác nhau (ví dụ: Quy định chung, Thảo luận chung, Góc học tập, Giải trí, Mua bán...). Giống như việc sắp xếp các phòng trong một ngôi nhà vậy đó bạn.
                  </p>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-brass">✦ Thực tế tại AstroAI:</span> Phân mục theo Khoa học AI, Kỹ thuật Prompting, Nghiên cứu Search Engine, Chia sẻ dự án.
                  </div>
                </div>

                {/* 2. Threads & Posts */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-jade-light font-semibold">
                    <MessageSquare className="w-4 h-4" />
                    <span>2. Hệ thống Bài viết (Threads & Posts)</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-parchment-muted">
                    <p>
                      <strong className="text-parchment">Chủ đề (Thread/Topic):</strong> Nơi người dùng mở ra một vấn đề mới để bàn luận.
                    </p>
                    <p>
                      <strong className="text-parchment">Bài phản hồi (Reply/Post):</strong> Các ý kiến đóng góp, trả lời bên dưới chủ đề đó.
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-jade">✦ Thực tế tại AstroAI:</span> Hỗ trợ viết bài bằng Markdown, bình luận thảo luận đa chiều, đính kèm hình ảnh minh họa.
                  </div>
                </div>

                {/* 3. Users & Roles */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-lacquer-light font-semibold">
                    <Users className="w-4 h-4" />
                    <span>3. Hệ thống Thành viên và Phân quyền (Users & Roles)</span>
                  </div>
                  <p className="text-xs text-parchment-muted leading-relaxed">
                    Quản lý tài khoản đăng ký, đăng nhập, hồ sơ cá nhân (profile), chữ ký và điểm uy tín. Phân quyền rõ ràng: Khách (Guest), Thành viên (Member), Kiểm duyệt viên (Moderator), Quản trị viên (Admin).
                  </p>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-lacquer-light">✦ Thực tế tại AstroAI:</span> Kiến trúc RBAC 4 vai trò (Super Admin, Content Manager, Moderator, SEO Specialist) + Member.
                  </div>
                </div>

                {/* 4. Search & Filter */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-brass-light font-semibold">
                    <Search className="w-4 h-4" />
                    <span>4. Công cụ Tìm kiếm và Lọc (Search & Filter)</span>
                  </div>
                  <p className="text-xs text-parchment-muted leading-relaxed">
                    Giúp người dùng tìm nhanh các bài viết cũ, từ khóa, hoặc lọc bài theo độ hot, mới nhất, chưa đọc.
                  </p>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-brass">✦ Thực tế tại AstroAI:</span> Động cơ Python Okapi BM25 & TF-IDF phân tích tiếng Việt chuyên sâu, lọc theo ngày & Tags.
                  </div>
                </div>

                {/* 5. UI/UX */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-jade-light font-semibold">
                    <Layout className="w-4 h-4" />
                    <span>5. Giao diện và Trải nghiệm (UI/UX)</span>
                  </div>
                  <p className="text-xs text-parchment-muted leading-relaxed">
                    Thiết kế trực quan, thân thiện, tương thích tốt trên cả máy tính lẫn điện thoại (responsive).
                  </p>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-jade">✦ Thực tế tại AstroAI:</span> Bảng màu sáng, tối giản, tối ưu hiển thị di động với Tailwind CSS.
                  </div>
                </div>

                {/* 6. Notifications & Messaging */}
                <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2 hover:border-brass/30 transition">
                  <div className="flex items-center gap-2.5 text-lacquer-light font-semibold">
                    <Bell className="w-4 h-4" />
                    <span>6. Hệ thống Thông báo và Nhắn tin (Notifications & Messaging)</span>
                  </div>
                  <p className="text-xs text-parchment-muted leading-relaxed">
                    Thông báo khi có người trả lời bài viết, nhắc tên (tag), hoặc nhắn tin riêng (inbox) giữa các thành viên.
                  </p>
                  <div className="pt-2 text-[11px] text-parchment-dim flex items-center gap-1.5 border-t border-night-line">
                    <span className="text-lacquer-light">✦ Thực tế tại AstroAI:</span> Chuông báo cập nhật phản hồi bài viết, số lượt thích và trạng thái kiểm duyệt bài viết.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 bg-night-800/60 border border-jade/20 rounded-lg">
                <p className="text-xs text-parchment-muted leading-relaxed">
                  Để một diễn đàn phát triển bền vững và không bị loãng, ban quản trị cần kết hợp giữa <strong>chính sách cộng đồng minh bạch</strong>, <strong>quy trình kiểm duyệt chặt chẽ</strong>, và <strong>công nghệ hỗ trợ tự động</strong>. Dưới đây là 5 trụ cột quản lý hiệu quả:
                </p>
              </div>

              {/* Pillar 1 */}
              <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2">
                <div className="flex items-center gap-2.5 text-brass-light font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. Xây dựng Bộ Quy tắc Cộng đồng minh bạch (Code of Conduct & Rules)</span>
                </div>
                <ul className="text-xs text-parchment-muted space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Quy định rõ ràng:</strong> Nghiêm cấm spam quảng cáo rác, công kích cá nhân, xúc phạm tôn giáo/chính trị và đạo văn tri thức.
                  </li>
                  <li>
                    <strong>Thang chế tài 3 bước (3-Strike Rule):</strong> Nhắc nhở thiện chí qua tin nhắn → Tạm khóa tương tác 3 đến 7 ngày → Khóa tài khoản vĩnh viễn (Ban Nick & Chặn dải IP vi phạm).
                  </li>
                  <li>
                    <strong>Công khai minh bạch:</strong> Luôn thông báo lý do cụ thể khi xóa bài hoặc khóa tài khoản để tránh tranh chấp không đáng có.
                  </li>
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2">
                <div className="flex items-center gap-2.5 text-jade-light font-semibold">
                  <Users className="w-4 h-4" />
                  <span>2. Đội ngũ Kiểm duyệt chuyên trách & Quy trình SLA (Moderation Workflow)</span>
                </div>
                <ul className="text-xs text-parchment-muted space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Phân công theo thế mạnh:</strong> Bổ nhiệm Moderator phụ trách từng chuyên mục chuyên sâu (ví dụ: Mod am hiểu học thuật giám sát Box Luận bàn, Mod kỹ thuật quản lý Box Công nghệ).
                  </li>
                  <li>
                    <strong>Cam kết thời gian xử lý (SLA):</strong> Xử lý các bài viết bị người dùng bấm Báo cáo (Flag/Report) trong vòng tối đa 2 đến 4 giờ.
                  </li>
                  <li>
                    <strong>Nhật ký kiểm duyệt (Audit Logs):</strong> Mọi hành động ẩn bài, duyệt bài hay cấm thành viên đều phải lưu vết để Super Admin kiểm tra chéo, tránh lạm quyền.
                  </li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2">
                <div className="flex items-center gap-2.5 text-lacquer-light font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  <span>3. Chiến lược Nuôi dưỡng Nội dung & Kích hoạt Thảo luận (Content & Engagement)</span>
                </div>
                <ul className="text-xs text-parchment-muted space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Vượt qua giai đoạn khởi đầu (Cold Start):</strong> Ban quản trị và nhóm nòng cốt chủ động tạo 50 - 100 chủ đề thảo luận có chất lượng cao (Seed Content) để tạo cảm giác diễn đàn đang sôi động.
                  </li>
                  <li>
                    <strong>Tôn vinh thành viên tích cực:</strong> Áp dụng hệ thống Điểm uy tín (Reputation Score), gắn Huy hiệu (Expert/Master Badge) cho các đóng góp giá trị.
                  </li>
                  <li>
                    <strong>Ghim chủ đề đinh (Sticky/Pinned Topics):</strong> Giữ các bài quy định, cẩm nang người mới bắt đầu và chủ đề hot ở đầu mỗi chuyên mục.
                  </li>
                </ul>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2">
                <div className="flex items-center gap-2.5 text-brass-light font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>4. Ứng dụng Công nghệ Tìm kiếm & Bộ lọc Chống Spam Tự động</span>
                </div>
                <ul className="text-xs text-parchment-muted space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Chống tạo chủ đề trùng lặp:</strong> Tận dụng động cơ tìm kiếm thông minh (như BM25/TF-IDF) để tự động gợi ý các chủ đề có sẵn khi thành viên đang gõ tiêu đề đăng bài.
                  </li>
                  <li>
                    <strong>Bảo vệ tự động:</strong> Giới hạn tần suất đăng bài (Rate Limiting), tự động gắn cờ các tài khoản gửi nhiều liên kết lạ hoặc chứa từ khóa spam.
                  </li>
                  <li>
                    <strong>Sao lưu & An toàn dữ liệu:</strong> Tự động backup cơ sở dữ liệu hàng ngày và áp dụng xác thực mã hóa an toàn.
                  </li>
                </ul>
              </div>

              {/* Pillar 5 */}
              <div className="p-4 bg-night-850 border border-night-line rounded-lg space-y-2">
                <div className="flex items-center gap-2.5 text-jade-light font-semibold">
                  <BarChart3 className="w-4 h-4" />
                  <span>5. Đo lường Chỉ số Sức khỏe & Hành vi Người dùng (Forum Analytics)</span>
                </div>
                <ul className="text-xs text-parchment-muted space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Theo dõi Search & Click Logs:</strong> Xem người dùng đang tìm kiếm những từ khóa nào nhiều nhất (như trong Dashboard SEO của AstroAI) để nắm bắt thị hiếu cộng đồng và mở các box chuyên mục mới.
                  </li>
                  <li>
                    <strong>Tỷ lệ phản hồi (Reply Rate):</strong> Đo lường phần trăm các chủ đề nhận được câu trả lời trong vòng 24 giờ để đảm bảo không người dùng nào bị lãng quên.
                  </li>
                  <li>
                    <strong>DAU / MAU:</strong> Tỷ lệ người dùng hoạt động hàng ngày và hàng tháng để đánh giá độ gắn bó của cộng đồng.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-night-line bg-night-950/60 flex items-center justify-between text-xs text-parchment-dim">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brass" />
            <span>Được áp dụng thực tế trên kiến trúc AstroAI Forum</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-brass text-night-950 font-bold rounded hover:bg-brass-light transition text-xs"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
