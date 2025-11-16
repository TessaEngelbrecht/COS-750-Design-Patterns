# Quick Start Guide

## Accessing the Application

1. Open `http://localhost:3000`
2. You'll be redirected to the login page

## Student Flow

### Login as Student
- **Email**: designwithdesigners@gmail.com
- **Password**: DesignWITHdesigners12345
- Select **Student** role
- Click **LOG IN**

### Student Learning Path
1. **Dashboard** - Overview of all available modules
2. **Pre-Quiz** - Take diagnostic assessment (~3 questions)
3. **Learning Materials** - View content (4 tabs: Overview, Videos, UML, Code)
4. **UML Builder** - Drag classes, add attributes/methods
5. **Practice Quiz** - Take practice assessment
6. **Cheat Sheet** - Reference guide for Observer pattern
7. **Final Quiz** - Take final assessment
8. **Results** - View performance breakdown by cognitive level

## Educator Flow

### Login as Educator
- **Email**: designwithdesigners@gmail.com
- **Password**: DesignWITHdesigners12345
- Select **Educator** role
- Click **LOG IN**

### Educator Dashboard
- **Overview Tab** - 4 charts showing:
  - Score distribution histogram
  - Question accuracy bar chart
  - Bloom's taxonomy radar
  - Taxonomy distribution bar chart
  
- **Students Tab** - Click student rows to expand and see:
  - Final score
  - Improvement percentage
  - Practice quiz score
  - Time spent
  - Cheat sheet access count
  - Intervention alerts for struggling students

- **Questions Tab** - Interface for creating questions with:
  - Bloom's taxonomy selection (hexagon UI)
  - Question type (Practice/Final)
  - Question format options
  - Answer fields

- **Learning Areas Tab** - Performance breakdown:
  - Remember, Understand, Apply, Analyze, Evaluate, Create
  - Progress bars with percentages
  - Question counts

## Key Interactions

### UML Builder
- **Drag classes** - Click and drag any class box to move it
- **Select classes** - Click on a class to select it (highlights in teal)
- **Add attributes** - Type attribute name and click "Add Attribute"
- **Add methods** - Type method name and click "Add Method"
- **Delete classes** - Click trash icon on selected class
- **Connections** - Visual lines connect classes automatically

### Quiz Features
- **Multiple Choice** - Click radio button to select answer
- **Fill in Blank** - Type answer in text field
- **Code Fix** - Identify line number with error
- **Navigation** - Previous/Next buttons to move between questions
- **Immediate Feedback** - See correct answer and explanation after each question

### Dashboard Charts
- **Hover tooltips** - Hover over chart elements for details
- **Responsive** - Charts adapt to screen size
- **Color coded** - Each metric has distinct color for easy identification

## Mock Data Notes

- All student data is mocked and stored in component state
- localStorage is used for session persistence
- Refresh page to reset mock data to defaults
- No real backend connectivity (yet)

## Next Steps for Integration

1. Connect to your database (PostgreSQL recommended)
2. Implement real authentication system
3. Build API endpoints for quiz questions and results
4. Add video hosting for learning materials
5. Implement real-time performance tracking
6. Add email notifications for educators
