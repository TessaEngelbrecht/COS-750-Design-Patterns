# Observer Pattern Learning Platform

A comprehensive Next.js web application for teaching the Observer design pattern through interactive learning, quizzes, and visual UML diagram building.


## Team

| Name | GitHub | Email |
|------|--------|-------|
| Tessa Engelbrecht | TessaEngelbrecht | u22633601@tuks.co.za|
| Mignon Erasmus | MignonErasmus| u22492586@tuks.co.za|
| Xadrian van Heerden | XadrianvHeerden| u22699572@tuks.co.za|
| Cathryn Ackerman | CatAcker| u24076491@tuks.co.za|
| Joelle Pangu | JoellePangu| u25729790@tuks.co.za|

## Project Overview

This application bridges the gap between theoretical understanding and practical application of the Observer design pattern by providing:

- **For Students**: Interactive learning modules, diagnostic assessments, adaptive quizzes, and UML diagram building
- **For Educators**: Comprehensive analytics dashboards with performance tracking and intervention tools

## Project Resources

### Documentation
- [SRS Document](https://drive.google.com/file/d/1f0qGpXgRTF7SGeFAXcx8BT0Y8xywMejV/view?usp=sharing)
- [ID document](https://drive.google.com/file/d/1D-tXxrqTFmNviuI6_QFi_b7sTG98TiKK/view?usp=sharing) *(Add link here)*
- [Brainstorm doc](https://docs.google.com/document/d/1Eop76wx5tPSa-NbLFFW49BTACVw--hcbWRLy1aRBQWo/edit?usp=drive_link)
- [Assignment/Quiz info](https://docs.google.com/document/d/1zTYszqJeDi0885-hs1n1OaBtZ2us5q0UwA6uApQs8Jw/edit?usp=drive_link)

### Design
- [Figma Design](https://www.figma.com/design/jnRrF8zGrQ3G2j7xSOSZ7X/Education-Semester-Project?node-id=0-1&t=FUWhgeEpf4nRuzR0-1) 
- [Canva Presentation (Read-Only)](https://www.canva.com/design/DAG45OqRkhs/bJXQwzSyLKb_UNLjyiH6xQ/view?utm_content=DAG45OqRkhs&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf6cc028203) 

## Technology Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts (built-in, no ApexCharts needed)
- **Font**: Poppins from Google Fonts
- **State Management**: React hooks with localStorage for mock data
- **UI Components**: shadcn/ui components


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
- Desktop-first responsive design
- Flexbox for most layouts
- CSS Grid for complex 2D layouts
- Consistent spacing using Tailwind scale

### Lookup Tables

- `bloom_level` - Remember, Understand, Apply, Analyze, Evaluate, Create
- `difficulty_level` - Easy, Medium, Hard
- `question_format` - multiple-choice, select-multiple, fill-in-blank, identify-error
- `quiz_type` - Practice Quiz, Final Quiz
- `sections` - Theory & Concepts, Code Implementation, Pattern Participants, UML Diagrams


## Setup

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. **Clone the repo**

git clone https://github.com/TessaEngelbrecht/COS-750-Design-Patterns.git
cd COS-750-Design-Patterns


2. **Install dependencies**

npm install


3. **Set up environment variables**

Create a `.env.local` file in the root directory:

NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key


Get these from your Supabase project dashboard under **Settings > API**.

4. **Run the development server**

npm run dev


5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

npm run build
npm start


## Authentication

Managed through Supabase Auth. Email/password authentication is set up by default.

## Mobile Support

The app is fully responsive. The lesson navigation adapts to mobile with a tab + dropdown interface instead of the desktop sidebar.

## Deployment

Deployed on Vercel. Make sure to add your environment variables in the Vercel dashboard under Project Settings > Environment Variables.


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


