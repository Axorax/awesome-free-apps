# Contribution Guidelines

Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

Read these rules first and then make a PR or contribute. If you don't know how to do that, then check [how-to-contribute.md](how-to-contribute.md)

- [Suggesting an app or any support](#-suggesting-an-app-or-any-support)
- [Editing the list](#-editing-the-list)
- [Code contributions](#-code-contributions)
- [Recommended icon requirements](#-recommended-icon-requirements)
- [Maintainer guide](#-maintainer-guide)

## — Suggesting an app or any support

You can do this in a few ways. Like:

- Making an issue in the repository. [Click here to make one.](https://github.com/Axorax/awesome-free-apps/issues/new?template=Blank+issue)
- Joining the Discord server and messaging there. [Click here to join.](https://discord.com/invite/nKUFghjXQu)

## — Editing the list

- Only modify these files; `README.md`, `MOBILE.md`

`README.md` for desktop apps. <br>
`MOBILE.md` for mobile apps.

- Do not change the order of any apps like ordering alphabetically.

### Adding an app to an existing category

- App should be added like this and it should be added to the **bottom of the specific category**:

```
- [Winpower](https://github.com/Axorax/winpower) - Advanced power settings and management for Windows. 🪟 🟢
```

- The icons (emojis) should go after the description. There is a reference table at the top of the README file.

- Description of the app should be short and only highlight the features. Don't include random nonsense like if your app falls under the "Clipboard Management" category and you write "Software to manage clipboard.", that provides no information about the app.

- The description should end with a period (.), no other symbols like !, ?, etc. are allowed.

- The description shouldn't start with words like "A", "An", "The", etc. Example:

```
❌ A lightweight app to do something.
✅ Lightweight app to do something.
```

- When the app is open-source, make the 🟢 icon a link to the source code of the project. If the app has a separate
website, use it as the link for the app name. Otherwise use the source code link for both the name and the icon. Example:

```md
- [Neovim](https://neovim.io) - Advanced Vim-based text editor with improved extensibility, plugins, and modern features. 🪟 🍎 🐧 [🟢](https://github.com/neovim/neovim)
- [ungoogled-chromium](https://github.com/ungoogled-software/ungoogled-chromium) - Privacy-focused Chromium with Google services removed. 🪟 🍎 🐧 [🟢](https://github.com/ungoogled-software/ungoogled-chromium)
```

### Adding a new category

- Do not create an empty category.

- Use `##` for the main category and `###` for sub-categories. Example:

```md
## Audio

- <example app>

### Music creation

- <example app in a more specific sub-category>
```

- For the position, add it after another category that is somewhat related otherwise add it alphabetically.

- Do not modify the table of content. It is auto-generated.

### Commit message

- Use `Add: name` to add a new app.
- Use `Update: name` to update an existing app.
- Use `Remove: name` to remove an app.

You can optionally specify the list for all of them. Examples:

```console
Add: Winpower
Update: Winpower
Remove: Winpower

Add (PC): Inkless
Update (PC): Inkless
Remove (PC): Inkless

Add (MOBILE): Spotify
Update (MOBILE): Spotify
Remove (MOBILE): Spotify
```

## — Code contributions

If you make code contributions like modifying the CLI helper app, then follow these rules. You contribution won't be accepted if it:

- Breaks the code of conduct.
- Is only a code refactor.
- Has little to no benefit or effect.
- Breaks the codebase.

For the commit message, use `Feat` for new features, `Update` to modify something. Examples:

```console
Feat: AI to make app with CLI
Update: Format function to be more strict
```

## — Recommended icon requirements

- App should have a good GUI.
- Must be optimized depending on the category and functionality. Like if a todo list app uses 1 GB of RAM, that's just annoying.
- App must provide useful functionality.
- Must be from a trustworthy developer or company (Extra points if open-source).
- Should be somewhat popular or well-known.

## — Maintainer guide

If you become a maintainer (make an issue if you want to become one), here's a few things to know about:

- Review PRs to make sure people follow the rules in this file.
- You should follow the rules here as well.
- Make sure you abide by the code of conduct.
- In the actions tab, there's an action called `Update main file`. It auto-generates the ToC, filters and a lot more. So, you don't have to do any of that. This action should be run once a week to keep everything upto date.
- You can join the Discord server to make communications easier. [Click here to join.](https://discord.com/invite/nKUFghjXQu)
