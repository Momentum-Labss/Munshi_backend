# Munshi

Munshi is a comprehensive, AI-powered business management application designed to streamline daily operations for retailers and small business owners. It integrates Point of Sale (POS), Inventory Management, and Credit (Udhaar) tracking into a single, seamless mobile experience.

## 🚀 Features

- **Sales Management**: Efficiently track daily sales, view transaction history, and manage orders.
- **Stock & Inventory**: Real-time inventory tracking with low-stock alerts and easy product management.
- **Udhaar (Credit) Ledger**: Digital record-keeping for customer credits, payments, and reminders.
- **AI-Powered Insights**: Built with **LangChain** and **Google GenAI**, Munshi utilizes intelligent agents to provide business insights and assistance.
- **Integrated Calculator**: Quick access to calculation tools directly within the workflow.
- **Modern UI/UX**: Built with **React Native** and **NativeWind** for a sleek, responsive, and accessible interface.
- **Secure**: Robust authentication and secure data handling.

## 🛠 Tech Stack

### Frontend
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Storage**: Async Storage & Expo Secure Store
- **Animations**: Moti & Reanimated

### Backend
- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: Express / Bun Native
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **AI & LLM**: [LangChain](https://js.langchain.com/) & Google GenAI
- **Validation**: Zod
- **Authentication**: JWT

## 📂 Project Structure

The repository is organized as a monorepo:

- **`/frontend`**: The React Native mobile application.
- **`/backend`**: The backend API server and AI agents.

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [Bun](https://bun.sh/) (for backend)
- [Expo Go](https://expo.dev/client) app on your mobile device (or Android/iOS emulator)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Momentum-Labss/Munshi_backend.git
    cd Munshi_backend
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    bun install
    # Set up your .env file (Database URL, API Keys, etc.)
    bun prisma generate
    bun run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd ../frontend
    npm install
    # Set up your .env file if required
    npx expo start
    ```

4.  **Run the App:**
    - Scan the QR code with the **Expo Go** app (Android/iOS).
    - Or press `a` for Android Emulator, `i` for iOS Simulator.
