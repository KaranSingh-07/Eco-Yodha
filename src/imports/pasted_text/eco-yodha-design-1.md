Act as an elite UI/UX designer specializing in gamified SaaS platforms and EdTech dashboards. Generate a high-fidelity, clean, modern responsive web application design system and key screens for "Eco-Yodha (Prakriti)", a gamified environmental education platform built for the Smart India Hackathon. 

### DESIGN SYSTEM & ART DIRECTION:
- Theme: "Eco-Tech Developer Aesthetic". Sleek, clean, high-contrast.
- Color Palette: Deep obsidian/charcoal background (#0B0F12), crisp white primary typography, muted slate borders/secondary text. Vibrant accents: Emerald Green (success/nature/eco-points), Cyan/Electric Blue (water score/AI interactions), Terracotta/Clay (soil score), and Cyber Purple (gamification/leaderboards).
- Component Style: Border radius 12px, soft glows for interactive cards, clean 1px borders, subtle bento-box layouts, and designated spaces for fluid animations (Lottie/GSAP placeholders).
- Navigation: Left-docked sticky sidebar for desktop, collapsible drawer for mobile.

### SCREEN 1: LANDING & DUAL-TRACK ONBOARDING
- Layout: Split-screen interface. Left side: High-impact hero typography with a graphic placeholder for the project's evolving digital companion avatar. Right side: Dual-track authentication forms.
- Interactive Elements: Tabbed selector for "Student" and "Teacher/Institution" roles. 
- Student Form: Fields for independent email registration OR a prominent field to input a "Unique 6-Digit Classroom Code". Include a micro-copy disclaimer: "Entering a code places you in your teacher's verification queue for performance syncing."

### SCREEN 2: THE DUOLINGO-STYLE INTERACTIVE LEARNING MAP
- Layout: Vertical-scrolling centerpiece map layout mimicking a progressive game path. Linear but fluid path nodes representing environmental concepts.
- Node Visual States: Locked (grayed out with a subtle padlock icon), Active/Current (pulsing emerald glow with the Personalized Companion Avatar hovering next to it), and Completed (emerald checkmark).
- Path Sequence: Node 1: Concept Video -> Node 2: Mini Quiz 1 -> Node 3: Concept Video 2 -> Node 4: Mini Quiz 2 -> Node 5: Final Major Quiz -> Node 6: Community Task Node (glowing purple boundary denoting a high-value quest).

### SCREEN 3: STUDENT PERSONAL ECO-DASHBOARD (BENTO GRID)
- Layout: 3-column structural layout.
- Hero Card (Top Left): "Evolving Companion Avatar Stage" – displays the avatar's current physical evolution graphics based on user level, accompanied by a level progress bar.
- Core Equation Widget (Top Center): Large metric counter showcasing Lifetime Eco-Points, visually broken down by the formula layout: [Eco-Points = Carbon Score + Water Score + Soil Score].
- Analytics Cards (Bottom Grid): 3 distinct line-graphs showing weekly progress trends for:
  1. Carbon Score (Emerald Green trend line)
  2. Water Score (Electric Cyan trend line)
  3. Soil Score (Terracotta trend line)

### SCREEN 4: BITE-SIZED VIDEO LECTURE & MINI-QUIZ INTERFACE
- Layout: Balanced 70:30 split-screen layout.
- Left Panel (Learning Player): Premium dark-mode embedded video player container displaying a "5-6 Minute Bite-Sized Lecture" timeline, with a persistent progress tracker at the top.
- Right Panel (Interactive Companion Quiz): Clean card interface where the Personalized Companion Avatar acts as a live prompt motivator. Displays multiple-choice questions with high-contrast active states, instant feedback micro-interactions (Green for correct, Red for incorrect), and an ongoing mini-quiz completion progress bar.

### SCREEN 5: REGION-CENTRIC COMMUNITY TASKS & QUEST LOG
- Layout: Split bento layout highlighting active environmental quests.
- Primary Focus Card: Heavy visual styling showcasing "Region-Centric Task: Punjab Ecological Action". Displays action details (e.g., "Measure household water usage and implement a 24-hour conservation strategy" or "Stubble burning awareness tracking").
- Task State Callout: A banner emphasizing that this quest is "Optional to unlock next level but awards Double Eco-Points and Unique Badges".
- Reward Drawer: Horizontal row showing earned high-fidelity "Eco-Badges" locked in translucent frames or glowing in full color if unlocked. Include a secure drag-and-drop file upload zone for proof verification.

### SCREEN 6: DUAL LEADERBOARD ARTIFACT
- Layout: Two distinct tabular layout columns positioned side-by-side.
- Left Column ("Weekly Sprint Board"): Shows user ranks, profile avatars, and weekly point gains. Features a prominent countdown widget header displaying: "Resets Sunday at 11:59 PM" to mitigate hyper-competition.
- Right Column ("Global Board"): Persistent leaderboard layout tracking lifetime achievements and cumulative historical ranks.
- User Row Highlight: A distinct, neon-bordered card row that pins the logged-in user’s current rank to the bottom of the viewport if they aren't in the top ten view.

### SCREEN 7: INTEGRATED AI COMPANION CHATBOT PANEL
- Layout: A slide-out right drawer panel or floating expandable widget overlaying the main app space.
- Header: Avatar name, active status dot, and description ("AI Eco-Companion - Trained to solve environmental queries").
- Chat UI: Alternating dark-slate text bubbles for user inputs and deep-charcoal bubbles for AI responses. Response bubbles should support structured markdown rendering (bullet points, bold text). Include quick-action chip buttons at the bottom for instant questions.

### SCREEN 8: TEACHER & INSTITUTION ANALYTICS DASHBOARD
- Layout: Admin panel split into administrative management and classroom metrics.
- Verification Queue Widget: Clean actionable table showing pending student registrations with columns for Student Name, Registration Date, Applied Classroom Code, and immediate "Approve / Deny" button actions.
- Performance Roster Matrix: Student grid featuring automated grade tracking. Columns show Student Name, Current Level, Lifetime Eco-Points, and a final automated column: "Report Card Letter Grade" (mapping ranks directly to descriptive academic grades A, B, C).