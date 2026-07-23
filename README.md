# Regex & Cron Visualizer

A modern, lightweight developer tool for testing and visualizing regex patterns and cron expressions in real-time. Built as a pure frontend application with Next.js and TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### 🔍 Regex Mode
- **Live Pattern Testing**: Test regex patterns against your text in real-time
- **Visual Highlighting**: See all matches highlighted instantly as you type
- **Token Explanations**: Get plain-English explanations of each regex component
- **Match Details**: View all matches with their positions and capture groups
- **Flag Support**: Toggle common flags (global, case-insensitive, multiline)
- **Error Handling**: Clear error messages for invalid patterns

### ⏰ Cron Mode
- **Expression Validation**: Validate cron expressions with instant feedback
- **Human-Readable Explanations**: See what your cron expression means in plain language
- **Next Executions**: Preview the next 10 scheduled run times
- **Relative Time**: View how far away each execution is from now
- **Quick Templates**: One-click examples for common schedules
- **Standard 5-Field Format**: Support for the classic `minute hour day month weekday` syntax

### 🎨 Design
- **Dark Mode by Default**: Easy on the eyes for long coding sessions
- **Light Mode Toggle**: Switch themes with one click
- **Clean UI**: Minimal, focused interface inspired by regex101.com and crontab.guru
- **Responsive**: Works great on desktop (optimized for developer workflows)

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/reg-cron-parser.git
cd reg-cron-parser

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Build for Production

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

## Usage

### Testing Regex Patterns

1. Switch to the **Regex** tab
2. Enter your regex pattern in the pattern field
3. Toggle flags (g, i, m) as needed
4. Enter test text in the text area
5. View:
   - Highlighted matches in real-time
   - Token-by-token explanations
   - All matches with capture groups and positions

**Example patterns to try:**

```regex
^[\w\.-]+@[\w\.-]+\.\w+$          # Email validation
^(\+46|0)7[\d\s-]{8,}$            # Swedish phone numbers
^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$  # Date (YYYY-MM-DD)
```

### Testing Cron Expressions

1. Switch to the **Cron** tab
2. Enter a cron expression (5 fields: minute, hour, day, month, weekday)
3. Or click a quick template to get started
4. View:
   - Human-readable explanation in Swedish
   - Next 10 execution times
   - Relative time until each execution

**Example expressions to try:**

```cron
* * * * *         # Every minute
0 9 * * *         # Every day at 9:00 AM
*/15 * * * *      # Every 15 minutes
0 8 * * 1-5       # Weekdays at 8:00 AM
0 0 1 * *         # First day of every month at midnight
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Cron Parsing**: [cron-parser](https://github.com/harrisiirak/cron-parser)
- **Architecture**: Pure client-side rendering (no backend required)

## Project Structure

```
reg-cron-parser/
├── app/
│   └── page.tsx                 # Main page with tab navigation and theme toggle
├── components/
│   ├── RegexTester.tsx          # Regex testing component
│   └── CronTester.tsx           # Cron expression component
├── lib/
│   ├── regex-explainer.ts       # Regex token parser and explainer
│   └── cron-explainer.ts        # Cron expression human-readable translator
└── public/                      # Static assets
```

## How It Works

### Regex Explanation
The app includes a custom regex parser that breaks down patterns into tokens and provides explanations:
- Character classes (`\d`, `\w`, `\s`)
- Anchors (`^`, `$`, `\b`)
- Quantifiers (`*`, `+`, `?`, `{n,m}`)
- Groups (capturing, non-capturing, lookaheads)
- Character sets and ranges
- Special characters and escapes

### Cron Parsing
Cron expressions are validated and parsed using the `cron-parser` library, then translated to Swedish using a custom explainer that handles:
- Wildcards and ranges
- Step values and lists
- Month and weekday names
- Special syntax (`,`, `-`, `/`, `*`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Future Enhancements

Potential features for future versions:
- Share patterns via URL
- Save favorite patterns locally
- Export cron schedules to calendar format
- Extended cron syntax (6-field with seconds)
- Regex performance testing
- More regex explanation tokens
- Multi-language support for cron explanations

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Inspired by [regex101.com](https://regex101.com) and [crontab.guru](https://crontab.guru)
- Built with modern web technologies for a fast, responsive experience
- No tracking, no analytics, no backend - just pure client-side tools

---

**Happy pattern matching! 🎯**
