This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Sharing and Running on Another Device

To share this project with another device or collaborator, follow these steps:

### 1. Clone or Copy the Repository
- **Option 1:** Upload the project to a Git repository (e.g., GitHub, GitLab) and clone it on the other device:
  ```bash
git clone <your-repo-url>
```
- **Option 2:** Copy the entire project folder to the other device (via USB, cloud storage, etc).

### 2. Install Dependencies
On the new device, open a terminal in the project root and run:
```bash
npm install
# or
yarn install
# or
pnpm install
```

#### For the Backend
Navigate to the `backend` folder and install backend dependencies:
```bash
cd backend
npm install
```

### 3. Set Up Environment Variables
- Copy any `.env` files used in both the root and `backend` folders (if present) to the new device.
- If these files are missing, create them as needed for your environment (e.g., database URLs, secrets).

### 4. Run the Backend
In the `backend` folder:
```bash
npm start
```

### 5. Run the Frontend
In the project root:
```bash
npm run dev
```

### 6. Access the App
- Frontend: Open [http://localhost:3000](http://localhost:3000) in your browser.
- Backend: The backend will run on the port specified in your backend code or `.env` file (commonly [http://localhost:5000](http://localhost:5000)).

### 7. Additional Notes
- Make sure Node.js is installed on the new device.
- If you use a database, ensure it is accessible from the new device and update connection strings if needed.
- For production deployment, refer to the Next.js and Express.js deployment documentation.
