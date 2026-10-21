# FIRECO Website V2 — English / العربية

Complete static upload package. Read **START-HERE.txt**.
Place the contents at the root of the existing repository. Include **both**
the **ar** and **clients** folders. No build step is required.

## Admin portal

After deployment, open `/admin/` and sign in with the GitHub account that has
write access to `Ebrahim-66/fireco-web`. The admin edits `data/clients.json`
and `data/settings.json`, then commits the update to `main`. Use **Clients and
Project References** to add, edit, reorder or remove bilingual clients. Use
**Company Profile PDF** to upload and select the current profile document.
Vercel will publish the resulting GitHub commit through its existing project.

Eight main pages cover the homepage, fire alarm systems, firefighting systems
and maintenance in English and Arabic. Six compatibility pages preserve older
links and forward visitors to the relevant general service.

Company details and quality content, UAE coverage, client imagery and sectors,
number animations, responsive layouts and the enquiry selector are updated
in both languages. All 71 client/project references remain available.

The form prepares an email to info@firecots.com in the visitor's email app.
It does not send through a server. Canonical URLs and search files target
https://firecots.com/. The package does not deploy itself or connect a domain.
See QA-NOTES.txt and SOURCES.md.
