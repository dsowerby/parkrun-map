This tool extracts all unique parkrun event paths ending in `/results/` results are saved in minified JSON format to:

`docs/athletes/<ATHLETE_ID>.json`

---

## 🔧 Requirements

- Python 3.7+
- [Playwright](https://playwright.dev/python)

### Install dependencies:

```bash
pip install playwright
playwright install
```

---

## 🚀 Usage

### Fetch results for a single athlete

```bash
./fetch-athlete.py <ATHLETE_ID>
```

**Example:**

```bash
./fetch-athlete.py 1234567
```

This creates:

`docs/athletes/1234567.json`

Containing a minified JSON array like:

```json
["abingdon","bathskyline","cheltenham","wycomberye"]
```

---

### Fetch results for all existing athlete files

To re-fetch and update all athletes for which you already have a file in `docs/athletes/`, run:

```bash
./fetch-athletes.sh
```

This script:

- Finds all existing `.json` files in `docs/athletes/`
- Extracts the `<ATHLETE_ID>` from each filename
- Calls `fetch-athlete.py` for each ID
- Waits 5 seconds between requests to avoid bot detection or rate limiting

---

## 🐛 Debugging Tips

If you're getting empty arrays or incomplete data, try these steps:

### 1. Run with a visible browser

Edit `fetch-athlete.py` to launch in non-headless mode:

```python
browser = p.chromium.launch(headless=False, slow_mo=100)
```

This lets you see if a Cloudflare challenge or delay is happening.

### 2. Print the raw page HTML

Insert this line after the page loads to inspect what’s actually rendered:

```python
print(page.content())
```

---

## 📁 Project Structure

```
fetch-athlete.py         # Python script to fetch data for one athlete
fetch-athletes.sh        # Bash script to batch-fetch for all saved athletes
docs/
└── athletes/
    ├── 1234567.json
    ├── 2345678.json
    └── ...
```