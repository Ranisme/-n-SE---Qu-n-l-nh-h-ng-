# 🍽️ Restaurant Management System (RMS)

A full-stack restaurant management system for handling orders, billing, inventory, staff management, and more.

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **PostgreSQL** - Database
- **Prisma ORM** - Database toolkit
- **JWT** - Authentication
- **Joi** - Validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Material UI (MUI)** - Component library
- **TanStack Query** - Data fetching
- **React Router** - Navigation
- **ApexCharts** - Data visualization

## 📋 Features

- **POS (Point of Sale)** - Visual table map, order management
- **Kitchen Display System (KDS)** - Real-time order queue for kitchen
- **Billing** - Invoice generation, multiple payment methods
- **Menu Management** - Categories, dishes, recipes
- **Inventory** - Stock tracking, low-stock alerts
- **Purchase Orders** - Supplier management, goods receiving
- **Reservations** - Table booking system
- **Customer Loyalty** - Points, membership tiers
- **HR Management** - Employees, shifts, attendance
- **Reports & Analytics** - Sales, menu performance, inventory

## 🔐 Role-Based Access Control (RBAC)

**✅ HOÀN CHỈNH** - Hệ thống phân quyền theo nguyên tắc "Frontend ẩn, Backend chặn"

### Roles & Permissions

| Role | Mô tả | Permissions chính |
|------|-------|-------------------|
| **Admin** | Quản trị viên | **Toàn quyền** - Đặc biệt: ACCOUNT_CREATE (Chỉ Admin) |
| **QuanLy** (Manager) | Quản lý | Báo cáo, Kho, Thực đơn, Duyệt hủy món, Nhân sự |
| **ThuNgan** (Cashier) | Thu ngân | Thanh toán, Mở/Đóng ca |
| **PhucVu** (Waiter) | Phục vụ | Tạo/Sửa order, Xem bàn (KHÔNG void món) |
| **Bep** (Chef) | Bếp | Kitchen Display, Cập nhật trạng thái món |
| **ThuKho** (Stockkeeper) | Thủ kho | Nhập hàng, Tạo đơn mua |

### Quy tắc đặc biệt
- ✅ **Chỉ Admin** thấy menu "Quản lý Tài khoản"
- ✅ **Chỉ Admin** có nút "Tạo tài khoản mới"
- ✅ **Phục vụ KHÔNG thể hủy món** đã gửi bếp (cần Manager duyệt)

### Tài liệu RBAC
📚 Xem hướng dẫn chi tiết:
- **[RBAC_QUICK_START.md](RBAC_QUICK_START.md)** - Bắt đầu nhanh
- **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Hướng dẫn đầy đủ
- **[RBAC_IMPLEMENTATION_SUMMARY.md](RBAC_IMPLEMENTATION_SUMMARY.md)** - Tổng kết
- **[RBAC_CHECKLIST.md](RBAC_CHECKLIST.md)** - Testing checklist

## 🛠️ Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/WEB_Restaurant_manage.git
cd WEB_Restaurant_manage
```

2. **Configure environment variables**

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db"
JWT_SECRET="your-secret-key"
PORT=4000
```

3. **Run the application**
```bash
# Using the startup script
bash run.sh
```

Or manually:
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed  # Optional: add demo data
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 👤 Demo Accounts

⚠️ **Chạy seed trước khi test**: `cd backend && npm run seed:full`

| Username | Password | Role | Test Cases |
|----------|----------|------|------------|
| admin | admin123 | Admin | Thấy "Quản lý Tài khoản", nút "Tạo tài khoản" ✅ |
| manager | manager123 | QuanLy | Thấy "Báo cáo", KHÔNG thấy "Quản lý Tài khoản" ❌ |
| cashier | cashier123 | ThuNgan | Thấy "Thanh toán", "Mở ca", "Đóng ca" ✅ |
| waiter1 | waiter123 | PhucVu | Thấy "Đơn hàng", KHÔNG thấy "Hủy món" ❌ |
| chef1 | chef123 | Bep | Chỉ thấy "Kitchen Display" ✅ |
| stock | stock123 | ThuKho | Thấy "Nhập hàng", "Tạo PO" ✅ |

## 📁 Project Structure

```
├── backend/
│   ├── prisma/          # Database schema & migrations
│   └── src/
│       ├── controllers/ # Request handlers
│       ├── services/    # Business logic
│       ├── routes/      # API endpoints
│       ├── middleware/  # Auth, RBAC, validation
│       └── utils/       # Helpers, SSE streams
├── frontend/
│   └── src/
│       ├── api/         # API client
│       ├── auth/        # Auth context
│       ├── components/  # Reusable UI
│       ├── hooks/       # React Query hooks
│       ├── layouts/     # Page layouts
│       ├── pages/       # Page components
│       └── router/      # Routes & guards
└── run.sh               # Startup script
```

## 📄 License

MIT License

## 👨‍💻 Author

Your Name
