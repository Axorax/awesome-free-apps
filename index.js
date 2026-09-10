const fs = require('fs');
const { execSync } = require('child_process');

function create(file, fileName, emoji) {
  const startTime = Date.now();
  let data = fs.readFileSync(file, 'utf8');
  const emojis = new Set(["🪟", "🍎", "🐧", "🟢", "⭐", "🤖"]);
  let result = [];
  let lineCount = 0;
  const lines = data.split('\n');

  const outputDir = './filter';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (lineCount < 20) {
      result.push(line);
      lineCount++;
      continue;
    }
    line = line.replace(/ /g, '');
    if ([...emojis].some(emojiChar => line.includes(emojiChar)) && !line.includes(emoji)) {
      continue;
    }
    result.push(lines[i]);
  }

  fs.writeFileSync(`${outputDir}/${fileName}.md`, result.join('\n').replaceAll('./filter/', '').replaceAll('href="./', 'href="../').replaceAll('src="./', 'src="../'));
  console.log(`${fileName} time: \x1b[32m${Date.now() - startTime}ms\x1b[0m`);
}

function categorize() {
  create("README.md", "windows-only", "🪟");
  create("README.md","macOS-only", "🍎");
  create("README.md","linux-only", "🐧");
  create("README.md","open-source-only", "🟢");
  create("README.md","recommended-only", "⭐");
  create("MOBILE.md", "android-only", "🤖");
  create("MOBILE.md","iOS-only", "🍎");
  create("MOBILE.md","open-source-mobile-only", "🟢");
  create("MOBILE.md","recommended-mobile-only", "⭐");
}

function format(file = "README.md") {
  const data = fs.readFileSync(file, 'utf8');

  const updatedData = data
    .split('\n')
    .map(line => {
      // line = line.replace(/https:\/\/www\./g, 'https://'); // removes www. (DON'T USE! Some links break!)
      line = line.replace(/\((https?:\/\/.*?)\/\)/g, "($1)"); // removes trailing /
      // if (line.startsWith('- [')) {
      //   const parts = line.split(' - ');
      //   if (parts.length >= 2) {
      //     let description = parts[1];
      //     description = description.replace(/^A\s+/i, '').replace(/^An\s+/i, '');
      //     description = description.charAt(0).toUpperCase() + description.slice(1);
      //     parts[1] = description;
      //     line = parts.join(' - ');
      //   }
      // }
      return line;
    })
    .join('\n');

  fs.writeFileSync(file, updatedData, 'utf8');
  console.log(`\x1b[32m${file} has been formatted.\x1b[0m`);
}

/**
 * @returns {Array} list of links in a given file
 */
function getLinks(file = "README.md") {
  const data = fs.readFileSync(file, "utf8");
  return Array.from(data.matchAll(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g), (match) => match[1]);
}

/** Print the amount of links in a given file */
function countLinks(file = "README.md") {
  const linkCount = getLinks(file).length;
  console.log(`Total links in ${file}: \x1b[32m${linkCount}\x1b[0m`);
}

async function testUrl(url, { fetchImpl = fetch, timeoutMs = 10000 } = {}) {
  const request = (method) => fetchImpl(url, {
    method,
    redirect: "follow",
    headers: { "user-agent": "awesome-free-apps-link-audit/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });

  try {
    let response = await request("HEAD");
    if (!response.ok) {
      response = await request("GET");
    }

    return { url, ok: response.ok, status: response.status };
  } catch (error) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new TypeError("concurrency must be a positive integer");
  }

  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return results;
}

/**
 * Test if all links in a given file are valid (reachable)
 * @param {string} file
 * @returns {Promise}
 */
async function testLinksReachable(
  file = "README.md",
  { concurrency = 12, testUrlImpl = testUrl } = {},
) {
  const links = [...new Set(getLinks(file))];
  console.log(`Testing ${links.length} unique links in \x1b[32m${file}\x1b[0m`);

  const results = await mapWithConcurrency(links, concurrency, testUrlImpl);
  const failures = results.filter((result) => !result.ok);

  for (const failure of failures) {
    const reason = failure.status ? `HTTP ${failure.status}` : failure.error;
    console.error(`- ${failure.url} (${reason || "request failed"})`);
  }

  console.log(
    `${file}: ${results.length - failures.length}/${results.length} links reachable`,
  );
  return { file, total: results.length, failures };
}

async function testLinksInAllFiles(options) {
  const reports = [];
  reports.push(await testLinksReachable("README.md", options));
  reports.push(await testLinksReachable("MOBILE.md", options));

  const total = reports.reduce((sum, report) => sum + report.total, 0);
  const failures = reports.flatMap((report) => report.failures);
  console.log(`Link audit complete: ${total - failures.length}/${total} reachable`);
  return { total, failures, reports };
}


function fastGit(message = "update") {
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('Changes have been committed and pushed.');
  } catch (error) {
    console.error('Error running git commands:', error);
  }
}

function runAll() {
  countLinks("README.md");
  countLinks("MOBILE.md");
  // formatFiles();
  createToC();
  categorize();
  countLinks("README.md");
  countLinks("MOBILE.md");
}

function analyze(file = "README.md") {
  const data = fs.readFileSync(file, 'utf8');

  const words = data.match(/\b\w+\b/g);
  const wordCount = words ? words.length : 0;
  const linkCount = (data.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
  const characterCount = data.length;

  console.log(`${file} Word Count: \x1b[32m${wordCount}\x1b[0m`);
  console.log(`${file} Character Count: \x1b[32m${characterCount}\x1b[0m`);
  console.log(`${file} Link Count: \x1b[32m${linkCount}\x1b[0m`);
}

function generateToc(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let toc = [];

  lines.forEach(line => {
      const match = /^#{2,6}\s+(.+)/.exec(line);
      if (match) {
          const level = match[0].indexOf(' ') - 1;
          const title = match[1].trim();
          const anchor = title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+/, '')
              .replace(/-+$/, '');

          toc.push(`${'  '.repeat(level - 1)}- [${title}](#${anchor})`);
      }
  });

  const tocContent = toc.slice(1).join('\n');
  return tocContent;
}

function findAF(file, name, message, suffix) {
  const data = fs.readFileSync(file, 'utf8');

  const startMarker = `<!-- AF-${name}`.trim();
  const endMarker = `<!-- AF-END -->`.trim();

  const startIndex = data.indexOf(startMarker);

  if (startIndex !== -1) {
    const cleanStartIndex = data.indexOf(">", startIndex) + 1;

    const endIndex = data.indexOf(endMarker, cleanStartIndex);

    if (endIndex !== -1) {
      let newData = data.slice(0, cleanStartIndex) + message + data.slice(endIndex);

      if (suffix) {
        const newStartMarker = `<!-- AF-${name} ${suffix} -->`;
        newData = newData.replace(data.slice(startIndex, cleanStartIndex), newStartMarker);
      }

      fs.writeFileSync(file, newData, 'utf8');
      console.log(file + " updated successfully.");
    } else {
      console.log(`No end marker found for ${startMarker}`);
    }
  } else {
    console.log(`No content found for ${startMarker}`);
  }
}

function createToC() {
  findAF("README.md", "TOC", "\n\n" + generateToc("README.md") + "\n\n", `: ${new Date().toLocaleString('en-US', { timeZoneName: 'short', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`);
  findAF("MOBILE.md", "TOC", "\n\n" + generateToc("MOBILE.md") + "\n\n", `: ${new Date().toLocaleString('en-US', { timeZoneName: 'short', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`);
}

function formatFiles() {
  format("README.md");
  format("MOBILE.md");
}

function main(args = process.argv.slice(2)) {
  if (args.includes('--analyze')) {
    analyze("README.md");
    analyze("MOBILE.md");
  } else if (args.includes('--toc')) {
    createToC();
  } else if (args.includes('--categorize')) {
    categorize();
  } else if (args.includes('--format')) {
    formatFiles();
  } else if (args.includes('--links')) {
    countLinks("README.md");
    countLinks("MOBILE.md");
  } else if (args.includes('--fastgit')) {
    const commitMessage = args.slice(1).join(' ');
    if (commitMessage) {
      fastGit(commitMessage);
    } else {
      console.log('Please provide a commit message after --fastgit');
    }
  } else if (args.includes('--all')) {
    runAll();
  } else if (args.includes('--test-links')) {
    testLinksInAllFiles()
      .then(({ failures }) => {
        if (failures.length > 0) process.exitCode = 1;
      })
      .catch((error) => {
        console.error("Link audit failed:", error);
        process.exitCode = 1;
      });
  } else {
    console.log("Usage:");
    console.log("  node index.js --categorize     Categorize based on icons");
    console.log("  node index.js --format         Format README.md");
    console.log("  node index.js --links          Count and display total links in README.md");
    console.log("  node index.js --fastgit <msg>  Run git commands with the specified commit message");
    console.log("  node index.js --analyze        Print some info about README.md");
    console.log("  node index.js --toc            Update the table of contents");
    console.log("  node index.js --all            Run all the commands (format, categorize, links)");
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getLinks,
  mapWithConcurrency,
  testLinksInAllFiles,
  testLinksReachable,
  testUrl,
};
