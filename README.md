# 🚀 MemeVault - Premium Meme Marketplace

A modern, AI-powered meme marketplace built with Next.js where users can discover, buy, sell, and create premium memes using virtual coins. Features real-time transactions, AI-enhanced content creation, and a vibrant community-driven economy.

![MemeVault Banner](https://via.placeholder.com/1200x400/6366f1/ffffff?text=MemeVault+-+Premium+Meme+Marketplace)

## ✨ Features

### 🎨 **AI-Powered Creation**

- **Smart Image Analysis**: AI automatically suggests titles, tags, descriptions, and categories
- **Meme Generation**: Create memes using popular templates with AI optimization
- **Content Enhancement**: AI-powered title generation and description improvement
- **Template Library**: Pre-built meme templates (Stonks, Drake, Distracted Boyfriend, etc.)

### 💰 **Virtual Economy**

- **Coin System**: Buy, sell, and trade memes using virtual coins
- **Real-time Transactions**: Instant balance updates across all browser tabs
- **Daily Bonuses**: Earn free coins daily to participate in the economy
- **Leaderboards**: Track top earners and coin holders

### 🔍 **Discovery & Exploration**

- **Advanced Search**: Filter by category, tags, price, and popularity
- **Smart Sorting**: Sort by latest, most liked, most viewed, or price
- **Featured Content**: Curated premium memes and trending content
- **Category System**: Organized content across 14+ categories

### 👥 **Social Features**

- **User Profiles**: Showcase your meme collection and stats
- **Like System**: Express appreciation for quality content
- **Creator Attribution**: Full credit and linking to meme creators
- **Transaction History**: Complete audit trail of all activities

### 📱 **Modern UI/UX**

- **Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching with system preference
- **Glass Morphism**: Modern, elegant design with backdrop blur effects
- **Smooth Animations**: Engaging micro-interactions and transitions

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Modern icon library
- **React Hook Form** - Form handling and validation

### **Backend & Database**

- **MongoDB** - Document database for flexible data storage
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Transactions** - ACID compliance for financial operations

### **AI Integration**

- **Google Gemini AI** - Advanced image analysis and content generation
- **Smart Suggestions** - AI-powered content optimization
- **Template Processing** - Automated meme enhancement

### **Additional Tools**

- **React Dropzone** - Drag-and-drop file uploads
- **React Hot Toast** - Beautiful notification system
- **Sharp** - High-performance image processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Gemini API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/memevault.git
   cd memevault
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install

# or

yarn install

# or

pnpm install
\`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

Add your environment variables:
\`\`\`env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev

# or

yarn dev

# or

pnpm dev
\`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
memevault/
├── app/ # Next.js App Router pages
│ ├── api/ # API routes
│ │ ├── ai/ # AI-powered endpoints
│ │ ├── memes/ # Meme CRUD operations
│ │ ├── transactions/ # Payment processing
│ │ └── coins/ # Coin management
│ ├── explore/ # Meme discovery page
│ ├── upload/ # Meme creation interface
│ ├── login/ # Authentication
│ └── signup/ # User registration
├── components/ # Reusable UI components
│ ├── ui/ # Shadcn/ui components
│ ├── MemeCard.tsx # Meme display component
│ ├── Navbar.tsx # Navigation header
│ └── SearchFilters.tsx # Advanced filtering
├── contexts/ # React Context providers
│ └── AuthContext.tsx # User authentication state
├── hooks/ # Custom React hooks
│ └── useBalanceUpdates.ts # Real-time balance sync
├── utils/ # Utility functions
│ └── balanceNotifier.ts # Cross-tab communication
├── public/ # Static assets
│ └── templates/ # Meme template images
└── lib/ # Shared utilities
└── utils.ts # Common helper functions
\`\`\`

## 🎯 Key Features Explained

### AI-Powered Content Creation

The platform leverages Google Gemini AI to enhance the meme creation experience:

- **Image Analysis**: Automatically analyzes uploaded images to suggest relevant titles, tags, and descriptions
- **Template Generation**: Uses AI to optimize meme text for maximum viral potential
- **Content Enhancement**: Improves existing descriptions and generates catchy titles

### Real-Time Economy

Built with a robust virtual coin system:

- **Secure Transactions**: MongoDB transactions ensure data consistency
- **Balance Synchronization**: Real-time updates across browser tabs using localStorage events
- **Economic Incentives**: Daily bonuses and upload rewards encourage participation

### Advanced Search & Discovery

Sophisticated filtering and sorting system:

- **Multi-criteria Search**: Search across titles, descriptions, tags, and creators
- **Smart Categorization**: 14+ categories for organized content discovery
- **Popularity Metrics**: Sort by likes, views, downloads, and recency

## 🔧 Configuration

### Environment Variables

| Variable                     | Description               | Required |
| ---------------------------- | ------------------------- | -------- |
| `MONGODB_URI`                | MongoDB connection string | ✅       |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini AI API key  | ✅       |

### Database Setup

The application uses MongoDB with the following collections:

- `users` - User profiles and authentication
- `memes` - Meme content and metadata
- `transactions` - Purchase and coin transfer records

## 📱 API Endpoints

### Memes

- `GET /api/memes` - Fetch memes with filtering and pagination
- `POST /api/memes` - Upload new meme content

### Transactions

- `GET /api/transactions` - User transaction history
- `POST /api/transactions` - Process meme purchases

### AI Services

- `POST /api/ai/analyze-image` - AI image analysis
- `POST /api/ai/generate-meme` - AI meme generation
- `POST /api/ai/generate-title` - AI title suggestions
- `POST /api/ai/enhance-description` - AI description improvement

### Coins

- `POST /api/coins/daily-bonus` - Claim daily coin bonus
- `GET /api/coins/leaderboard` - Fetch coin leaderboards

## 🎨 Design System

### Color Palette

- **Primary**: Blue to Purple gradient (`from-blue-500 to-purple-600`)
- **Secondary**: Yellow to Amber for coins (`from-yellow-100 to-amber-100`)
- **Accent**: Various gradients for categories and features

### Typography

- **Primary Font**: Inter (clean, modern sans-serif)
- **Display Font**: Poppins (for headings and emphasis)
- **Monospace**: Default system monospace for code

### Components

Built with Shadcn/ui for consistency and accessibility:

- Cards with glass morphism effects
- Responsive navigation with mobile-first design
- Accessible form controls and buttons
- Toast notifications for user feedback

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Test your changes thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Google Gemini** for AI capabilities
- **Vercel** for hosting and deployment
- **MongoDB** for reliable data storage
- **The meme community** for inspiration and content

## 🗺️ Roadmap

### Phase 1 (Current)

- ✅ Core marketplace functionality
- ✅ AI-powered content creation
- ✅ Virtual coin economy
- ✅ Real-time transactions

### Phase 2 (Coming Soon)

- 🔄 User profiles and social features
- 🔄 Advanced analytics dashboard
- 🔄 Mobile app development
- 🔄 NFT integration

### Phase 3 (Future)

- 📋 Creator monetization tools
- 📋 Advanced AI features
- 📋 Community governance
- 📋 Multi-language support

---

<div align="center">

**Made with ❤️ by the MemeVault Team**

[Website](https://memevault.com)

</div>
