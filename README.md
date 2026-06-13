
<div align="center">

# ✦ Space
### Your Social Universe

A modern, full-stack social media platform built with **Node.js**, **Express**, **MongoDB**, and a beautiful light/dark glassmorphism UI.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge)

</div>

---

## 📸 Features

- 🔐 **Authentication** — Secure register & login with JWT tokens
- 🧑‍🚀 **User Profiles** — Avatar upload, bio editing, follower/following system
- 📝 **Posts** — Create posts with text, images, videos, or audio
- ❤️ **Likes & Comments** — Real-time interaction on every post
- 🌙 **Dark Mode** — Toggle between light and dark themes (persisted)
- 🖼️ **Media Lightbox** — Full-screen image previews
- 📊 **Quick Stats** — Live display of your posts, followers, and following count
- 📱 **Responsive** — Works seamlessly on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs |
| **File Uploads** | Multer |
| **Frontend** | Vanilla JS + CSS (Glassmorphism) |
| **Font** | Inter (Google Fonts) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) (local or [Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/medutc/Social-Media-Platform.git
   cd Social-Media-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file** in the root directory
   ```env
   MONGO_URI=mongodb://localhost:27017/space
   JWT_SECRET=your_super_secret_key_here
   PORT=3000
   ```

4. **Run the app**

   For development (with auto-reload):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
Space/
├── public/
│   ├── index.html          # Main frontend UI
│   ├── style.css           # Full UI styling (light + dark mode)
│   ├── app.js              # Frontend logic (auth, posts, profiles)
│   └── uploads/
│       ├── posts/          # Uploaded post media (images, videos, audio)
│       └── profiles/       # Uploaded profile pictures
├── routes/
│   ├── userRoutes.js       # User API endpoints
│   └── postRoutes.js       # Post API endpoints
├── controllers/
│   ├── userController.js   # User business logic
│   └── postController.js   # Post business logic
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   └── upload.js           # Multer file upload config
├── models/                 # Mongoose schemas
├── server.js               # App entry point
├── package.json
└── .env                    # Environment variables (not committed)
```

---

## 🔌 API Endpoints

### Auth & Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and get JWT token |
| `GET` | `/` | ✅ | Get all users |
| `GET` | `/:id` | ✅ | Get user profile + posts |
| `POST` | `/follow` | ✅ | Follow / unfollow a user |
| `PUT` | `/profile/update` | ✅ | Update bio |
| `PUT` | `/profile/picture` | ✅ | Upload profile picture |

### Posts — `/api/posts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | ✅ | Create a new post (with optional media) |
| `GET` | `/` | ✅ | Get all posts (feed) |
| `DELETE` | `/:postId` | ✅ | Delete a post |
| `PUT` | `/:postId/like` | ✅ | Like / unlike a post |
| `POST` | `/:postId/comment` | ✅ | Add a comment to a post |

---

## 🎨 UI Highlights

- **Glassmorphism cards** with `backdrop-filter: blur()`
- **Animated gradient orbs** on the auth screen
- **Smooth hover lift** effects on post cards
- **`fadeInUp` animations** on content load
- **Floating toast notifications** instead of browser alerts
- **CSS custom properties** for instant theme switching

---

## 🌙 Dark Mode

Click the **🌙 button** in the top navigation bar to toggle dark mode. Your preference is saved to `localStorage` and persists across sessions.

---

## 📝 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/space` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `mysecretkey123` |
| `PORT` | Port the server listens on | `3000` |

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---
## ✍️ Author
MOATAZ Mohamed
