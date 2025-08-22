## Modern Blog Template

A clean, responsive blog starter built with HTML, CSS, and a tiny bit of JavaScript. It now includes a minimal Admin app and a Node.js API backed by MongoDB to store and render posts dynamically.

### Concept
- **Simple, fast, no build step**: Static pages for the site shell (`home.html`, `about.html`, `contact.html`). Login at `index.html`.
- **Responsive and accessible**: Mobile-first layout, semantic HTML, skip link, keyboard‑friendly nav, and system light/dark preference.
- **Content options**:
  - Static posts under `posts/` (plain HTML files).
  - Dynamic posts saved in MongoDB via the Admin app and rendered with `posts/view.html?slug=...`.

### Features
- **Responsive UI** with typography/spacing tuned for readability.
- **Accessible navigation** with a mobile toggle and focus styles.
- **Admin app** at `admin.html` to create posts and save to MongoDB; shows a list of saved posts.
- **Dynamic post viewer** at `posts/view.html?slug=your-slug` that fetches content from the API and computes reading time on the fly.

### Project structure
```
Blog-Template/
  admin.html            # Admin UI to create posts (currently stores in localStorage)
  index.html            # Login page (shown first); redirects to home after login
  home.html             # Homepage with posts grid
  logout.html           # Page to logout or delete local account data
  about.html            # About page
  contact.html          # Contact page
  server.js             # Express + Mongoose server and API
  package.json          # Node project metadata
  posts/
    view.html           # Dynamic viewer for DB-backed posts
    assets/
      css/style.css     # Site styles
      js/main.js        # Nav toggle + reading-time utility
      js/auth.js        # Minimal client-side auth helper
    ...                 # Optional static post HTML files
```

### Prerequisites
- Node.js 18+
- MongoDB (local `mongod` or a MongoDB Atlas connection string)

### Setup and run
1. Install dependencies:
```bash
cd Blog-Template
npm install
```
2. Start MongoDB and set `MONGO_URI` (examples for Windows shells):
```powershell
# PowerShell
$env:MONGO_URI = "mongodb://127.0.0.1:27017/modern_blog"
npm start
```
```cmd
:: Command Prompt (cmd)
set MONGO_URI=mongodb://127.0.0.1:27017/modern_blog
npm start
```
If `MONGO_URI` is not set, the server defaults to `mongodb://127.0.0.1:27017/modern_blog`.

3. Open the site:
- Login: `http://localhost:3000/` (redirects to `index.html`)
- After login: `home.html`
- Admin: `admin.html` (requires login)
- Dynamic viewer: `posts/view.html?slug=your-slug`

### Using the Admin
1. Open `admin.html` (after logging in).
2. Fill in title, slug (auto-generated), author, date, tags, excerpt, hero image URL, and HTML content.
3. Click “Save to database”.
   - Current behavior: saves to browser localStorage and opens the post in a new tab.
   - Viewer behavior: `posts/view.html` first tries localStorage; if not found, it falls back to the API (`/api/posts/:slug`).
4. If the Title or Tags include "html", the static post `posts/introducing-modern-blog.html` opens instead.

To feature a DB-backed post on the homepage, add a card in `index.html` linking to the viewer, for example:
```html
<article class="post-card">
  <a class="post-link" href="posts/view.html?slug=my-awesome-post">
    <div class="post-thumb" aria-hidden="true">
      <img src="html.webp" alt="Post image">
    </div>
    <h2 class="post-title">My awesome post</h2>
    <p class="post-excerpt">This post is loaded from the database.</p>
    <div class="post-extra">
      <span class="post-author">By Admin</span>
      <ul class="post-tags"></ul>
    </div>
    <div class="post-meta">
      <time datetime="2025-08-15">Aug 15, 2025</time>
      <span class="dot" aria-hidden="true">·</span>
      <span>5 min read</span>
    </div>
  </a>
  
</article>
```

### API
- `GET /api/health` → `{ ok: true }`
- `GET /api/posts` → list of posts (excluding `content`)
- `GET /api/posts/:slug` → full post including `content`
- `POST /api/posts` → create a post
  - JSON body: `{ slug, title, author?, excerpt?, tags?, date?, hero?, content }`
  - Errors: `VALIDATION_ERROR`, `SLUG_EXISTS`

### Customization
- Edit styles in `posts/assets/css/style.css` to change typography, spacing, and color tokens.
- Update `home.html` cards to point to static HTML posts or to `posts/view.html?slug=...` for DB-backed posts.
- Extend the API in `server.js` (e.g., add update/delete endpoints) if needed.

### Notes on responsiveness and accessibility
- Grid and form layouts collapse smoothly on tablets and mobile.
- Navigation is keyboard accessible and supports a mobile toggle; a skip link is provided.

### Recent changes
- Added login-first flow: `index.html` (login) → `home.html` (homepage). Server root `/` redirects to `index.html`.
- Introduced `posts/assets/js/auth.js` with minimal client-side auth; protected `admin.html` and `posts/view.html`.
- Added `logout.html` with options to Logout or Delete account (clears local data).
- Updated nav links across pages to use `home.html` for Home and point Logout to `logout.html`.
- Admin save flow now opens the created post in a new tab; if Title/Tags include "html", it opens the static `posts/introducing-modern-blog.html` instead.
- Homepage (`home.html`) shows Logout when authenticated and hides it otherwise.

