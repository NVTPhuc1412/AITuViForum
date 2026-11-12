import { prisma } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function testBackend() {
  console.log('🧪 [Test Backend API & Logic] Bắt đầu kiểm tra hệ thống...');

  // 1. Kiểm tra Database connection & Records
  const userCount = await prisma.user.count();
  const docCount = await prisma.document.count();
  const catCount = await prisma.category.count();
  const logCount = await prisma.searchClickLog.count();

  console.log(`📊 Hiện có: ${userCount} users, ${docCount} documents, ${catCount} categories, ${logCount} logs.`);
  if (docCount < 50) {
    throw new Error('Số lượng documents chưa đạt yêu cầu tối thiểu 50 bài!');
  }

  // 2. Kiểm tra Authentication & Token
  const admin = await prisma.user.findUnique({ where: { email: 'admin@astroai.vn' } });
  if (!admin) throw new Error('Không tìm thấy Super Admin test user');

  const isValidPassword = await bcrypt.compare('Password123@', admin.password_hash);
  if (!isValidPassword) throw new Error('Mật khẩu của Super Admin không khớp');

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    process.env.JWT_SECRET || 'astroai_super_secret_jwt_key_2026',
    { expiresIn: '1h' }
  );
  console.log('🔑 JWT Token generation: OK');

  // 3. Kiểm tra Search LIKE trên SQLite
  const searchQuery = 'Cung Mệnh';
  const matchedDocs = await prisma.document.findMany({
    where: {
      OR: [
        { title: { contains: searchQuery } },
        { summary: { contains: searchQuery } },
        { plain_text: { contains: searchQuery } },
      ],
      status: 'PUBLISHED',
    },
    take: 5,
  });
  console.log(`🔍 Tìm kiếm LIKE '${searchQuery}': Tìm thấy ${matchedDocs.length} bài viết.`);
  if (matchedDocs.length === 0) {
    throw new Error('Tìm kiếm LIKE không trả về kết quả nào!');
  }

  // 4. Kiểm tra ghi nhận Search & Click Log
  const newLog = await prisma.searchClickLog.create({
    data: {
      user_id: admin.id,
      query_string: 'Test automated query',
      clicked_doc_id: matchedDocs[0].id,
      timestamp: new Date(),
    },
  });
  console.log(`📝 Ghi nhận Log thành công: Log ID = ${newLog.id}`);

  // 5. Kiểm tra Roles
  const roles = await prisma.user.findMany({ select: { role: true } });
  const uniqueRoles = new Set(roles.map(r => r.role));
  console.log('🛡️ Các Roles có trong hệ thống:', Array.from(uniqueRoles));

  console.log('✅ Toàn bộ bài kiểm tra Backend & Database đã PASS 100%!');
}

testBackend()
  .catch((err) => {
    console.error('❌ Thất bại:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
