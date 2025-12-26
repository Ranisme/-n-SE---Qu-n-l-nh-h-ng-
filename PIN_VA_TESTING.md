# 🔐 Thông tin PIN mặc định cho Testing

## Tài khoản Demo và Mật khẩu

Dự án này sử dụng **bcrypt** để hash mật khẩu. Khi bạn chạy seed data (`npm run seed:full`), các tài khoản sau sẽ được tạo:

| Username | Password (PIN) | Vai trò | Quyền hủy món |
|----------|---------------|---------|---------------|
| `admin` | `admin123` | Admin | ✅ Có quyền duyệt hủy món (ORDER_VOID_APPROVE) |
| `manager` | `manager123` | QuanLy (Manager) | ✅ Có quyền duyệt hủy món (ORDER_VOID_APPROVE) |
| `cashier` | `cashier123` | ThuNgan (Cashier) | ❌ Không có quyền |
| `waiter1` | `waiter123` | PhucVu (Waiter) | ✅ Có quyền yêu cầu hủy món (ORDER_VOID) |
| `chef1` | `chef123` | Bep (Chef) | ❌ Không có quyền |
| `stock` | `stock123` | ThuKho (Stockkeeper) | ❌ Không có quyền |

---

## ⚠️ Lưu ý quan trọng về Workflow mới

### Workflow CŨ (đã bỏ):
1. Phục vụ muốn hủy món
2. **Nhập PIN quản lý ngay lập tức** (ví dụ: `manager123`)
3. Món bị hủy ngay

### Workflow MỚI (hiện tại):
1. **Phục vụ tạo yêu cầu hủy món** (chỉ cần nhập lý do, KHÔNG cần PIN)
2. Yêu cầu được lưu vào database với trạng thái `CHO_DUYET`
3. **Quản lý vào trang "Yêu cầu hủy món"** để xem danh sách
4. Quản lý **duyệt hoặc từ chối** (tự động dùng token đăng nhập, không cần nhập PIN)
5. Nếu duyệt → Món bị hủy và thông báo cho bếp

---

## 🧪 Cách Test Workflow Mới

### Bước 1: Đăng nhập với tài khoản Phục vụ

```
Username: waiter1
Password: waiter123
```

### Bước 2: Tạo đơn hàng và yêu cầu hủy món

1. Vào **POS** → Chọn bàn → Thêm món
2. Click nút **"Hủy món"** trên món muốn hủy
3. Nhập lý do (ví dụ: "Khách đổi ý")
4. Click **"Gửi yêu cầu"** (KHÔNG cần nhập PIN)
5. Thông báo: "Yêu cầu hủy món đã được gửi, chờ quản lý duyệt"

### Bước 3: Đăng nhập với tài khoản Quản lý

```
Username: manager
Password: manager123
```

### Bước 4: Duyệt yêu cầu hủy món

1. Vào menu **"Yêu cầu hủy món"** (chỉ Manager/Admin mới thấy)
2. Xem danh sách yêu cầu chờ duyệt
3. Click **"Duyệt"** hoặc **"Từ chối"**
4. Nếu duyệt → Món sẽ chuyển sang trạng thái `DAHUY`

### Bước 5: Kiểm tra trên Kitchen Display

```
Username: chef1
Password: chef123
```

1. Vào **Kitchen Display (KDS)**
2. Món đã hủy sẽ hiển thị với trạng thái "Đã hủy"
3. Bếp có thể xóa món đó khỏi danh sách

---

## 🔧 Chạy Migration Database

Vì đã thêm bảng `YeuCauHuyMon` mới, bạn cần chạy migration:

```bash
cd backend
npx prisma migrate dev --name add_void_request_table
npx prisma generate
```

Nếu gặp lỗi, có thể reset database (⚠️ MẤT DỮ LIỆU):

```bash
npx prisma migrate reset
npm run seed:full
```

---

## 📝 API Endpoints Mới

### 1. Tạo yêu cầu hủy món (Phục vụ)
```http
POST /api/orders/:orderId/void-request
Authorization: Bearer <token>

Body:
{
  "orderItemId": "uuid-of-order-item",
  "lyDo": "Khách đổi ý"
}
```

### 2. Xem danh sách yêu cầu hủy món (Quản lý)
```http
GET /api/orders/void-requests?trangThai=CHO_DUYET
Authorization: Bearer <token>
```

### 3. Duyệt yêu cầu hủy món (Quản lý)
```http
POST /api/orders/void-requests/:requestId/approve
Authorization: Bearer <token>
```

### 4. Từ chối yêu cầu hủy món (Quản lý)
```http
POST /api/orders/void-requests/:requestId/reject
Authorization: Bearer <token>

Body:
{
  "lyDoTuChoi": "Không hợp lý"
}
```

---

## ❓ Câu hỏi thường gặp

### Q: Tại sao không cần nhập PIN nữa?
**A:** Workflow mới sử dụng **JWT token** từ session đăng nhập. Khi Quản lý đã đăng nhập, hệ thống tự động biết họ là ai và có quyền gì. Không cần nhập PIN mỗi lần duyệt.

### Q: Phục vụ có thể tự hủy món không?
**A:** KHÔNG. Phục vụ chỉ có thể **tạo yêu cầu hủy**. Quản lý mới có quyền **duyệt**.

### Q: Nếu quên mật khẩu thì sao?
**A:** Trong môi trường development, bạn có thể:
1. Chạy lại seed: `npm run seed:full` (sẽ tạo lại tài khoản mặc định)
2. Hoặc dùng tài khoản `admin/admin123` để reset mật khẩu người khác

### Q: Làm sao biết mật khẩu đã hash đúng chưa?
**A:** Xem file `backend/prisma/seed-full.js` để thấy cách hash:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash('manager123', 10);
```

---

## 🎯 Tóm tắt

- **Không còn nhập PIN khi hủy món**
- **Workflow mới**: Yêu cầu → Chờ duyệt → Duyệt/Từ chối
- **Mật khẩu mặc định**: Xem bảng ở đầu tài liệu
- **Chạy migration** trước khi test
- **Seed data** để có tài khoản demo

Chúc bạn test thành công! 🚀
