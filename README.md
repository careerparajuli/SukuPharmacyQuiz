# Pharmacy Quiz: GitHub Folder Edition

This is a static, free GitHub Pages web app. It works on Windows, Mac and iPad.

## Publishing a NEW GitHub repository

1. Create a **public** repository in GitHub. Any repository name works (for example `pharmacy-quiz-v2`).
2. Upload the **contents** of this folder to the repository root, not the outer folder or the ZIP itself. Keep `vendor/jszip.min.js` inside `vendor/` and `.docx` files inside `quizzes/`.
3. Go to **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/(root)`, then save.
4. Open the published website. The app detects your GitHub username and repository from its website address and asks the public GitHub API for files inside `quizzes/`.

## Adding new quizzes

Open the repository on GitHub → click **quizzes** → **Add file → Upload files** → upload a correctly formatted `.docx` → **Commit changes**. When the website is published, click **Refresh GitHub Quizzes** (or reopen the site). The quiz becomes available to everyone with the link. GitHub files are PUBLIC.

**Important:** Adding Word files to the `quizzes/` folder is enough. There is no JSON manifest to maintain and no GitHub Actions setup or API credentials needed. GitHub's public API may apply unauthenticated rate limits; if the list cannot refresh, try later. Already cached quizzes remain available on the device.

## Using quizzes

* **GitHub shared quiz:** automatically listed and loaded from `quizzes/`. To remove it for everybody, remove the Word file in GitHub (the website will update on refresh). The app does not show a Delete button for GitHub shared quizzes.
* **Import Word:** imports a *local* quiz only on that device. It does **not** add it to GitHub. Local quizzes have a Delete button.
* Progress, scores, and private imported quizzes are stored in that device's browser storage. Export/Import Backup moves saved data but does not continuously sync progress.
* If you replace a GitHub Word document and change its questions or answer key, past progress for that quiz is reset on that device. If only explanatory text changes, it keeps past answers.

## Required Word format

Each question is a separate paragraph heading `Question 1`, then `Type: MCQ` or `Type: SATA`, question text, `Options:`, choices `a. ...` through `e. ...`, `Correct Answer: B` or `Correct Answers: A, C`, then `Explanation:` and explanation text. SATA may have one or more correct choices.

## Notes

* A public GitHub repository makes the Word documents accessible to anyone. Do not upload private material or content you don't have permission to share.
* The GitHub contents API lists up to 1,000 files in a single folder; this version loads the top-level `.docx` files in `quizzes/`.
* The app's offline cache keeps already loaded quizzes when internet is unavailable. First-time GitHub quiz loading needs internet.
* Long quizzes may use significant browser storage; export backups regularly.
