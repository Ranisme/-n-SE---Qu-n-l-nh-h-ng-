const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRolePermissions() {
  console.log('=== KIỂM TRA VAI TRÒ VÀ QUYỀN ===\n');

  // Get all roles with employee count and permissions
  const roles = await prisma.vaiTro.findMany({
    include: {
      quyen: {
        include: { quyen: true },
      },
      _count: {
        select: { nhanVien: true },
      },
    },
    orderBy: { ten: 'asc' },
  });

  console.log('📋 DANH SÁCH VAI TRÒ:\n');
  
  roles.forEach((role, index) => {
    console.log(`${index + 1}. ${role.ten}`);
    console.log(`   Mô tả: ${role.moTa || 'Không có'}`);
    console.log(`   👥 Số nhân viên: ${role._count.nhanVien}`);
    console.log(`   🔐 Số quyền: ${role.quyen.length}`);
    
    if (role.quyen.length > 0) {
      console.log(`   Quyền:`);
      role.quyen.slice(0, 5).forEach(vq => {
        console.log(`     - ${vq.quyen.ma}`);
      });
      if (role.quyen.length > 5) {
        console.log(`     ... và ${role.quyen.length - 5} quyền khác`);
      }
    }
    console.log('');
  });

  // Summary
  console.log('\n📊 TỔNG KẾT:');
  console.log(`   Tổng số vai trò: ${roles.length}`);
  console.log(`   Vai trò có nhân viên: ${roles.filter(r => r._count.nhanVien > 0).length}`);
  console.log(`   Vai trò chưa có nhân viên: ${roles.filter(r => r._count.nhanVien === 0).length}`);
  
  const totalEmployees = roles.reduce((sum, r) => sum + r._count.nhanVien, 0);
  console.log(`   Tổng nhân viên: ${totalEmployees}`);

  // Test: Get permissions for a specific user
  console.log('\n\n=== TEST: Lấy quyền của user "cashier" ===\n');
  
  const cashier = await prisma.taiKhoanNguoiDung.findUnique({
    where: { username: 'cashier' },
    include: {
      nhanVien: {
        include: {
          vaiTro: {
            include: {
              quyen: {
                include: { quyen: true },
              },
            },
          },
        },
      },
    },
  });

  if (cashier) {
    const permissions = cashier.nhanVien?.vaiTro?.quyen
      ?.map(vq => vq.quyen.ma)
      .filter(Boolean) || [];
    
    console.log(`Username: ${cashier.username}`);
    console.log(`Vai trò: ${cashier.nhanVien?.vaiTro?.ten}`);
    console.log(`Số quyền: ${permissions.length}`);
    console.log(`\nDanh sách quyền:`);
    permissions.forEach((perm, i) => {
      console.log(`  ${i + 1}. ${perm}`);
    });

    console.log(`\nKiểm tra quyền cụ thể:`);
    console.log(`  - REPORT_VIEW: ${permissions.includes('REPORT_VIEW') ? '✅ CÓ' : '❌ KHÔNG'}`);
    console.log(`  - PAYMENT_PROCESS: ${permissions.includes('PAYMENT_PROCESS') ? '✅ CÓ' : '❌ KHÔNG'}`);
    console.log(`  - ADMIN_MANAGE: ${permissions.includes('ADMIN_MANAGE') ? '✅ CÓ' : '❌ KHÔNG'}`);
  }

  await prisma.$disconnect();
}

testRolePermissions().catch(console.error);
