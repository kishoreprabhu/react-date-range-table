# Transaction Dashboard — Frontend Assessment

React + TypeScript + Vite + Ant Design + Tailwind CSS + Zustand

## Quick Start

```bash
npm install
npm run dev            # http://localhost:5173
```


## Features

### Calendar / DateRangePicker
- Custom-built calendar grid
- 90-day past restriction with disabled dates
- Max 10-day range with tooltip warning
- 10 worldwide timezones with GMT offset in label
- Predefined date messages (dot + hover tooltip on hover)
- Disabled dates (strikethrough, unclickable)
- "Add time" toggle shows HH:mm in label
- Cancel / Go actions

### Data Table
- 6 columns: ID, Name, Date, Amount, Status, Category
- **Sorting** — click header: ascend → descend → clear
- **Search** — by specific column or all columns
- **Pagination** — 5/10/20/50 rows per page, page number buttons with ellipsis
- Colour-coded status badges, zebra rows, hover highlight
