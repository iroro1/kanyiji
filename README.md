# Kanyiji Marketplace

A modern e-commerce marketplace connecting African artisans, brands, and businesses with global buyers. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-vendor Marketplace**: Support for multiple vendors with individual storefronts
- **Product Management**: Complete product lifecycle management
- **Order Processing**: End-to-end order management system
- **Payment Integration**: Paystack and Flutterwave payment gateways (planned)
- **Responsive Design**: Mobile-first design approach
- **Beautiful UI**: Modern, African heritage-inspired design system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kanyiji
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy the environment example file and fill in your credentials:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Kanyiji Marketplace

# Payment Gateway Configuration (for future use)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema (Future Implementation)

The database schema will be implemented in the next phase. For now, the app uses mock data for UI development.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── sections/          # Page sections
│   └── ui/                # Reusable UI components
├── types/                  # TypeScript type definitions
│   └── index.ts           # Main types
└── utils/                  # Utility functions
    └── helpers.ts         # Helper functions
```

## 🎨 Design System

The project uses a custom design system with African heritage-inspired colors:

- **Primary**: Kanyiji Gold (#D4AF37)
- **Secondary**: African Sky Blue (#1E3A8A)
- **Accent**: Savanna Green (#059669)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 📱 Responsive Design

The marketplace is built with a mobile-first approach and includes:

- Responsive grid layouts
- Touch-friendly interactions
- Optimized mobile navigation
- Progressive Web App (PWA) features

## 🔐 Authentication (Future Implementation)

User authentication will be implemented in the next phase using a backend service.

## 💳 Payment Integration (Future Implementation)

The marketplace will support multiple payment gateways:

- **Paystack**: Primary payment gateway for Nigeria
- **Flutterwave**: Secondary payment gateway for Pan-Africa
- **Bank Transfer**: Fallback payment method

## 🚚 Shipping & Logistics (Future Implementation)

Basic shipping features will include:

- Shipping cost calculation
- Order tracking
- Delivery status updates
- Return management

## 🧪 Testing

To run tests:

```bash
npm run test
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The project can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the project documentation

## 🔮 Development Phases

### Phase 1: UI Development ✅ (Current)
- [x] Component library
- [x] Design system
- [x] Responsive layouts
- [x] Mock data integration

### Phase 2: Backend Integration 🚧
- [ ] Database setup
- [ ] Authentication system
- [ ] API endpoints
- [ ] Real data integration

### Phase 3: Advanced Features 📋
- [ ] Payment processing
- [ ] Order management
- [ ] Vendor dashboard
- [ ] Admin panel

---

**Built with ❤️ for Africa's digital commerce future**
