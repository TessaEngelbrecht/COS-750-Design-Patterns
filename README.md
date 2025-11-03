# Observer Pattern Learning Platform

A comprehensive Next.js web application for teaching the Observer design pattern through interactive learning, quizzes, and visual UML diagram building.

## Project Overview

This application bridges the gap between theoretical understanding and practical application of the Observer design pattern by providing:

- **For Students**: Interactive learning modules, diagnostic assessments, adaptive quizzes, and UML diagram building
- **For Educators**: Comprehensive analytics dashboards with performance tracking and intervention tools

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts (built-in, no ApexCharts needed)
- **Font**: Poppins from Google Fonts
- **State Management**: React hooks with localStorage for mock data
- **UI Components**: shadcn/ui components

## Project Structure

\`\`\`
app/
├── layout.tsx                 # Root layout with Poppins font
├── globals.css               # Tailwind config and design tokens
├── page.tsx                  # Authentication gateway (login/signup)
├── educator/
│   └── dashboard/
│       ├── page.tsx          # Educator dashboard entry
│       └── layout.tsx        # Educator layout wrapper
└── student/
    ├── layout.tsx            # Student layout wrapper
    ├── dashboard/
    │   └── page.tsx          # Student home dashboard
    ├── pre-quiz/
    │   └── page.tsx          # Diagnostic pre-assessment
    ├── learning/
    │   └── page.tsx          # Learning materials (overview, videos, UML, code)
    ├── practice/
    │   └── page.tsx          # Practice quiz results
    ├── uml-builder/
    │   └── page.tsx          # Interactive UML diagram builder
    ├── cheat-sheet/
    │   └── page.tsx          # Observer pattern reference guide
    ├── quiz/
    │   └── page.tsx          # Final assessment quiz
    └── results/
        └── page.tsx          # Results and performance analytics

components/
├── auth/
│   ├── login-page.tsx        # Login form with role selection
│   └── signup-page.tsx       # Registration form
├── educator/
│   ├── dashboard.tsx         # Main educator dashboard with tabs
│   └── tabs/
│       ├── overview-tab.tsx  # Charts and analytics
│       ├── students-tab.tsx  # Student list with expandable details
│       ├── questions-tab.tsx # Quiz question management
│       └── learning-areas-tab.tsx # Performance by learning area
├── uml-builder/
│   └── index.tsx             # Drag-and-drop UML diagram builder
├── quiz-card.tsx             # Reusable question card component
├── step-indicator.tsx        # 5-step progress indicator
└── ui/                       # shadcn/ui components (default)
\`\`\`

## Key Features

### For Students

1. **Pre-Quiz Assessment**
   - Diagnostic questions covering different Bloom's taxonomy levels
   - Establishes baseline understanding
   - Routes to personalized learning path

2. **Learning Materials**
   - Overview tab: Definition, key concepts, components
   - Videos tab: Placeholder for instructional videos
   - UML Diagrams tab: Visual pattern representations
   - Code Examples tab: C++ implementation samples

3. **UML Builder**
   - Drag-and-drop interface to move classes around
   - Add attributes and methods to classes
   - Pre-populated with Subject, Observer, ConcreteSubject, ConcreteObserver
   - Visual connection lines between classes

4. **Practice & Assessment**
   - Multiple question types: Multiple choice, fill-in-the-blank, code fix
   - Immediate feedback with explanations
   - Performance tracked by Bloom's taxonomy level

5. **Cheat Sheet**
   - Quick reference for pattern components
   - Real-world examples and use cases
   - Advantages and disadvantages

6. **Results Dashboard**
   - Final score and improvement metrics
   - Time spent and resource access tracking
   - Performance breakdown by cognitive level
   - Personalized recommendations

### For Educators

1. **Overview Tab**
   - 4 professional charts showing:
     - Final assessment score distribution (histogram)
     - Question accuracy by question (stacked bar)
     - Bloom's taxonomy radar chart
     - Taxonomy level distribution

2. **Students Tab**
   - Expandable student list
   - Quick view: Name and overall score
   - Detailed view: Final score, improvement, practice quiz, time spent, cheat access
   - Intervention alerts for struggling students

3. **Questions Tab**
   - Quiz question management interface
   - Bloom's taxonomy selector (hexagon UI)
   - Question type selection (practice/final)
   - Question format options

4. **Learning Areas Tab**
   - Performance by cognitive level
   - Horizontal progress bars for each level
   - Percentage and question count

## Authentication

Mock authentication system using localStorage:

- **Demo Credentials (Student)**:
  - Email: designwithdesigners@gmail.com
  - Password: DesignWITHdesigners12345

- **Demo Credentials (Educator)**:
  - Role: Educator
  - Same credentials as above

Users are routed to appropriate dashboards based on role (student/educator).

## Design System

### Colors
- Primary: Teal (#0D9488)
- Accent colors: Pink (#EC407A), Green (#66BB6A), Blue (#29B6F6), Red (#EF5350), Purple (#AB47BC), Yellow (#FDD835)
- Neutral: White (#FFFFFF), Gray scale for text and backgrounds

### Typography
- Font Family: Poppins
- Weights: 400, 500, 600, 700, 800
- Line height: 1.5 for body text

### Layout
- Mobile-first responsive design
- Flexbox for most layouts
- CSS Grid for complex 2D layouts
- Consistent spacing using Tailwind scale

## Getting Started

### Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

### Building for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## Mock Data

The application uses mock data stored in component state and localStorage:

- Quiz questions with explanations
- Student performance metrics
- Bloom's taxonomy classifications
- Learning materials content

When connecting to a real backend, replace localStorage calls and mock data with API calls to your database.

## Integration Points

Ready to connect to your backend for:

- User authentication (replace localStorage)
- Quiz data and questions
- Student performance tracking
- Learning materials (videos, documents)
- Real-time analytics

All API integration points are marked with TODO comments for easy identification.

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML elements
- ARIA labels where appropriate
- Color-blind friendly palette
- Keyboard navigation support
- Sufficient contrast ratios (4.5:1 minimum)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized images and assets
- Code splitting for faster initial load
- Responsive design for all screen sizes
- Smooth animations and transitions

## Future Enhancements

1. Real database integration (PostgreSQL/MongoDB)
2. User authentication (Supabase/Auth0)
3. Actual video hosting
4. Export analytics as PDF/CSV
5. Real-time notifications
6. Multiple design pattern modules
7. Mobile app version
8. Dark mode support
9. Internationalization (i18n)
10. Advanced analytics and reporting

## Troubleshooting

### Authentication Issues
- Check browser console for errors
- Verify localStorage is enabled
- Clear browser cache and try again

### Chart Display Issues
- Ensure Recharts is properly installed
- Check responsive container dimensions
- Verify data structure matches chart expectations

### Styling Issues
- Rebuild Tailwind CSS: `npm run build`
- Clear `.next` folder: `rm -rf .next`
- Ensure globals.css is imported in layout.tsx

## Support & Feedback

For issues or suggestions, please reach out to the development team or open an issue in the repository.

## License

This project is part of the COS 214 Software Modeling course at the University of Pretoria.
