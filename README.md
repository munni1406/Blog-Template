## Modern Blog Template

A clean, responsive blog starter built with HTML, CSS, and a tiny bit of JavaScript. It now includes a minimal Admin app and a Node.js API backed by MongoDB to store and render posts dynamically.

### Concept
- **Simple, fast, no build step**: Static pages for the site shell (`index.html`, `about.html`, `contact.html`).
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
  admin.html            # Minimal admin UI to create posts in MongoDB
  index.html            # Homepage with posts grid
  about.html            # About page
  contact.html          # Contact page
  server.js             # Express + Mongoose server and API
  package.json          # Node project metadata
  posts/
    view.html           # Dynamic viewer for DB-backed posts
    assets/
      css/style.css     # Site styles
      js/main.js        # Nav toggle + reading-time utility
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
- Admin: `http://localhost:3000/admin.html`
- Dynamic viewer: `http://localhost:3000/posts/view.html?slug=your-slug`
- Homepage: `http://localhost:3000/`

### Using the Admin
1. Open `admin.html`.
2. Fill in title, slug (auto-generated), author, date, tags, excerpt, hero image URL, and HTML content.
3. Click “Save to database”. The post will appear in the saved list with a link.
4. Share or link to `posts/view.html?slug=your-slug` from the homepage or anywhere else.

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
- Update `index.html` cards to point to static HTML posts or to `posts/view.html?slug=...` for DB-backed posts.
- Extend the API in `server.js` (e.g., add update/delete endpoints) if needed.

### Notes on responsiveness and accessibility
- Grid and form layouts collapse smoothly on tablets and mobile.
- Navigation is keyboard accessible and supports a mobile toggle; a skip link is provided.

