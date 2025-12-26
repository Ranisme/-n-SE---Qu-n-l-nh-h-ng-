# 🚀 Hướng dẫn chạy Migration và Test Backend

## Bước 1: Chạy Migration Database

Mở terminal tại thư mục `backend` và chạy:

```bash
cd backend
npx prisma migrate dev --name add_void_request_table
```

**Kết quả mong đợi:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration 20251226_add_void_request_table
```

## Bước 2: Generate Prisma Client

```bash
npx prisma generate
```

## Bước 3: (Tùy chọn) Seed lại data nếu cần

Nếu bạn muốn có dữ liệu mẫu:

```bash
npm run seed:full
```

## Bước 4: Khởi động Backend

```bash
npm run dev
```

**Kiểm tra:** Backend chạy tại `http://localhost:4000`

## Bước 5: Test API với Postman hoặc curl

### Test 1: Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"waiter1","password":"waiter123"}'
```

Lưu lại `token` từ response.

### Test 2: Tạo void request

```bash
curl -X POST http://localhost:4000/api/orders/{orderId}/void-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"orderItemId":"uuid-here","lyDo":"Khách đổi ý"}'
```

### Test 3: Xem danh sách void requests (Manager)

Login với `manager/manager123` để lấy token, sau đó:

```bash
curl -X GET http://localhost:4000/api/orders/void-requests \
  -H "Authorization: Bearer {manager-token}"
```

### Test 4: Duyệt void request

```bash
curl -X POST http://localhost:4000/api/orders/void-requests/{requestId}/approve \
  -H "Authorization: Bearer {manager-token}"
```

---

## ✅ Checklist Backend đã hoàn thành

- [x] Thêm bảng `YeuCauHuyMon` vào schema
- [x] Tạo service `createVoidRequest` cho phục vụ
- [x] Tạo service `listVoidRequests` cho quản lý
- [x] Tạo service `approveVoidRequest` cho quản lý
- [x] Tạo service `rejectVoidRequest` cho quản lý
- [x] Cập nhật controllers
- [x] Cập nhật routes với permissions đúng
- [x] Cập nhật validation schemas
- [x] Xóa code cũ (voidItem với manager PIN)

---

## 🔜 Tiếp theo: Frontend

Sau khi backend chạy thành công, tôi sẽ tiếp tục implement frontend:

1. ✅ API client functions
2. ✅ React Query hooks
3. ✅ UI cho phục vụ (dialog yêu cầu hủy món)
4. ✅ UI cho quản lý (trang duyệt yêu cầu)
5. ✅ Cập nhật KDS để hiển thị món đã hủy
6. ✅ Thêm menu navigation

---

## ⚠️ Lưu ý

- **Backup code trước khi chạy migration**: Xem `GIT_WORKFLOW.md`
- **Nếu migration lỗi**: Có thể cần reset database với `npx prisma migrate reset`
- **Permissions**: Đảm bảo seed data đã chạy để có đủ permissions

Chúc bạn thành công! 🎉
