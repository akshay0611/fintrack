import os, sys, re, json

# load creds
env = {}
try:
    with open("/Users/aksh/fintrack/.env.local") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line and not line.startswith("NEXT_PUBLIC"):
                k, v = line.split("=", 1)
                env[k] = v.strip().strip('"').strip("'")
except FileNotFoundError:
    print("NO_ENV_FILE")
    sys.exit(2)

EMAIL = env.get("FINTRACK_SMOKE_TEST_EMAIL")
PASS = env.get("FINTRACK_SMOKE_TEST_PASSWORD")
BASE = "http://127.0.0.1:3000"

from playwright.sync_api import sync_playwright

reports = {}
console_errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" and "favicon" not in msg.text else None)
    page.on("pageerror", lambda e: console_errors.append(f"PAGEERROR: {e}"))

    # login
    page.goto(BASE + "/sign-in", wait_until="networkidle")
    page.fill('input[name="email"]', EMAIL)
    page.fill('input[name="password"]', PASS)
    page.click('button[type="submit"]')
    page.wait_for_url("**/protected", timeout=15000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)
    reports["dashboard_url"] = page.url

    # dashboard
    h1 = page.locator("h1").first.inner_text() if page.locator("h1").count() else ""
    asides = page.locator("aside").count()
    reports["dashboard_h1"] = h1
    reports["asides_dashboard"] = asides
    bodytxt = page.inner_text("body")
    reports["dashboard_total_income_present"] = "Total Income" in bodytxt
    reports["dashboard_reports_present"] = "Financial Reports" in bodytxt
    reports["dashboard_recent_present"] = "Recent Transactions" in bodytxt
    # sidebar nav to Reports exists
    report_link = page.locator('a[href="/protected/reports"]').count()
    reports["nav_reports_link"] = report_link

    # change time period -> year to date vs last 7 days modifies totals
    sel = page.locator("header select")
    if sel.count():
        page.locator("header select").first.select_option("last7days")
        page.wait_for_timeout(1200)
        page.locator("header select").first.select_option("yearToDate")
        page.wait_for_timeout(1200)
        reports["period_changed"] = True
    else:
        reports["period_changed"] = False

    # Reports route
    page.goto(BASE + "/protected/reports", wait_until="networkidle")
    page.wait_for_timeout(1500)
    rbody = page.inner_text("body")
    reports["reports_route_ok"] = "Expenses by Category" in rbody
    reports["reports_chart_svg"] = page.locator("svg").count() > 0

    # Income page
    page.goto(BASE + "/protected/income", wait_until="networkidle")
    page.wait_for_timeout(1500)
    ibody = page.inner_text("body")
    reports["income_rows"] = page.locator("tbody tr").count()
    reports["income_export_enabled"] = page.locator("button:has-text('Export to CSV')").count() == 1
    # filter by category works
    cat_select = page.locator("select").first
    reports["income_filter_select"] = cat_select.count() > 0
    # open edit dialog (read only)
    pen = page.locator("button[aria-label='Edit income'], button:has(svg.lucide-pencil)").first
    reports["income_edit_buttons"] = pen.count() if pen.count == 0 else page.locator("button:has(svg.lucide-pencil)").count()
    if page.locator("button:has(svg.lucide-pencil)").count():
        page.locator("button:has(svg.lucide-pencil)").first.click()
        page.wait_for_timeout(800)
        reports["income_edit_has_desc"] = page.locator("h2:has-text('Edit Income') ~ p, p:has-text('Update this income')").count() > 0
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)

    # Expenses page
    page.goto(BASE + "/protected/expenses", wait_until="networkidle")
    page.wait_for_timeout(1500)
    ebody = page.inner_text("body")
    reports["expense_rows"] = page.locator("tbody tr").count()
    reports["expense_export_enabled"] = page.locator("button:has-text('Export to CSV')").count() == 1
    reports["expense_filter_select"] = page.locator("select").count() > 0
    if page.locator("button:has(svg.lucide-pencil)").count():
        page.locator("button:has(svg.lucide-pencil)").first.click()
        page.wait_for_timeout(800)
        reports["expense_edit_has_desc"] = page.locator("p:has-text('Update this expense')").count() > 0
        page.keyboard.press("Escape")
        page.wait_for_timeout(400)

    # Investments page
    page.goto(BASE + "/protected/investments", wait_until="networkidle")
    page.wait_for_timeout(1500)
    invbody = page.inner_text("body")
    reports["invest_rows"] = page.locator("tbody tr").count()
    reports["invest_export_enabled"] = page.locator("button:has-text('Export to CSV')").count() == 1
    reports["invest_amount_col"] = "Total Amount" in page.inner_text("thead") if page.locator("thead").count() else False
    # open add dialog check account select lists active accounts
    page.click("button:has(svg.lucide-plus)")
    page.wait_for_timeout(800)
    acct_select = page.locator("select").first
    opt_txt = acct_select.inner_text() if acct_select.count() else ""
    # temporary archived investments account should NOT appear
    reports["invest_add_has_desc"] = page.locator("p:has-text('Create a new investment purchase')").count() > 0
    arr = [o.strip() for o in opt_txt.split("\n") if o.strip()]
    reports["invest_account_options"] = arr
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)

    # Subscriptions
    page.goto(BASE + "/protected/subscriptions", wait_until="networkidle")
    page.wait_for_timeout(1500)
    sub_txt = page.inner_text("body")
    reports["subs_rows"] = page.locator("tbody tr").count()
    reports["subs_summary_present"] = "Total Subscriptions" in sub_txt
    reports["subs_export_enabled"] = page.locator("button:has-text('Export to CSV')").count() == 1

    # Settings single sidebar
    page.goto(BASE + "/protected/settings", wait_until="networkidle")
    page.wait_for_timeout(800)
    reports["asides_settings"] = page.locator("aside").count()
    stxt = page.inner_text("body")
    reports["settings_accounts_tab"] = "Accounts" in stxt and "Preferences" in stxt

    # Help single sidebar
    page.goto(BASE + "/protected/help", wait_until="networkidle")
    page.wait_for_timeout(800)
    reports["asides_help"] = page.locator("aside").count()

    # mobile viewport checks
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(BASE + "/protected/income", wait_until="networkidle")
    page.wait_for_timeout(1000)
    reports["mob_income_fab_visible"] = page.locator("button:has(svg.lucide-plus)").last.is_visible()
    page.goto(BASE + "/protected/expenses", wait_until="networkidle")
    page.wait_for_timeout(1000)
    reports["mob_expense_fab_visible"] = page.locator("button:has(svg.lucide-plus)").last.is_visible()
    page.goto(BASE + "/protected", wait_until="networkidle")
    page.wait_for_timeout(1000)
    reports["mob_overview_fab_visible"] = page.locator("button:has(svg.lucide-plus)").last.is_visible()

    browser.close()

reports["console_errors"] = console_errors[:20]
print(json.dumps(reports, indent=2, default=str))