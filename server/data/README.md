# Pakistani doctor demonstration dataset

The dataset contains 15 fictional profiles, with real hospital names used only as sample affiliations and stock portraits used illustratively. No real physician identity, qualification, or hospital affiliation is asserted. Every account uses +92 317 7676560.

The reset script uses the same Doctor model and bcrypt password hashing as registration. Each required document field contains a PDF visibly marked DEMO PLACEHOLDER - NOT A CREDENTIAL. The profileImage field contains an external image URL, which both existing frontends support.

Photo source links and photographer credits are stored alongside the profiles in pakistani-doctors.json. Portraits were found through web image searches and are hosted by Pexels; no generated images are used. The credential report also lists all photo sources.

Hospital references:
- [Aga Khan University Hospital, Karachi](https://hospitals.aku.edu/pakistan/karachi/pages/default.aspx)
- [Shifa International Hospital, Islamabad](https://shifa.com.pk/contact-us)
- [Shalamar Hospital, Lahore](https://shalamarhospital.org.pk/)

Run node seed.js from server for a read-only preview. The destructive command node seed.js --apply --database=test archives the configured database and uploads, replaces all application collections with these 15 doctors, checks every login, and writes new random passwords under server/private/<run timestamp>/. It intentionally requires the database name to match. Do not rerun it merely to restart the app: rerunning a reset changes all accounts and passwords.

The first completed reset was 2026-10-16T08:59:49.131Z. Its database and upload backup is under server/backups/2026-10-16T08-59-49-131Z/. Its login sheet and CSV are under server/private/2026-10-16T08-59-49-131Z/. These private directories are excluded from version control and are not served by Express.

## Health blog dataset

`health-blogs.json` contains 15 patient-education articles covering distinct conditions. Each has a unique Unsplash image URL, checked by the seeder before it changes the database. Preview the configured database with `npm run seed:blogs` from `server`; replace only its blog collection with `npm run seed:blogs -- --apply --database=<database-name>`. The seeder saves the previous blog documents under `server/backups/` first. It does not alter other collections. Article images are externally hosted and require internet access in the browser.
