# HDP 2.6.5 VirtualBox OVA Download Portal (Vercel Ready)

This repository provides a modern, fast, and responsive web portal for sharing the **Hortonworks Data Platform (HDP 2.6.5) VirtualBox Appliance (15.01 GB)**.

> ⚠️ **Important Notice Regarding 15 GB File Hosting:**
> Vercel enforces a **100 MB maximum file size limit** for static assets. A 15.01 GB file **cannot** be directly uploaded or committed to Git / Vercel servers.
> 
> **Architecture Solution:** This web application is deployed to Vercel, while the 15 GB `.ova` file is hosted on Cloud Storage (Google Drive, Cloudflare R2, AWS S3, or Internet Archive) and linked via `src/config.js`.

---

## 🚀 How to Share Your 15 GB File on Vercel

### Step 1: Upload Your `HDP_2.6.5_virtualbox_180626.ova` File to Cloud Storage

Choose one of the recommended storage options below:

#### Option A: Google Drive (15 GB Free)
1. Go to [drive.google.com](https://drive.google.com) and upload `HDP_2.6.5_virtualbox_180626.ova`.
2. Right-click the file ➔ **Share** ➔ Set access to **"Anyone with the link"**.
3. Copy the File ID from the link (e.g. `https://drive.google.com/file/d/YOUR_FILE_ID/view`).
4. Direct download URL format:  
   `https://drive.google.com/uc?export=download&id=YOUR_FILE_ID`

#### Option B: Cloudflare R2 (10 GB Free, Zero Egress Fees)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) ➔ R2 Storage.
2. Create a bucket and upload `HDP_2.6.5_virtualbox_180626.ova`.
3. Enable **Public Bucket Access** or bind a custom domain.
4. Copy the public URL.

#### Option C: Internet Archive (archive.org) — 100% Free & Unlimited
1. Go to [archive.org](https://archive.org) and click **Upload**.
2. Upload the `.ova` file under open software/education.
3. Once processed, get the direct HTTPS download URL.

#### Option D: Mega.nz (20 GB Free)
1. Upload file to [mega.nz](https://mega.nz).
2. Get public link.

---

### Step 2: Update Your Link in `src/config.js`

Open `src/config.js` in your text editor and update `downloadUrl`:

```javascript
export const appConfig = {
  fileName: "HDP_2.6.5_virtualbox_180626.ova",
  fileSize: "15.01 GB",
  
  // PASTE YOUR CLOUD DOWNLOAD LINK HERE
  downloadUrl: "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID",
  ...
};
```

---

### Step 3: Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for HDP 2.6.5 portal"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hdp-download-portal.git
   git push -u origin main
   ```
   *(Note: The `.gitignore` file automatically excludes `*.ova` so Git will not fail on the 15 GB file).*

2. Go to [vercel.com](https://vercel.com) ➔ **Add New Project** ➔ Import your GitHub repo.
3. Framework Preset: **Vite**.
4. Click **Deploy**. Your download portal is live!

#### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

---

## 🛠️ Local Development

To run the portal on your computer:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

To test production build:
```bash
npm run build
npm run preview
```

---

## 📋 Features Included
- ⚡ **Lightning Fast Vite Build**
- 🎨 **Glassmorphism Dark UI** with vibrant CSS gradients & micro-animations
- 💻 **System Requirements & Pre-installed Hadoop Stack** specification
- 🔑 **One-click Copy** for Ambari Credentials (`admin`/`admin`) and SSH login
- 📱 **100% Mobile & Desktop Responsive**
