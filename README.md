# Trang Dental Clinic Website

Static bilingual website for Trang Dental Clinic. Vietnamese is the default language and English can be selected from the header.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository under `https://github.com/thutrangr07`.
2. In the repository, open **Settings** > **Pages**.
3. Choose **Deploy from a branch**.
4. Select the branch, then select `/ (root)` as the publishing folder.
5. Save and wait for GitHub Pages to publish the site.

## Content to Update

- Hotline in `index.html`
- Clinic address in `index.html`
- Contact email in `index.html`
- Formspree form ID in the form `action`
- Any real service names, pricing, doctors, certifications, and working hours

## Files

- `index.html`: page structure and bilingual content markers
- `styles.css`: responsive visual design
- `script.js`: language switcher and mobile navigation
- `assets/hero-clinic.png`: generated hero image for the homepage
- `app.html`: zero-cost local-first clinic management MVP
- `app.css`: management app interface
- `app.js`: localStorage data layer, backup/import, upgrade thresholds

## Zero-Cost Management MVP

Open `app.html` to try a simple management app for patients, appointments, payments, and upgrade settings.

The app intentionally starts with no backend and stores data in the browser using `localStorage`. This keeps initial hosting and database cost at 0 VND, but it is only suitable for evaluation or very early internal use on one machine.

Upgrade triggers are configurable in the app:

- patient count threshold
- monthly revenue threshold
- internal staff count
- storage mode: local-first, cloud-ready, or cloud backend

When the clinic starts using real patient data across multiple staff members, move storage to a proper backend with authentication, access control, audit logs, and automated backups.
