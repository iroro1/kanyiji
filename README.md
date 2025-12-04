# Kanyiji Marketplace

A modern e-commerce marketplace connecting African entrepreneurs, brands, and businesses with global buyers. Built with Next.js 14, TypeScript, and Tailwind CSS.

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
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: Zustand, React Context
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Email Service**: Resend (via Supabase SMTP)
- **Newsletter**: Mailchimp Marketing API
- **Payment**: Paystack (planned)
- **Data Fetching**: TanStack Query (React Query)

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

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=hello@kanyiji.ng
RESEND_FROM_NAME=Kanyiji Marketplace

# Newsletter (Mailchimp)
MAILCHIMP_API_KEY=your_mailchimp_api_key
MAILCHIMP_SERVER_PREFIX=us3
MAILCHIMP_LIST_ID=your_mailchimp_list_id

# Payment Gateway Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

See `docs/env.example` for a complete list of environment variables.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The project uses Supabase (PostgreSQL) with a complete database schema including:

- **User Management**: Profiles, authentication, roles
- **Products**: Product listings, categories, inventory
- **Vendors**: Vendor profiles, onboarding, verification
- **Orders**: Order management, status tracking
- **Email Rate Limiting**: Server-side rate limit tracking
- **Row Level Security**: Comprehensive RLS policies for data protection

See `docs/` directory for database setup scripts and documentation.

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

## 🔐 Authentication

The application uses Supabase Authentication with the following features:

- ✅ Email/password authentication
- ✅ Email verification with OTP
- ✅ Password reset functionality
- ✅ Session management
- ✅ User profile management
- ✅ Rate limiting for signup and email resend
- ✅ Custom email templates via Resend SMTP

See `docs/SUPABASE_SETUP.md` for authentication setup details.

## 💳 Payment Integration

Payment integration is planned for Phase 3:

- **Paystack**: Primary payment gateway for Nigeria (planned)
- **Flutterwave**: Secondary payment gateway for Pan-Africa (planned)
- **Bank Transfer**: Fallback payment method (planned)

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

### Phase 1: Foundation & UI Development ✅ (Completed)
- [x] Component library and design system
- [x] Responsive layouts (mobile-first approach)
- [x] African heritage-inspired design tokens
- [x] Homepage with hero section, featured products, and vendor showcases
- [x] Product listing and detail pages
- [x] Vendor registration and onboarding flow
- [x] User authentication UI (signup, login, password reset)
- [x] Footer with newsletter subscription
- [x] Navigation and routing structure

### Phase 2: Backend Integration & Authentication ✅ (Completed)
- [x] Supabase database setup with complete schema
- [x] User authentication system (email/password)
- [x] Email verification with OTP
- [x] Password reset functionality
- [x] User profile management
- [x] Vendor onboarding with document upload
- [x] Row Level Security (RLS) policies
- [x] Email service integration (Resend via Supabase SMTP)
- [x] Rate limiting (client-side and server-side)
- [x] Mailchimp newsletter integration
- [x] API routes for authentication and user management

### Phase 3: Core Marketplace Features 🚧 (In Progress)
- [x] Product management (CRUD operations)
- [x] Category management
- [ ] Shopping cart functionality
- [ ] Checkout process
- [ ] Order management system
- [ ] Payment gateway integration (Paystack)
- [ ] Order tracking and status updates
- [ ] Product search and filtering
- [ ] Product reviews and ratings

### Phase 4: Vendor & Admin Features 📋 (Planned)
- [ ] Vendor dashboard
  - [ ] Product management interface
  - [ ] Order management
  - [ ] Sales analytics
  - [ ] Inventory management
- [ ] Admin panel
  - [ ] User management
  - [ ] Vendor approval workflow
  - [ ] Category management
  - [ ] System analytics
  - [ ] Content management

### Phase 5: Advanced Features 📋 (Planned)
- [ ] Wishlist functionality
- [ ] Product comparison
- [ ] Advanced search with filters
- [ ] Product recommendations
- [ ] Customer reviews and ratings
- [ ] Shipping integration
- [ ] Multi-currency support
- [ ] International shipping options
- [ ] Return and refund management
- [ ] Customer support chat
- [ ] Push notifications
- [ ] Email marketing automation

---

**Built with ❤️ for Africa's digital commerce future**
