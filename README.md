# QA Testing System

A comprehensive Progressive Web App (PWA) and Developer Dashboard for testing AI recommendations across multiple categories and demographics.

## 🚀 Features

### PWA (Progressive Web App)
- **Simple Testing Interface**: Clean, mobile-friendly interface for QA testers
- **Screenshot Upload**: Upload screenshots when AI recommendations are incorrect
- **Test History**: View completed tests and results
- **Offline Support**: Works offline with service worker
- **Mobile Optimized**: Responsive design for all devices

### Developer Dashboard
- **Admin Interface**: Comprehensive dashboard for developers
- **Statistics Overview**: Real-time stats on test accuracy and completion
- **Issue Management**: Review, annotate, and manage reported issues
- **Bulk Operations**: Filter and manage multiple test results
- **Screenshot Review**: View uploaded screenshots for context

### Test Query Generation
- **Demographic Variations**: Queries tailored by age, gender, culture
- **Natural Language**: Realistic user queries with typos and variations
- **Multiple Categories**: 15+ categories with 100+ sub-categories
- **Adversarial Testing**: ~30% of queries include mild issues for robustness

## 📊 Test Categories

### Beauty Products (130 queries)
- Skincare, Body, Tools, Hair, Intimacy/Personal care
- Sun/Tanning, Fragrance, Dental, Vitamins/Supplements
- Makeup, Nails, Men's, Health & Wellness

### Bridal (60 queries)
- Inspiration, Dresses, Accessories
- Photographers, Planners, Videographer

### Baby, Children, Pregnancy & Postpartum (80 queries)
- Clothing, Products, Decor & Furniture, Feeding
- Resources & Services, Beauty & Skincare, Bath & Body
- Strollers, Toys & Games

### Pets (30 queries)
- Grooming, Food, Products

### City Guides - Beauty Services (60 queries)
- New York, London, Paris, Miami, Tokyo, Madrid
- Location-specific beauty service queries

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database for lightweight deployment
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend (PWA)
- **Vue.js 3** with Composition API
- **Vite** for fast development and building
- **Pinia** for state management
- **Vue Router** for navigation
- **PWA Plugin** for offline support

### Frontend (Dashboard)
- **Vue.js 3** with Composition API
- **Vite** for development
- **Pinia** for state management
- **Chart.js** for data visualization

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd qa-testing-system
npm run install:all
```

2. **Initialize the database:**
```bash
node init-db.js
```

3. **Start the server:**
```bash
npm start
```

4. **Access the applications:**
- **PWA**: http://localhost:3000
- **Dashboard**: http://localhost:3000/admin

### Default Credentials

**Admin User:**
- Email: `admin@qa-testing.com`
- Password: `admin123`

**Tester User:**
- Email: `tester@qa-testing.com`
- Password: `tester123`

## 📱 Usage

### For QA Testers (PWA)

1. **Sign In**: Use tester credentials or create new account
2. **Test Interface**: 
   - Review the AI query and constraints
   - Test the query in your AI application
   - Mark as "Correct" if results are good
   - Mark as "Incorrect" and upload screenshots if issues found
3. **Test History**: Review your completed tests

### For Developers (Dashboard)

1. **Admin Sign In**: Use admin credentials
2. **Dashboard Overview**: 
   - View statistics and accuracy rates
   - Review recent issues
   - Manage test results
3. **Results Management**:
   - Filter by category, status, or result type
   - Review reported issues with screenshots
   - Add developer annotations
   - Mark issues as completed or flagged

## 🔧 Development

### Running in Development Mode

```bash
# Start backend server
npm run dev

# In separate terminals:
cd pwa && npm run dev
cd dashboard && npm run dev
```

### Building for Production

```bash
npm run build
```

### Database Schema

**Users Table:**
- `id`, `email`, `password`, `role`, `name`, `created_at`, `updated_at`

**Test Cases Table:**
- `id`, `category`, `sub_category`, `city_or_locale`, `demographic_profile`
- `query_text`, `query_intent`, `constraints`, `adversarial_features`
- `expected_answer_type`, `status`, `created_at`, `updated_at`

**Test Results Table:**
- `id`, `test_case_id`, `tester_id`, `is_correct`, `notes_problem`
- `expected_answer`, `screenshots`, `developer_annotations`
- `status`, `created_at`, `updated_at`

## 📈 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Test Cases
- `GET /api/test-cases` - Get test cases (with filters)
- `GET /api/test-cases/:id` - Get specific test case

### Test Results
- `POST /api/test-results` - Submit test result
- `PUT /api/test-results/:id` - Update test result (admin only)

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/results` - Get all results (admin only)

## 🎯 Test Query Examples

**Beauty Products:**
- "i need a hair mask for curly hair that won't weigh it down, under $25"
- "vitamin c serum that layers under sunscreen, no pilling"

**City Guides:**
- "facial spa in Manhattan, luxury treatment"
- "blowout bar in Brooklyn, same day appointment"

**Bridal:**
- "rustic wedding ideas for outdoor ceremony, budget-friendly"
- "wedding photographer in NYC, documentary style"

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- File upload validation
- CORS configuration
- Helmet.js security headers

## 📱 PWA Features

- **Service Worker**: Offline functionality
- **App Manifest**: Installable on mobile devices
- **Responsive Design**: Works on all screen sizes
- **Push Notifications**: Ready for future implementation
- **Background Sync**: Queue actions when offline

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

### Production Build
```bash
npm run build
npm start
```

## 📊 Monitoring & Analytics

The system tracks:
- Total test cases and completion rates
- Accuracy rates by category
- Issue frequency and types
- Tester performance metrics
- Developer response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for AI Recommendations QA Testing**
