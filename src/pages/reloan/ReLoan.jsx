import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck, XCircle } from "lucide-react";
import {
  checkReLoanEligibility,
  calculateReLoanFinancialSummary,
  findCustomerAndLoan,
  getCustomerLoans,
  getReLoanRules,
  saveReLoanEligibility,
} from "../../services/reloanStorage";
import { getLoans } from "../../services/customerStorage";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const ReLoan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loanId = new URLSearchParams(location.search).get("loanId") || "";
  const match = useMemo(() => findCustomerAndLoan(loanId), [loanId]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("eligibility");
  const [checking, setChecking] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanIndex, setScanIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [result, setResult] = useState(null);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return getLoans()
      .filter((loan) =>
        [
          loan?.customerId,
          loan?.customerNumber,
          loan?.customerName,
          loan?.loanNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 12);
  }, [search]);

  useEffect(() => {
    if (!checking || !scanResult) {
      return undefined;
    }

    if (
      scanIndex >=
      scanResult.checks.length
    ) {
      const saved = saveReLoanEligibility(
        scanResult
      );

      const completionTimer = window.setTimeout(() => {
        setResult(saved);
        setChecking(false);
        setScanComplete(true);
      }, 0);

      return () => window.clearTimeout(completionTimer);
    }

    const timer = window.setTimeout(() => {
      setScanIndex((index) => index + 1);
    }, 520);

    return () => window.clearTimeout(timer);
  }, [checking, scanIndex, scanResult]);

  if (!match) {
    return (
      <div className="min-h-full bg-[#F6F8F7] p-4 lg:p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <header>
            <p className="text-[9px] font-bold uppercase tracking-wide text-[#0B6B43]">Auto Finance</p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#17221D]">Re-loan</h1>
            <p className="mt-1 text-xs text-slate-500">Search customers and review previous loan history before starting a new loan.</p>
          </header>

          {loanId && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">Loan not found</p>
              <button type="button" onClick={() => navigate("/reloan")} className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600">Back to Re-loan</button>
            </div>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="text-[10px] font-extrabold uppercase tracking-wide text-[#17221D]">Search Customer</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Customer ID, Customer Name or Loan Number..."
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-xs font-semibold text-[#17221D] outline-none focus:border-[#9CCEB1] focus:ring-2 focus:ring-[#EAF5EF]"
            />
          </section>

          {search && searchResults.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-xs font-semibold text-slate-500">No matching customer or loan found.</div>
          )}

          {searchResults.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {searchResults.map((loan) => (
                <div key={loan.id || loan.loanNumber} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                  <div>
                    <p className="text-xs font-extrabold text-[#17221D]">{loan.customerName || "Customer"}</p>
                    <p className="mt-1 text-[10px] text-slate-500">{loan.customerId || loan.customerNumber || "—"} · {loan.loanNumber || "—"}</p>
                  </div>
                  <button type="button" onClick={() => navigate(`/reloan?loanId=${encodeURIComponent(loan.id || loan.loanNumber || "")}`)} className="rounded-lg bg-[#0B6B43] px-3 py-2 text-[10px] font-extrabold text-white">Select Loan</button>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    );
  }

  const startNewLoan = () => {
    const fresh = findCustomerAndLoan(loanId);
    const freshResult = fresh && checkReLoanEligibility({
      customer: fresh.customer,
      loan: fresh.loan,
      vehicle: fresh.vehicle,
      rules: getReLoanRules(),
    });
    if (!freshResult?.eligible) {
      setResult(freshResult || null);
      return;
    }
    navigate(`/customers/onboarding?type=reloan&customerId=${encodeURIComponent(match.customer?.customer?.id || "")}&previousLoanId=${encodeURIComponent(loanId)}`);
  };

  const beginEligibilityCheck = () => {
    const calculated = checkReLoanEligibility({
      customer: match.customer,
      loan: match.loan,
      vehicle: match.vehicle,
      rules: getReLoanRules(),
    });

    setScanResult(calculated);
    setScanIndex(0);
    setScanComplete(false);
    setResult(null);
    setChecking(true);
  };

  return (
    <div className="min-h-full bg-[#F6F8F7] p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <button type="button" onClick={() => navigate("/loan")} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B5D3B]"><ArrowLeft size={14} /> Back to Loans</button>
        <header>
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#0B6B43]">Admin Workflow</p>
          <h1 className="mt-1 text-2xl font-extrabold text-[#17221D]">RE-LOAN</h1>
          <p className="mt-1 text-xs text-slate-500">Review the existing customer before creating a normal new loan.</p>
        </header>
        <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <Summary label="Customer" value={match.customer?.customer?.personal?.name || "—"} />
          <Summary label="Customer ID" value={match.customer?.customer?.customerNumber || match.customer?.customer?.id || "—"} />
          <Summary label="Mobile" value={match.customer?.customer?.personal?.mobileNumber || "—"} />
          <Summary label="Previous Loan" value={match.loan?.loanNumber || "—"} />
          <Summary label="Loan Status" value={match.loan?.status || "—"} />
          <Summary label="Vehicle" value={match.vehicle?.registrationNumber || match.vehicle?.vehicleId || "—"} />
        </section>
        <div className="flex gap-2 border-b border-slate-200">
          <Tab active={activeTab === "eligibility"} onClick={() => setActiveTab("eligibility")}>Re-loan Eligibility</Tab>
          <Tab active={activeTab === "customer"} onClick={() => setActiveTab("customer")}>View Customer</Tab>
        </div>
        {activeTab === "customer" ? (
          <section className="space-y-4">
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
              <Summary label="Address" value={match.customer?.customer?.personal?.address || match.customer?.customer?.personal?.area || "—"} />
              <Summary label="Vehicle ID" value={match.vehicle?.vehicleId || match.vehicle?.id || "—"} />
              <Summary label="Vehicle Status" value={match.vehicle?.status || "Active"} />
              <Summary label="Mobile" value={match.customer?.customer?.personal?.mobileNumber || "—"} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 text-sm font-extrabold text-[#17221D]">Loan History</h2>
              <div className="space-y-2">
                {getCustomerLoans(match.customer).map((historyLoan) => {
                  const historySummary = calculateReLoanFinancialSummary(historyLoan);
                  const historyEligibility = checkReLoanEligibility({
                    customer: match.customer,
                    loan: historyLoan,
                    vehicle: match.vehicle,
                    rules: getReLoanRules(),
                  });
                  return (
                    <div key={historyLoan.id || historyLoan.loanNumber} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div><p className="text-xs font-extrabold text-[#17221D]">{historyLoan.loanNumber || "—"}</p><p className="mt-1 text-[10px] text-slate-500">Status: {historyLoan.status || "—"}</p></div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => navigate(`/loan?loanId=${encodeURIComponent(historyLoan.id || historyLoan.loanNumber || "")}`)} className="rounded-lg border border-[#B9DCC6] bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-[#0B6B43]">View Loan</button>
                          {historyEligibility.eligible && (
                            <button type="button" onClick={() => navigate(`/reloan?loanId=${encodeURIComponent(historyLoan.id || historyLoan.loanNumber || "")}`)} className="rounded-lg bg-[#0B6B43] px-2.5 py-1.5 text-[10px] font-extrabold text-white">Re-loan</button>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><Summary label="Loan Amount" value={money(historyLoan.loanAmount)} /><Summary label="Amount Paid" value={money(historySummary.amountPaid)} /><Summary label="Outstanding" value={money(historySummary.totalOutstanding)} /><Summary label="Overdue" value={money(historySummary.currentOverdue)} /><Summary label="Penalty" value={money(historySummary.penalty)} /><Summary label="Paid Installments" value={`${historySummary.installmentsPaid}/${historySummary.totalInstallments}`} /><Summary label="Remaining Installments" value={historySummary.remainingInstallments} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            {!result && !checking && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                <ShieldCheck size={28} className="mx-auto text-[#0B6B43]" />
                <h2 className="mt-3 text-lg font-extrabold text-[#17221D]">Check Re-loan Eligibility</h2>
                <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">Verify the customer's repayment history, overdue status, previous loan condition, vehicle condition and required verification before creating a new loan.</p>
                <button type="button" onClick={beginEligibilityCheck} className="mt-5 rounded-lg bg-[#0B6B43] px-4 py-2.5 text-xs font-extrabold text-white">Check Eligibility</button>
              </div>
            )}
            {(checking || scanComplete) && scanResult && (
              <EligibilityScanner
                result={scanResult}
                scanIndex={scanIndex}
                checking={checking}
              />
            )}
            {result && <EligibilityResult result={result} onStart={startNewLoan} onBack={() => setResult(null)} onViewResult={() => navigate(`/reloan/eligibility/${encodeURIComponent(result.loanId)}`)} />}
          </section>
        )}
      </div>
    </div>
  );
};

const EligibilityResult = ({ result, onStart, onBack, onViewResult }) => (
  <section className="space-y-4">
    <div className={`rounded-xl border p-5 ${result.eligible ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
      <div className="flex items-center gap-3">{result.eligible ? <CheckCircle2 size={24} /> : <XCircle size={24} />}<div><h2 className="text-lg font-extrabold">{result.eligible ? "RE-LOAN ELIGIBLE" : "RE-LOAN NOT ELIGIBLE"}</h2><p className="mt-1 text-xs">{result.eligible ? "Customer meets the current eligibility requirements." : "Customer does not currently meet all requirements."}</p></div></div>
    </div>
    <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">{result.checks.map((check) => <div key={check.id} className="flex flex-wrap items-center gap-3 px-4 py-3"><p className="min-w-[180px] flex-1 text-xs font-bold text-[#17221D]">{check.label}</p><span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${check.status === "pass" ? "bg-emerald-50 text-emerald-700" : check.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{check.status === "pass" ? "PASS" : check.status === "pending" ? "PENDING VERIFICATION" : "FAIL"}</span><p className="text-[11px] text-slate-500">{check.message}</p></div>)}</div>
    <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Check Again</button><button type="button" onClick={onViewResult} className="rounded-lg border border-[#B9DCC6] bg-[#F6FBF8] px-3 py-2 text-xs font-extrabold text-[#0B6B43]">View Result</button>{result.eligible && <button type="button" onClick={onStart} className="rounded-lg bg-[#0B6B43] px-4 py-2 text-xs font-extrabold text-white">Start New Loan</button>}</div>
  </section>
);

const EligibilityScanner = ({ result, scanIndex, checking }) => (
  <section className="rounded-2xl border border-[#CFE8D9] bg-white p-5 shadow-sm">
    <div className="flex flex-col items-center border-b border-slate-100 pb-5 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#D8E9DF]">
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-[#0B6B43]" />
        <div className="absolute h-12 w-12 animate-pulse rounded-full bg-[#EAF5EF]" />
        {checking ? <LoaderCircle size={22} className="relative animate-spin text-[#0B6B43]" /> : <CheckCircle2 size={25} className="relative text-[#0B6B43]" />}
      </div>
      <h2 className="mt-4 text-lg font-extrabold text-[#17221D]">{checking ? "Checking Re-loan Eligibility" : "Eligibility checks complete"}</h2>
      <p className="mt-1 text-xs text-slate-500">{checking ? "Verifying customer and loan information..." : "The result below uses the completed checks from current storage."}</p>
      <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0B6B43] transition-all duration-500" style={{ width: `${Math.min((scanIndex / result.checks.length) * 100, 100)}%` }} /></div>
    </div>
    <div className="mt-4 space-y-2">
      {result.checks.map((check, index) => {
        const passed = index < scanIndex;
        const active = checking && index === scanIndex;
        return <div key={check.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? "bg-[#EAF5EF] text-[#0B6B43]" : passed ? check.status === "pass" ? "bg-emerald-50 text-emerald-700" : check.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700" : "bg-slate-100 text-slate-400"}`}>{active ? <LoaderCircle size={13} className="animate-spin" /> : passed ? check.status === "pass" ? <CheckCircle2 size={14} /> : check.status === "pending" ? "!" : <XCircle size={14} /> : "•"}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[#17221D]">{check.label}</p><p className="text-[10px] text-slate-500">{active ? "Checking..." : passed ? check.message : "Pending"}</p></div><span className="text-[9px] font-extrabold text-slate-400">{active ? "CHECKING" : passed ? check.status.toUpperCase() : "PENDING"}</span></div>;
      })}
    </div>
  </section>
);
const Summary = ({ label, value }) => <div><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-bold text-[#17221D]">{value}</p></div>;
const Tab = ({ active, onClick, children }) => <button type="button" onClick={onClick} className={`border-b-2 px-3 py-2 text-xs font-extrabold ${active ? "border-[#0B6B43] text-[#0B6B43]" : "border-transparent text-slate-400"}`}>{children}</button>;

export default ReLoan;
