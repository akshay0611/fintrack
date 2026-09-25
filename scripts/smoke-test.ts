import { randomUUID } from "node:crypto"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const testEmail = process.env.FINTRACK_SMOKE_TEST_EMAIL
const testPassword = process.env.FINTRACK_SMOKE_TEST_PASSWORD

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
}

if (!testEmail || !testPassword) {
  throw new Error("FINTRACK_SMOKE_TEST_EMAIL and FINTRACK_SMOKE_TEST_PASSWORD are required")
}

const databaseUrl: string = supabaseUrl
const databaseAnonKey: string = supabaseAnonKey
const smokeTestEmail: string = testEmail
const smokeTestPassword: string = testPassword

type Status = "PASS" | "FAIL" | "SKIP"
type Row = Record<string, unknown>

type Result = {
  section: string
  status: Status
  expected?: string
  actual?: string
  error?: string
}

type State = {
  userId: string
  runId: string
  prefix: string
  today: string
  checkingAccountId?: string
  savingsAccountId?: string
  investmentAccountId?: string
  incomeCategory?: Row
  expenseCategory?: Row
  incomeTransactionId?: string
  expenseTransactionId?: string
  transferTransactionId?: string
  investmentTransactionId?: string
  investmentHoldingId?: string
  subscriptionId?: string
  unarchiveTransactionId?: string
}

const results: Result[] = []
const cleanupLines: string[] = []
const runTimestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14)
const runId = `${runTimestamp}_${randomUUID().slice(0, 8).toUpperCase()}`
const prefix = `FINTRACK_SMOKE_${runId}`

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addUtcMonths(dateString: string, months: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

function number(value: unknown) {
  return Number(value)
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`)
}

function addResult(section: string, status: Status, details: { expected?: string; actual?: string; error?: string } = {}) {
  results.push({ section, status, ...details })
  if (status === "PASS") {
    console.log(`[${section}] PASS`)
    return
  }
  if (status === "SKIP") {
    console.log(`[${section}] SKIP`)
    if (details.error) console.log(`Reason: ${details.error}`)
    return
  }
  console.log(`[${section}] FAIL`)
  if (details.expected) console.log(`Expected: ${details.expected}`)
  if (details.actual) console.log(`Actual: ${details.actual}`)
  if (details.error) console.log(`Error: ${details.error}`)
}

async function section(name: string, action: () => Promise<void>) {
  try {
    await action()
    addResult(name, "PASS")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    addResult(name, "FAIL", { error: message })
  }
}

function skip(name: string, reason: string) {
  addResult(name, "SKIP", { error: reason })
}

async function authError(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message)
}

async function signIn(supabase: SupabaseClient) {
  const result = await supabase.auth.signInWithPassword({
    email: smokeTestEmail,
    password: smokeTestPassword,
  })
  await authError(result)
  assert(result.data.user, "Sign-in returned no user")
  assert(result.data.session, "Sign-in returned no authenticated session")
  const verified = await supabase.auth.getUser()
  await authError(verified)
  assert(verified.data.user, "Authenticated user verification returned no user")
  return verified.data.user
}

async function authenticate(supabase: SupabaseClient) {
  try {
    return await signIn(supabase)
  } catch (signInFailure) {
    const signUp = await supabase.auth.signUp({ email: smokeTestEmail, password: smokeTestPassword })
    if (signUp.error) {
      const original = signInFailure instanceof Error ? signInFailure.message : String(signInFailure)
      throw new Error(`Existing sign-in failed (${original}); sign-up fallback failed (${signUp.error.message})`)
    }
    if (!signUp.data.session || !signUp.data.user) {
      const original = signInFailure instanceof Error ? signInFailure.message : String(signInFailure)
      throw new Error(`Sign-in failed (${original}); sign-up returned no authenticated session. If the user exists, confirm it in Supabase Authentication, then rerun`)
    }
    const verified = await supabase.auth.getUser()
    await authError(verified)
    assert(verified.data.user, "Authenticated user verification returned no user after sign-up")
    return verified.data.user
  }
}

async function createAccounts(supabase: SupabaseClient, state: State) {
  const definitions = [
    { name: `${prefix}_Checking`, type: "checking", currency: "INR", initial_balance: 10_000 },
    { name: `${prefix}_Savings`, type: "savings", currency: "INR", initial_balance: 5_000 },
    { name: `${prefix}_Investment`, type: "investment", currency: "INR", initial_balance: 0 },
  ]
  const inserted = await supabase
    .from("accounts")
    .insert(definitions.map((account) => ({ ...account, user_id: state.userId, is_archived: false })))
    .select("*")
  await authError(inserted)
  assert(inserted.data?.length === 3, `Expected 3 inserted accounts, got ${inserted.data?.length ?? 0}`)

  for (const definition of definitions) {
    const account = inserted.data.find((row) => row.name === definition.name)
    assert(account, `Inserted account missing: ${definition.name}`)
    equal(account.user_id, state.userId, `${definition.type} user_id`)
    equal(account.type, definition.type, `${definition.type} type`)
    equal(account.currency, "INR", `${definition.type} currency`)
    equal(number(account.initial_balance), definition.initial_balance, `${definition.type} initial_balance`)
    equal(account.is_archived, false, `${definition.type} is_archived`)
    if (definition.type === "checking") state.checkingAccountId = account.id as string
    if (definition.type === "savings") state.savingsAccountId = account.id as string
    if (definition.type === "investment") state.investmentAccountId = account.id as string
  }

  const fetched = await supabase.from("accounts").select("*").like("name", `${prefix}%`)
  await authError(fetched)
  equal(fetched.data?.length, 3, "Visible smoke-test account count")
  assert(fetched.data?.every((row) => row.user_id === state.userId), "An account belongs to another user")
}

async function loadCategories(supabase: SupabaseClient, state: State) {
  const result = await supabase.from("categories").select("id,name,type,is_system,user_id").eq("is_system", true)
  await authError(result)
  const income = result.data?.find((row) => row.type === "income")
  const expense = result.data?.find((row) => row.type === "expense")
  assert(income, "No system income category is available")
  assert(expense, "No system expense category is available")
  equal(income.is_system, true, "Income category is_system")
  equal(expense.is_system, true, "Expense category is_system")
  equal(expense.type, "expense", "Expense category type")
  state.incomeCategory = income
  state.expenseCategory = expense
}

async function createIncome(supabase: SupabaseClient, state: State) {
  const result = await supabase
    .from("transactions")
    .insert({
      user_id: state.userId,
      account_id: state.checkingAccountId,
      category_id: state.incomeCategory!.id,
      type: "income",
      amount: 20_000,
      transaction_date: state.today,
      description: `${prefix}_Income`,
      notes: `${prefix} income notes`,
    })
    .select("*")
    .single()
  await authError(result)
  const row = result.data
  equal(row.user_id, state.userId, "Income user_id")
  equal(row.account_id, state.checkingAccountId, "Income account_id")
  equal(row.type, "income", "Income type")
  equal(number(row.amount), 20_000, "Income amount")
  assert(String(row.description).includes(state.runId), "Income description does not contain the run ID")
  state.incomeTransactionId = row.id as string
}

async function createExpense(supabase: SupabaseClient, state: State) {
  const result = await supabase
    .from("transactions")
    .insert({
      user_id: state.userId,
      account_id: state.checkingAccountId,
      category_id: state.expenseCategory!.id,
      type: "expense",
      amount: 3_000,
      transaction_date: state.today,
      description: `${prefix}_Expense`,
      notes: `${prefix} expense notes`,
    })
    .select("*")
    .single()
  await authError(result)
  const row = result.data
  equal(row.user_id, state.userId, "Expense user_id")
  equal(row.account_id, state.checkingAccountId, "Expense account_id")
  equal(row.type, "expense", "Expense type")
  equal(number(row.amount), 3_000, "Expense amount")
  assert(String(row.description).includes(state.runId), "Expense description does not contain the run ID")
  state.expenseTransactionId = row.id as string
}

async function createTransfer(supabase: SupabaseClient, state: State) {
  const result = await supabase
    .from("transactions")
    .insert({
      user_id: state.userId,
      account_id: state.checkingAccountId,
      destination_account_id: state.savingsAccountId,
      category_id: null,
      type: "transfer",
      amount: 2_000,
      transaction_date: state.today,
      description: `${prefix}_Transfer`,
      notes: `${prefix} transfer notes`,
    })
    .select("*")
    .single()
  await authError(result)
  const row = result.data
  equal(row.user_id, state.userId, "Transfer user_id")
  equal(row.account_id, state.checkingAccountId, "Transfer source account")
  equal(row.destination_account_id, state.savingsAccountId, "Transfer destination account")
  equal(row.type, "transfer", "Transfer type")
  equal(row.category_id, null, "Transfer category_id")
  equal(number(row.amount), 2_000, "Transfer amount")
  state.transferTransactionId = row.id as string

  const ledger = await applicationTransactions(supabase, state.userId, state.today, state.today)
  const runRows = ledger.filter((row) => ledgerIds(state).has(row.id as string))
  equal(sumType(runRows, "income"), 20_000, "Income aggregate with transfer present")
  equal(sumType(runRows, "expense"), 3_000, "Expense aggregate with transfer present")
  assert(!runRows.some((row) => ["transfer", "investment_buy"].includes(String(row.type)) && ["income", "expense"].includes(String(row.type))), "Transfer or investment was classified as income/expense")
}

async function createInvestment(supabase: SupabaseClient, state: State) {
  const holdingName = `${prefix}_Mutual_Fund`
  const result = await supabase.rpc("fn_create_investment_purchase", {
    p_account_id: state.investmentAccountId,
    p_name: holdingName,
    p_category: "mutual_funds",
    p_units: 10,
    p_unit_price: 100,
    p_purchase_date: state.today,
    p_description: `${prefix}_Investment_Purchase`,
    p_notes: `${prefix} investment notes`,
  })
  await authError(result)
  const payload = result.data as { transaction_id?: string; holding_id?: string; total_amount?: number } | null
  assert(payload?.transaction_id, "Investment RPC returned no transaction_id")
  assert(payload?.holding_id, "Investment RPC returned no holding_id")
  equal(number(payload.total_amount), 1_000, "Investment RPC total_amount")

  const holding = await supabase
    .from("investment_holdings")
    .select("*")
    .eq("id", payload.holding_id)
    .eq("transaction_id", payload.transaction_id)
    .single()
  await authError(holding)
  equal(holding.data.user_id, state.userId, "Holding user_id")
  equal(holding.data.account_id, state.investmentAccountId, "Holding account_id")
  equal(holding.data.transaction_id, payload.transaction_id, "Holding transaction_id")
  equal(holding.data.name, holdingName, "Holding name")
  equal(holding.data.category, "mutual_funds", "Holding category")
  equal(number(holding.data.units), 10, "Holding units")
  equal(number(holding.data.unit_price), 100, "Holding unit_price")
  equal(number(holding.data.total_amount), 1_000, "Holding total_amount")
  equal(holding.data.purchase_date, state.today, "Holding purchase_date")

  const transaction = await supabase.from("transactions").select("*").eq("id", payload.transaction_id).single()
  await authError(transaction)
  equal(transaction.data.user_id, state.userId, "Investment transaction user_id")
  equal(transaction.data.account_id, state.investmentAccountId, "Investment transaction account_id")
  equal(transaction.data.type, "investment_buy", "Investment transaction type")
  equal(transaction.data.category_id, null, "Investment transaction category_id")
  equal(transaction.data.destination_account_id, null, "Investment transaction destination_account_id")
  equal(number(transaction.data.amount), 1_000, "Investment transaction amount")
  equal(transaction.data.transaction_date, state.today, "Investment transaction date")

  state.investmentTransactionId = payload.transaction_id
  state.investmentHoldingId = payload.holding_id
}

async function createSubscription(supabase: SupabaseClient, state: State) {
  const result = await supabase
    .from("subscriptions")
    .insert({
      user_id: state.userId,
      account_id: state.checkingAccountId,
      category_id: state.expenseCategory!.id,
      name: `${prefix}_Subscription`,
      amount: 499,
      cycle: "monthly",
      start_date: state.today,
      next_renewal_date: addUtcMonths(state.today, 1),
      status: "active",
      notes: `${prefix} subscription notes`,
    })
    .select("*")
    .single()
  await authError(result)
  const row = result.data
  equal(row.user_id, state.userId, "Subscription user_id")
  equal(row.account_id, state.checkingAccountId, "Subscription account_id")
  equal(row.category_id, state.expenseCategory!.id, "Subscription category_id")
  equal(state.expenseCategory!.type, "expense", "Subscription category type")
  equal(row.amount, 499, "Subscription amount")
  equal(row.cycle, "monthly", "Subscription cycle")
  equal(row.status, "active", "Subscription status")
  equal(row.next_renewal_date, addUtcMonths(state.today, 1), "Subscription next_renewal_date")
  state.subscriptionId = row.id as string
}

async function applicationTransactions(supabase: SupabaseClient, userId: string, from?: string, to?: string) {
  let query = supabase
    .from("transactions")
    .select("*, categories:categories(id, name, icon)")
    .eq("user_id", userId)
  if (from) query = query.gte("transaction_date", from)
  if (to) query = query.lte("transaction_date", to)
  const result = await query.order("transaction_date", { ascending: false })
  await authError(result)
  return result.data ?? []
}

function ledgerIds(state: State) {
  return new Set(
    [state.incomeTransactionId, state.expenseTransactionId, state.transferTransactionId, state.investmentTransactionId].filter(
      (value): value is string => Boolean(value),
    ),
  )
}

function sumType(rows: Row[], type: string) {
  return rows.filter((row) => row.type === type).reduce((total, row) => total + number(row.amount), 0)
}

async function testDateRange(supabase: SupabaseClient, state: State) {
  const inRange = await applicationTransactions(supabase, state.userId, state.today, state.today)
  const ids = ledgerIds(state)
  for (const [name, id] of [
    ["income", state.incomeTransactionId],
    ["expense", state.expenseTransactionId],
    ["transfer", state.transferTransactionId],
    ["investment", state.investmentTransactionId],
  ] as const) {
    assert(id, `${name} transaction was not created`)
    assert(inRange.some((row) => row.id === id), `${name} transaction is missing from today's range`)
  }

  const outOfRange = await applicationTransactions(supabase, state.userId, "2000-01-01", "2000-01-02")
  assert(!outOfRange.some((row) => ids.has(row.id as string)), "A current smoke-test transaction appeared in the excluded range")
}

async function readBalances(supabase: SupabaseClient, state: State) {
  const result = await supabase.from("v_account_balances").select("*").eq("user_id", state.userId)
  await authError(result)
  const rows = result.data ?? []
  const checking = rows.find((row) => row.account_id === state.checkingAccountId)
  const savings = rows.find((row) => row.account_id === state.savingsAccountId)
  const investment = rows.find((row) => row.account_id === state.investmentAccountId)
  assert(checking, "Checking balance is missing")
  assert(savings, "Savings balance is missing")
  assert(investment, "Investment balance is missing")
  return {
    checking: number(checking.current_balance),
    savings: number(savings.current_balance),
    investment: number(investment.current_balance),
    rows,
  }
}

async function testBalances(supabase: SupabaseClient, state: State) {
  const balances = await readBalances(supabase, state)
  equal(balances.checking, 25_000, "Checking balance")
  equal(balances.savings, 7_000, "Savings balance")
  equal(balances.investment, -1_000, "Investment balance under v_account_balances semantics")
  console.log(`Checking balance: INR ${balances.checking.toFixed(2)}`)
  console.log(`Savings balance: INR ${balances.savings.toFixed(2)}`)
  console.log(`Investment balance: INR ${balances.investment.toFixed(2)}`)
}

async function testReports(supabase: SupabaseClient, state: State) {
  const rows = await applicationTransactions(supabase, state.userId, state.today, state.today)
  const ids = ledgerIds(state)
  const runRows = rows.filter((row) => ids.has(row.id as string))
  equal(runRows.length, 4, "Smoke-test transaction count in reporting range")
  equal(sumType(runRows, "income"), 20_000, "Overview income aggregate")
  equal(sumType(runRows, "expense"), 3_000, "Overview expense aggregate")
  equal(sumType(runRows, "investment_buy"), 1_000, "Overview investment aggregate")
  equal(sumType(runRows, "transfer"), 2_000, "Transfer ledger amount")
  assert(!runRows.some((row) => row.type === "transfer" && ["income", "expense"].includes(String(row.type))), "Transfer entered income/expense aggregates")
  assert(!runRows.some((row) => row.type === "investment_buy" && row.type === "expense"), "Investment entered expense aggregate")

  const expense = runRows.find((row) => row.id === state.expenseTransactionId)
  const category = expense?.categories as { id?: string; name?: string } | null
  equal(category?.id, state.expenseCategory!.id, "Reporting expense category id")
  assert(category?.name, "Reporting expense category name is missing")

  const recent = rows
    .filter((row) => row.type === "income" || row.type === "expense")
    .sort((a, b) => new Date(String(b.transaction_date)).getTime() - new Date(String(a.transaction_date)).getTime())
    .slice(0, 5)
  assert(recent.some((row) => row.id === state.incomeTransactionId), "Income is missing from recent transactions")
  assert(recent.some((row) => row.id === state.expenseTransactionId), "Expense is missing from recent transactions")
  assert(!recent.some((row) => row.id === state.transferTransactionId), "Transfer appears in recent transactions")
  assert(!recent.some((row) => row.id === state.investmentTransactionId), "Investment appears in recent transactions")
}

async function testArchive(supabase: SupabaseClient, state: State) {
  const archived = await supabase
    .from("accounts")
    .update({ is_archived: true })
    .eq("id", state.savingsAccountId)
    .eq("user_id", state.userId)
    .select("*")
    .single()
  await authError(archived)
  equal(archived.data.is_archived, true, "Archived savings is_archived")

  const historical = await supabase.from("transactions").select("*").eq("id", state.transferTransactionId).single()
  await authError(historical)
  equal(historical.data.destination_account_id, state.savingsAccountId, "Historical transfer destination")
  equal(number(historical.data.amount), 2_000, "Historical transfer amount")

  const balances = await readBalances(supabase, state)
  equal(balances.savings, 7_000, "Archived savings historical balance")
  const savingsRow = balances.rows.find((row) => row.account_id === state.savingsAccountId)
  equal(savingsRow?.is_archived, true, "Archived savings visible in balance view")
}

async function attemptArchivedTransaction(
  supabase: SupabaseClient,
  state: State,
  type: "income" | "expense" | "transfer",
) {
  const payload: Row = {
    user_id: state.userId,
    account_id: state.savingsAccountId,
    type,
    amount: 100,
    transaction_date: state.today,
    description: `${prefix}_Archived_${type}`,
  }
  if (type === "income" || type === "expense") payload.category_id = state[type === "income" ? "incomeCategory" : "expenseCategory"]!.id
  if (type === "transfer") payload.destination_account_id = state.checkingAccountId
  const result = await supabase.from("transactions").insert(payload).select("*").single()
  if (!result.error) state.unarchiveTransactionId = result.data.id as string
  return result
}

async function testArchivedBlock(supabase: SupabaseClient, state: State) {
  const outcomes = await Promise.all([
    attemptArchivedTransaction(supabase, state, "expense"),
    attemptArchivedTransaction(supabase, state, "income"),
    attemptArchivedTransaction(supabase, state, "transfer"),
  ])
  outcomes.forEach((result, index) => {
    const type = ["expense", "income", "transfer"][index]
    console.log(`Archived ${type} actual error: ${result.error?.message ?? "NONE"}`)
  })
  assert(outcomes.every((result) => Boolean(result.error)), "At least one transaction succeeded on an archived account")
}

async function testUnarchive(supabase: SupabaseClient, state: State) {
  const unarchived = await supabase
    .from("accounts")
    .update({ is_archived: false })
    .eq("id", state.savingsAccountId)
    .eq("user_id", state.userId)
    .select("*")
    .single()
  await authError(unarchived)
  equal(unarchived.data.is_archived, false, "Unarchived savings is_archived")

  const created = await supabase
    .from("transactions")
    .insert({
      user_id: state.userId,
      account_id: state.savingsAccountId,
      category_id: state.expenseCategory!.id,
      type: "expense",
      amount: 50,
      transaction_date: state.today,
      description: `${prefix}_After_Unarchive`,
    })
    .select("*")
    .single()
  await authError(created)
  equal(created.data.account_id, state.savingsAccountId, "Post-unarchive transaction account")
  equal(number(created.data.amount), 50, "Post-unarchive transaction amount")
  state.unarchiveTransactionId = created.data.id as string
}

async function testRls(supabase: SupabaseClient, state: State) {
  const ownedTables = ["accounts", "transactions", "investment_holdings", "subscriptions"] as const
  for (const table of ownedTables) {
    const result = await supabase.from(table).select("*")
    await authError(result)
    assert(result.data?.every((row) => row.user_id === state.userId), `${table} returned a row owned by another user`)
  }

  const foreignInsert = await supabase
    .from("accounts")
    .insert({
      user_id: randomUUID(),
      name: `${prefix}_Foreign_User_Insert`,
      type: "checking",
      currency: "INR",
      initial_balance: 1,
      is_archived: false,
    })
    .select("*")
  console.log(`Foreign-user insert actual error: ${foreignInsert.error?.message ?? "NONE"}`)
  assert(foreignInsert.error, "Authenticated user inserted an account for another user ID")

  const signedOut = await supabase.auth.signOut()
  await authError(signedOut)
  const anonymousRead = await supabase.from("accounts").select("id")
  await authError(anonymousRead)
  equal(anonymousRead.data?.length, 0, "Anonymous account row count")
  await signIn(supabase)
}

async function cleanup(supabase: SupabaseClient, state?: Partial<State>) {
  if (!state?.userId) {
    addResult("CLEANUP", "SKIP", { error: "Authentication failed; no authenticated cleanup possible" })
    return
  }

  const errors: string[] = []
  const subscriptionDelete = await supabase.from("subscriptions").delete().eq("user_id", state.userId).like("name", `${prefix}%`)
  if (subscriptionDelete.error) errors.push(`subscriptions: ${subscriptionDelete.error.message}`)

  const holdingDelete = await supabase.from("investment_holdings").delete().eq("user_id", state.userId).like("name", `${prefix}%`)
  if (holdingDelete.error) errors.push(`investment_holdings: ${holdingDelete.error.message}`)

  const transactionDelete = await supabase.from("transactions").delete().eq("user_id", state.userId).like("description", `${prefix}%`)
  if (transactionDelete.error) errors.push(`transactions: ${transactionDelete.error.message}`)

  const accountArchive = await supabase.from("accounts").update({ is_archived: true }).eq("user_id", state.userId).like("name", `${prefix}%`).select("*")
  if (accountArchive.error) errors.push(`accounts: ${accountArchive.error.message}`)

  const remainingTransactions = await supabase.from("transactions").select("id,description,type").eq("user_id", state.userId).like("description", `${prefix}%`)
  const remainingHoldings = await supabase.from("investment_holdings").select("id,name").eq("user_id", state.userId).like("name", `${prefix}%`)
  const remainingSubscriptions = await supabase.from("subscriptions").select("id,name").eq("user_id", state.userId).like("name", `${prefix}%`)
  if (remainingTransactions.error) errors.push(`transaction verification: ${remainingTransactions.error.message}`)
  if (remainingHoldings.error) errors.push(`holding verification: ${remainingHoldings.error.message}`)
  if (remainingSubscriptions.error) errors.push(`subscription verification: ${remainingSubscriptions.error.message}`)

  const remainingAccounts = accountArchive.data ?? []
  cleanupLines.push(`Run ID: ${runId}`)
  cleanupLines.push(`Deleted subscriptions: ${state.subscriptionId ?? "none"}`)
  cleanupLines.push(`Deleted investment holding: ${state.investmentHoldingId ?? "none"}`)
  cleanupLines.push(`Deleted transaction IDs: ${[state.incomeTransactionId, state.expenseTransactionId, state.transferTransactionId, state.investmentTransactionId, state.unarchiveTransactionId].filter(Boolean).join(", ") || "none"}`)
  cleanupLines.push(`Retained archived account IDs: ${remainingAccounts.map((row) => row.id).join(", ") || "none"}`)
  cleanupLines.push(`Remaining transactions: ${remainingTransactions.data?.length ?? "unknown"}`)
  cleanupLines.push(`Remaining holdings: ${remainingHoldings.data?.length ?? "unknown"}`)
  cleanupLines.push(`Remaining subscriptions: ${remainingSubscriptions.data?.length ?? "unknown"}`)

  const clean = errors.length === 0 && !remainingTransactions.data?.length && !remainingHoldings.data?.length && !remainingSubscriptions.data?.length
  if (clean) {
    addResult("CLEANUP", "PASS")
    return
  }
  addResult("CLEANUP", "FAIL", { expected: "No deletable smoke-test records remain", actual: errors.join("; ") || "Some records remain" })
}

function printSummary() {
  const passed = results.filter((result) => result.status === "PASS").length
  const failed = results.filter((result) => result.status === "FAIL").length
  const skipped = results.filter((result) => result.status === "SKIP").length
  console.log("")
  console.log("================================")
  console.log("FINTRACK V2 SMOKE TEST SUMMARY")
  console.log("================================")
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Run ID: ${runId}`)
  console.log(`Test Email: ${testEmail}`)

  if (failed) {
    console.log("")
    console.log("Diagnostic summary:")
    results.filter((result) => result.status === "FAIL").forEach((result) => {
      console.log(`- ${result.section}: ${result.error ?? "failed"}`)
    })
  }
  if (cleanupLines.length) {
    console.log("")
    console.log("Cleanup summary:")
    cleanupLines.forEach((line) => console.log(`- ${line}`))
  }
  console.log("================================")
  if (failed) process.exitCode = 1
}

async function main() {
  const supabase = createClient(databaseUrl, databaseAnonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })
  const state: State = {
    userId: "",
    runId,
    prefix,
    today: localDate(new Date()),
  }

  console.log("FINTRACK V2 REMOTE SUPABASE SMOKE TEST")
  console.log(`Run ID: ${runId}`)
  console.log(`Smoke-test date: ${state.today}`)

  let authenticated = false
  await section("AUTH", async () => {
    const user = await authenticate(supabase)
    state.userId = user.id
    authenticated = true
  })

  if (!authenticated) {
    await cleanup(supabase, state)
    printSummary()
    return
  }

  let categoriesReady = false
  await section("CATEGORIES", async () => {
    await loadCategories(supabase, state)
    categoriesReady = true
  })

  let accountsReady = false
  await section("ACCOUNTS", async () => {
    await createAccounts(supabase, state)
    accountsReady = true
  })

  if (!accountsReady || !categoriesReady) {
    const reason = !accountsReady && !categoriesReady ? "Accounts and categories failed" : !accountsReady ? "Accounts failed" : "Categories failed"
    ;["INCOME", "EXPENSE", "TRANSFER", "INVESTMENT", "SUBSCRIPTION", "DATE RANGE", "BALANCES", "REPORTS", "ARCHIVE", "ARCHIVED TRANSACTION BLOCK", "UNARCHIVE"].forEach((name) => skip(name, reason))
  } else {
    await section("INCOME", () => createIncome(supabase, state))
    await section("EXPENSE", () => createExpense(supabase, state))
    await section("TRANSFER", () => createTransfer(supabase, state))
    await section("INVESTMENT", () => createInvestment(supabase, state))
    await section("SUBSCRIPTION", () => createSubscription(supabase, state))
    await section("DATE RANGE", () => testDateRange(supabase, state))
    await section("BALANCES", () => testBalances(supabase, state))
    await section("REPORTS", () => testReports(supabase, state))
    await section("ARCHIVE", () => testArchive(supabase, state))
    await section("ARCHIVED TRANSACTION BLOCK", () => testArchivedBlock(supabase, state))
    await section("UNARCHIVE", () => testUnarchive(supabase, state))
  }

  await section("RLS", () => testRls(supabase, state))
  await cleanup(supabase, state)
  printSummary()
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.log(`[FATAL] FAIL`)
  console.log(`Error: ${message}`)
  addResult("FATAL", "FAIL", { error: message })
  printSummary()
})
