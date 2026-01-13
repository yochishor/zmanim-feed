# How to Host Your Zmanim Feed

Since this is a standard Node.js application, the easiest way to host it for free is using **Render** or **Railway**.

## Option 1: Render.com (Recommended - Free Tier)
1.  **Push your code to GitHub**
    - Create a new repository on [GitHub.com](https://github.com/new).
    - Run these commands in your `zmanim feed` folder:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      git branch -M main
      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
      git push -u origin main
      ```
2.  **Deploy on Render**
    - Go to [Render.com](https://render.com) and sign up/login.
    - Click **"New +"** -> **"Web Service"**.
    - Connect your GitHub account and select your new repository.
    - **Settings**:
        - **Runtime**: Node
        - **Build Command**: `npm install`
        - **Start Command**: `npm start`
    - Click **"Create Web Service"**.

## Option 2: Railway (Easiest to setup, small trial)
1.  Go to [Railway.app](https://railway.app).
2.  Click "Start a New Project".
3.  Choose "Deploy from GitHub repo".
4.  Select your repo.
5.  Railway will auto-detect everything and give you a URL.

## After Deployment
You will get a URL like:
`https://zmanim-feed.onrender.com`

**Your Subscription Link:**
Replace `https://` with `webcal://` to subscribe on your phone:
`webcal://zmanim-feed.onrender.com/feed?zip=10001`
