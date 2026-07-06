# Backend API

Backend Node.js/Express dùng MongoDB cho các chức năng đăng ký, đăng nhập, quản lý phòng và text-to-speech.

API đã deploy sẵn:

```text
https://doanapi.onrender.com
```

Base API:

```text
https://doanapi.onrender.com/api
```

Kiểm tra API:

```text
https://doanapi.onrender.com/api/health
```

## Chạy backend sau khi clone code

Yêu cầu cài trước:

- Node.js
- npm
- Git

Clone source code:

```bash
git clone <REPOSITORY_URL>
cd backend
```

Cài các gói cần thiết:

```bash
npm install
```

Tạo file `.env` trong thư mục gốc của backend:

```env
MONGODB_URI=mongodb+srv://trungtin0972_db_user:Trungtin828465@cluster0.38vwqyj.mongodb.net/DoAn
PORT=3000
NODE_ENV=development

```

Chạy backend:

```bash
npm start
```

Hoặc chạy chế độ dev:

```bash
npm run dev
```

Khi chạy thành công sẽ thấy:

```text
API URL: http://localhost:3000/api
MongoDB được kết nối thành công
```

Test local:

```text
http://localhost:3000/api/health
```

## Một số endpoint chính

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/users
GET  /api/room
POST /api/room/user/:id
PUT  /api/room/:roomId
DELETE /api/room/:roomId
GET  /api/tts?text=hello&lang=vi
```

Ví dụ đăng nhập:

```json
{
  "Email": "a@gmail.com",
  "Password": "123456"
}
```

## Deploy backend lên Render

Trước tiên đẩy code lên GitHub:

```bash
git add .
git commit -m "Update backend"
git push
```

Vào Render và làm theo các bước:

1. Chọn **New**.
2. Chọn **Web Service**.
3. Kết nối repository GitHub chứa backend.
4. Cấu hình:

| Mục | Giá trị |
| --- | --- |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Root Directory | Để trống nếu repo chỉ chứa backend |

5. Vào phần **Environment** và thêm biến:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | Chuỗi kết nối MongoDB Atlas |



Sau đó bấm **Create Web Service** để deploy.

Khi deploy xong, Render sẽ cấp link dạng:

```text
https://<ten-service>.onrender.com
```

Kiểm tra backend trên Render:

```text
https://<ten-service>.onrender.com/api/health
```

Nếu không muốn tự deploy, có thể dùng backend đã deploy sẵn:

```text
https://doanapi.onrender.com/api
```

