# Device Management concepts

Frontend prototype for exploring workflows across Trimble construction products. There is no backend. Screens read local mock data and keep interaction state in React. Experiment settings are the only values stored in `localStorage`.

## Products

The navbar apps menu switches products. Device Management is the default.

| Product | Home |
| --- | --- |
| WorksManager | `/worksmanager/projects` |
| Device Management | `/device-management` |
| Trimble Connect | `/connect/projects` |
| Admin Portal | `/admin-portal/account/users` |

Device Management keeps the current map, device inventory, device details, and asset details. Older Device Management URLs such as `/devices` redirect to the new paths. Trimble Connect project settings are at `/connect/:projectId/settings`.

## Setup

```bash
npm install
npm run dev
```

The dev server prints a local URL. `npm run build` typechecks and builds the static app. `npm run preview` serves that build.

## Layout

- `src/modules/device-management` — Device Management pages, tables, map, and rail
- `src/modules/worksmanager`, `src/modules/connect`, `src/modules/admin-portal` — other products
- `src/components/layout` — navbar, side navigation, and prototype settings
- `src/data` — shared devices, projects, assets, users, and subscriptions
- `src/experiments` — persona, project-assignment variant, inventory view, and Device Management rail
- `src/assets/custom-icons` — custom SVG icons
- `src/assets/images` — images
- `src/assets/map-markers` — map marker art

Shared TypeScript models are re-exported from `src/types`.
