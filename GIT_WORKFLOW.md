# 📚 Hướng dẫn Git Workflow - Restaurant Management System

## 🎯 Mục đích

Tài liệu này hướng dẫn cách sử dụng Git để:
- ✅ Lưu lại trạng thái code hiện tại
- ✅ Tạo backup trước khi thay đổi lớn
- ✅ Quay lại phiên bản cũ khi có lỗi
- ✅ Quản lý nhiều phiên bản code

---

## 📋 Mục lục

1. [Kiểm tra trạng thái hiện tại](#1-kiểm-tra-trạng-thái-hiện-tại)
2. [Lưu code hiện tại (Commit)](#2-lưu-code-hiện-tại-commit)
3. [Tạo backup branch](#3-tạo-backup-branch)
4. [Xem lịch sử thay đổi](#4-xem-lịch-sử-thay-đổi)
5. [Quay lại phiên bản cũ](#5-quay-lại-phiên-bản-cũ)
6. [Best Practices](#6-best-practices)

---

## 1. Kiểm tra trạng thái hiện tại

### Xem các file đã thay đổi

```bash
git status
```

**Kết quả mẫu:**
```
On branch main
Changes not staged for commit:
  modified:   backend/src/services/orders.service.js
  modified:   frontend/src/pages/pos/OrderPad.jsx

Untracked files:
  backend/scripts/
```

**Giải thích:**
- `modified`: File đã tồn tại và đã được sửa
- `Untracked files`: File mới chưa được Git theo dõi

### Xem chi tiết thay đổi

```bash
# Xem tất cả thay đổi
git diff

# Xem thay đổi của 1 file cụ thể
git diff backend/src/services/orders.service.js
```

---

## 2. Lưu code hiện tại (Commit)

### Bước 1: Thêm file vào staging area

```bash
# Thêm TẤT CẢ file đã thay đổi
git add .

# HOẶC thêm từng file cụ thể
git add backend/src/services/orders.service.js
git add frontend/src/pages/pos/OrderPad.jsx
```

### Bước 2: Commit với message mô tả

```bash
git commit -m "feat: Thêm chức năng yêu cầu hủy món cho phục vụ"
```

**✅ Ví dụ commit message tốt:**
```bash
git commit -m "feat: Thêm bảng YeuCauHuyMon vào database schema"
git commit -m "fix: Sửa lỗi không hiển thị nút đóng ca cho thu ngân"
git commit -m "refactor: Tách logic void order thành service riêng"
git commit -m "docs: Cập nhật README với hướng dẫn chạy migration"
```

**❌ Ví dụ commit message tệ:**
```bash
git commit -m "update"
git commit -m "fix bug"
git commit -m "asdfasdf"
```

### Bước 3: Đẩy lên remote repository (GitHub)

```bash
git push origin main
```

> **Lưu ý:** Nếu bạn chưa cấu hình remote, xem phần [Cấu hình Git](#cấu-hình-git-lần-đầu)

---

## 3. Tạo backup branch

### Tại sao cần backup branch?

Trước khi thực hiện thay đổi lớn (ví dụ: thêm bảng database mới, refactor code), bạn nên tạo branch backup để có thể quay lại nếu có lỗi.

### Cách tạo backup branch

```bash
# Tạo branch backup từ trạng thái hiện tại
git branch backup-before-void-request-feature

# Xem danh sách branch
git branch -a
```

**Kết quả:**
```
* main
  backup-before-void-request-feature
```

### Chuyển sang branch khác

```bash
# Chuyển sang branch backup
git checkout backup-before-void-request-feature

# Quay lại branch main
git checkout main
```

### Tạo branch mới và chuyển sang luôn

```bash
# Tạo branch mới cho feature và chuyển sang
git checkout -b feature/void-request-workflow

# Làm việc trên branch này...
# Khi xong, merge vào main
git checkout main
git merge feature/void-request-workflow
```

---

## 4. Xem lịch sử thay đổi

### Xem danh sách commit

```bash
# Xem lịch sử commit (đơn giản)
git log --oneline

# Xem lịch sử chi tiết
git log

# Xem 5 commit gần nhất
git log -n 5 --oneline
```

**Kết quả mẫu:**
```
a1b2c3d (HEAD -> main) feat: Thêm chức năng yêu cầu hủy món
e4f5g6h fix: Sửa lỗi hiển thị menu cho cashier
i7j8k9l docs: Cập nhật README
```

### Xem thay đổi của 1 commit cụ thể

```bash
# Xem chi tiết commit (thay a1b2c3d bằng commit hash thực tế)
git show a1b2c3d
```

---

## 5. Quay lại phiên bản cũ

### ⚠️ QUAN TRỌNG: Backup trước khi quay lại

```bash
# Tạo branch backup từ trạng thái hiện tại
git branch backup-current-state
```

### Cách 1: Quay lại tạm thời (không mất code hiện tại)

```bash
# Xem code ở commit cũ (chỉ xem, không thay đổi)
git checkout a1b2c3d

# Quay lại trạng thái mới nhất
git checkout main
```

### Cách 2: Tạo commit mới để revert thay đổi

```bash
# Tạo commit mới để hủy thay đổi của commit cũ
git revert a1b2c3d

# Git sẽ tạo commit mới, bạn cần nhập message
```

**Ưu điểm:** Không mất lịch sử, an toàn nhất.

### Cách 3: Reset về commit cũ (XÓA lịch sử)

```bash
# ⚠️ NGUY HIỂM: Xóa tất cả commit sau a1b2c3d
git reset --hard a1b2c3d

# Đẩy lên remote (cần force)
git push origin main --force
```

**⚠️ Cảnh báo:** Chỉ dùng khi bạn chắc chắn muốn xóa lịch sử!

### Cách 4: Khôi phục 1 file cụ thể từ commit cũ

```bash
# Lấy file từ commit cũ
git checkout a1b2c3d -- backend/src/services/orders.service.js

# Commit thay đổi
git add backend/src/services/orders.service.js
git commit -m "revert: Khôi phục orders.service.js về phiên bản cũ"
```

---

## 6. Best Practices

### ✅ Nên làm

1. **Commit thường xuyên**
   ```bash
   # Commit sau mỗi tính năng nhỏ hoàn thành
   git add .
   git commit -m "feat: Hoàn thành form yêu cầu hủy món"
   ```

2. **Viết commit message rõ ràng**
   - Sử dụng prefix: `feat:`, `fix:`, `refactor:`, `docs:`
   - Mô tả ngắn gọn những gì đã làm
   - Viết bằng tiếng Việt hoặc tiếng Anh nhất quán

3. **Tạo branch cho feature mới**
   ```bash
   git checkout -b feature/void-request
   # Làm việc...
   git checkout main
   git merge feature/void-request
   ```

4. **Backup trước khi thay đổi lớn**
   ```bash
   git branch backup-$(date +%Y%m%d)
   ```

5. **Pull trước khi push (nếu làm việc nhóm)**
   ```bash
   git pull origin main
   git push origin main
   ```

### ❌ Không nên làm

1. ❌ Commit với message không rõ ràng: `git commit -m "update"`
2. ❌ Commit quá nhiều file không liên quan trong 1 commit
3. ❌ Dùng `git reset --hard` mà không backup
4. ❌ Push `--force` lên branch chính khi làm việc nhóm
5. ❌ Commit file nhạy cảm (`.env`, passwords, API keys)

---

## 📝 Workflow thực tế cho dự án này

### Scenario 1: Bắt đầu làm feature mới

```bash
# 1. Đảm bảo code hiện tại đã được commit
git status
git add .
git commit -m "chore: Lưu trạng thái trước khi làm feature mới"

# 2. Tạo backup branch
git branch backup-before-void-request

# 3. Tạo feature branch
git checkout -b feature/void-request-workflow

# 4. Làm việc và commit thường xuyên
# ... code code code ...
git add .
git commit -m "feat: Thêm bảng YeuCauHuyMon vào schema"

# ... code code code ...
git add .
git commit -m "feat: Thêm API endpoint tạo void request"

# 5. Merge vào main khi xong
git checkout main
git merge feature/void-request-workflow

# 6. Push lên GitHub
git push origin main
```

### Scenario 2: Có lỗi, cần quay lại

```bash
# 1. Xem lịch sử commit
git log --oneline

# 2. Tìm commit tốt cuối cùng (ví dụ: e4f5g6h)
# 3. Tạo branch từ commit đó
git checkout -b fix-from-good-state e4f5g6h

# 4. Hoặc revert commit lỗi
git revert a1b2c3d
```

### Scenario 3: Xem code đã thay đổi gì

```bash
# So sánh với commit trước đó
git diff HEAD~1

# So sánh 2 commit cụ thể
git diff e4f5g6h a1b2c3d

# Xem file nào đã thay đổi
git diff --name-only HEAD~1
```

---

## 🔧 Cấu hình Git lần đầu

Nếu bạn chưa cấu hình Git, chạy các lệnh sau:

```bash
# Cấu hình tên và email
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"

# Kiểm tra cấu hình
git config --list
```

### Kết nối với GitHub (nếu chưa có)

```bash
# Thêm remote repository
git remote add origin https://github.com/username/restaurant-management-system.git

# Kiểm tra remote
git remote -v

# Push lần đầu
git push -u origin main
```

---

## 🆘 Các tình huống khẩn cấp

### Tôi đã commit nhầm, chưa push

```bash
# Hủy commit cuối cùng, giữ lại thay đổi
git reset --soft HEAD~1

# Sửa lại và commit lại
git add .
git commit -m "feat: Message đúng"
```

### Tôi đã push nhầm lên GitHub

```bash
# Tạo commit mới để revert
git revert HEAD
git push origin main
```

### Tôi muốn xóa file khỏi Git nhưng giữ lại trên máy

```bash
# Xóa file khỏi Git tracking
git rm --cached backend/.env

# Thêm vào .gitignore
echo "backend/.env" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: Loại bỏ .env khỏi Git"
```

### Tôi muốn xem code của 1 tuần trước

```bash
# Xem commit 1 tuần trước
git log --since="1 week ago" --oneline

# Checkout về commit đó (chỉ xem)
git checkout <commit-hash>

# Quay lại hiện tại
git checkout main
```

---

## 📚 Tài liệu tham khảo

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Visualizing Git](https://git-school.github.io/visualizing-git/)

---

## ✅ Checklist trước khi thay đổi code lớn

- [ ] Đã commit tất cả thay đổi hiện tại
- [ ] Đã tạo backup branch
- [ ] Đã push code lên GitHub (nếu có)
- [ ] Đã đọc kỹ implementation plan
- [ ] Đã backup database (nếu có migration)

**Chúc bạn code vui vẻ! 🚀**
