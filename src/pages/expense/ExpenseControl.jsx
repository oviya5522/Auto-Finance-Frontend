// src/pages/expense/ExpenseControl.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  RotateCcw,
  Receipt,
  IndianRupee,
  Clock3,
  CheckCircle2,
  Eye,
  Pencil,
  X,
  FileText,
  Fuel,
  Car,
  Building2,
  UserRound,
} from "lucide-react";

import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../../services/expenseStorage";

/* =========================================================
   MAIN
========================================================= */

const ExpenseControl = () => {
  const [expenses, setExpenses] =
    useState(() => getExpenses());

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [dateFilter, setDateFilter] =
    useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [selectedExpense, setSelectedExpense] =
    useState(null);

  const [editingExpense, setEditingExpense] =
    useState(null);

  /* =====================================================
     LOAD / SYNC
  ====================================================== */

  useEffect(() => {
    const reloadExpenses = () => {
      setExpenses(getExpenses());
    };

    reloadExpenses();

    window.addEventListener(
      "fleetopz:data-updated",
      reloadExpenses
    );

    window.addEventListener(
      "storage",
      reloadExpenses
    );

    return () => {
      window.removeEventListener(
        "fleetopz:data-updated",
        reloadExpenses
      );

      window.removeEventListener(
        "storage",
        reloadExpenses
      );
    };
  }, []);

  /* =====================================================
     PAID / PENDING HELPERS
  ====================================================== */

  const paidExpenses = useMemo(() => {
    return expenses.filter(
      (expense) =>
        String(
          expense?.status || ""
        )
          .trim()
          .toLowerCase() === "paid"
    );
  }, [expenses]);

  const pendingExpenseRecords =
    useMemo(() => {
      return expenses.filter(
        (expense) =>
          String(
            expense?.status || ""
          )
            .trim()
            .toLowerCase() === "pending"
      );
    }, [expenses]);

  /* =====================================================
     FILTERED DATA
  ====================================================== */

  const filteredExpenses = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const searchableText = [
        expense?.id,
        expense?.category,
        expense?.subCategory,
        expense?.description,
        expense?.paidBy,
        expense?.vendor,
        expense?.reference,
        expense?.paymentMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const matchesCategory =
        categoryFilter ===
          "All Categories" ||
        expense?.category ===
          categoryFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        expense?.status ===
          statusFilter;

      const matchesDate =
        !dateFilter ||
        expense?.date === dateFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    expenses,
    search,
    categoryFilter,
    statusFilter,
    dateFilter,
  ]);

  /* =====================================================
     DATE
  ====================================================== */

  const today = useMemo(() => {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }, []);

  const currentMonth =
    today.slice(0, 7);

  /* =====================================================
     TOTAL PAID EXPENSE
  ====================================================== */

  const totalExpenses = useMemo(() => {
    return paidExpenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense?.amount || 0
        ),
      0
    );
  }, [paidExpenses]);

  /* =====================================================
     TODAY'S PAID EXPENSE
  ====================================================== */

  const todayExpenses = useMemo(() => {
    return paidExpenses
      .filter(
        (expense) =>
          String(
            expense?.date || ""
          ) === today
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense?.amount || 0
          ),
        0
      );
  }, [
    paidExpenses,
    today,
  ]);

  /* =====================================================
     THIS MONTH'S PAID EXPENSE
  ====================================================== */

  const monthExpenses = useMemo(() => {
    return paidExpenses
      .filter(
        (expense) =>
          String(
            expense?.date || ""
          ).startsWith(
            currentMonth
          )
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(
            expense?.amount || 0
          ),
        0
      );
  }, [
    paidExpenses,
    currentMonth,
  ]);

  /* =====================================================
     PENDING
     
     Pending is displayed separately.
     Pending is NEVER included in totalExpenses.
  ====================================================== */

  const pendingExpenses =
    pendingExpenseRecords.length;

  const pendingExpenseAmount =
    useMemo(() => {
      return pendingExpenseRecords.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense?.amount || 0
          ),
        0
      );
    }, [
      pendingExpenseRecords,
    ]);

  /* =====================================================
     RESET
  ====================================================== */

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter(
      "All Categories"
    );
    setStatusFilter(
      "All Status"
    );
    setDateFilter("");
  };

  /* =====================================================
     SAVE
  ====================================================== */

  const handleSaveExpense = (
    expense
  ) => {
    if (editingExpense) {
      updateExpense(
        editingExpense.id,
        expense
      );
    } else {
      addExpense(expense);
    }

    setExpenses(getExpenses());

    setShowAddModal(false);
    setEditingExpense(null);
  };

  /* =====================================================
     EDIT
  ====================================================== */

  const handleEditExpense = (
    expense
  ) => {
    setSelectedExpense(null);
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  /* =====================================================
     DELETE
  ====================================================== */

  const handleDeleteExpense = (
    expenseId
  ) => {
    deleteExpense(expenseId);

    setExpenses(getExpenses());
    setSelectedExpense(null);
  };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div
      className="
        min-h-full
        bg-[#F6F8F7]
        px-3
        py-3
        sm:px-4
        sm:py-4
        lg:px-5
        lg:py-5
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          mb-4
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-[21px]
              font-extrabold
              tracking-tight
              text-[#17221D]
            "
          >
            Expense Control
          </h1>

          <p
            className="
              mt-1
              text-[10px]
              font-medium
              text-slate-400
            "
          >
            Track and manage business expenses
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setShowAddModal(true);
          }}
          className="
            inline-flex
            h-9
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[#0B6B43]
            px-4
            text-[9px]
            font-bold
            text-white
            shadow-[0_5px_15px_rgba(11,107,67,0.18)]
            transition
            hover:bg-[#095B3B]
            hover:shadow-md
          "
        >
          <Plus size={14} />
          Add Expense
        </button>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-2.5
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <ExpenseMetric
          icon={Receipt}
          label="Total Expenses"
          value={formatMoney(
            totalExpenses
          )}
          note="Paid expenses only"
          tone="green"
        />

        <ExpenseMetric
          icon={IndianRupee}
          label="This Month"
          value={formatMoney(
            monthExpenses
          )}
          note="Paid expenses only"
          tone="blue"
        />

        <ExpenseMetric
          icon={Clock3}
          label="Today's Expenses"
          value={formatMoney(
            todayExpenses
          )}
          note="Paid expenses only"
          tone="amber"
        />

        <PendingExpenseMetric
          count={pendingExpenses}
          amount={pendingExpenseAmount}
        />
      </div>

      {/* =================================================
          FILTER BAR
      ================================================== */}

      <div
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-2.5
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            xl:flex-row
            xl:items-center
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >
            <Search
              size={13}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search expense, vendor, category..."
              className="
                h-9
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                pl-8
                pr-3
                text-[10px]
                font-medium
                text-[#253252]
                outline-none
                transition
                focus:border-[#9CCEB1]
                focus:ring-1
                focus:ring-[#DCEFE4]
              "
            />
          </div>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[9px]
              font-semibold
              text-slate-600
              outline-none
              focus:border-[#9CCEB1]
            "
          >
            <option>
              All Categories
            </option>
            <option>Fuel</option>
            <option>
              Vehicle Maintenance
            </option>
            <option>
              Insurance
            </option>
            <option>
              Registration / RC
            </option>
            <option>
              Collection Expense
            </option>
            <option>
              Office Expense
            </option>
            <option>
              Legal Expense
            </option>
            <option>
              Miscellaneous
            </option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[9px]
              font-semibold
              text-slate-600
              outline-none
              focus:border-[#9CCEB1]
            "
          >
            <option>
              All Status
            </option>
            <option>Paid</option>
            <option>Pending</option>
          </select>

          {/* DATE */}

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[9px]
              font-semibold
              text-slate-600
              outline-none
              focus:border-[#9CCEB1]
            "
          />

          {/* RESET */}

          <button
            type="button"
            onClick={resetFilters}
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[9px]
              font-bold
              text-slate-500
              transition
              hover:border-[#B9DCCA]
              hover:bg-[#F4FAF6]
              hover:text-[#0B6B43]
            "
          >
            <RotateCcw size={11} />
            Reset
          </button>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================== */}

      <div
        className="
          mt-3
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-slate-100
            px-4
            py-3
          "
        >
          <div>
            <h2
              className="
                text-[12px]
                font-extrabold
                text-[#17221D]
              "
            >
              All Expenses
            </h2>

            <p
              className="
                mt-0.5
                text-[8px]
                text-slate-400
              "
            >
              {filteredExpenses.length} records
            </p>
          </div>

          {/* FILTERED RECORD TOTAL */}
          <span
            className="
              rounded-full
              bg-[#EAF5EF]
              px-2.5
              py-1
              text-[8px]
              font-bold
              text-[#0B5D3B]
            "
          >
            {formatMoney(
              filteredExpenses
                .filter(
                  (expense) =>
                    String(
                      expense?.status ||
                        ""
                    )
                      .trim()
                      .toLowerCase() ===
                    "paid"
                )
                .reduce(
                  (sum, expense) =>
                    sum +
                    Number(
                      expense?.amount ||
                        0
                    ),
                  0
                )
            )}
          </span>
        </div>

        {filteredExpenses.length ===
        0 ? (
          <EmptyExpenses />
        ) : (
          <div className="overflow-x-auto">
            <table
              className="
                w-full
                min-w-[900px]
                border-collapse
              "
            >
              <thead className="bg-[#F8FAF9]">
                <tr>
                  <TableHeader>
                    Expense ID
                  </TableHeader>

                  <TableHeader>
                    Date
                  </TableHeader>

                  <TableHeader>
                    Category
                  </TableHeader>

                  <TableHeader>
                    Description
                  </TableHeader>

                  <TableHeader>
                    Amount
                  </TableHeader>

                  <TableHeader>
                    Paid By
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader align="center">
                    Action
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map(
                  (expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      onView={() =>
                        setSelectedExpense(
                          expense
                        )
                      }
                      onEdit={() =>
                        handleEditExpense(
                          expense
                        )
                      }
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            px-4
            py-3
          "
        >
          <p
            className="
              text-[8px]
              font-medium
              text-slate-400
            "
          >
            Showing{" "}
            <span className="font-bold text-slate-600">
              {filteredExpenses.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-600">
              {expenses.length}
            </span>{" "}
            expenses
          </p>
        </div>
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showAddModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
          onSave={
            handleSaveExpense
          }
        />
      )}

      {/* =================================================
          VIEW MODAL
      ================================================== */}

      {selectedExpense && (
        <ExpenseViewModal
          expense={
            selectedExpense
          }
          onClose={() =>
            setSelectedExpense(
              null
            )
          }
          onEdit={() =>
            handleEditExpense(
              selectedExpense
            )
          }
          onDelete={() =>
            handleDeleteExpense(
              selectedExpense.id
            )
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   KPI
========================================================= */

const ExpenseMetric = ({
  icon: Icon,
  label,
  value,
  note,
  tone = "green",
}) => {
  const styles = {
    green: {
      bg: "bg-[#F1FAF4]",
      icon:
        "bg-[#DDF1E5] text-[#0B6B43]",
      value:
        "text-[#0B6B43]",
    },

    blue: {
      bg: "bg-[#F1F6FE]",
      icon:
        "bg-[#E1ECFD] text-[#4779D8]",
      value:
        "text-[#4779D8]",
    },

    amber: {
      bg: "bg-[#FFF8ED]",
      icon:
        "bg-[#FFF0CE] text-[#D88B12]",
      value:
        "text-[#B86D00]",
    },

    red: {
      bg: "bg-[#FFF4F4]",
      icon:
        "bg-[#FDE2E2] text-[#D92D3A]",
      value:
        "text-[#D92D3A]",
    },
  };

  const current =
    styles[tone] ||
    styles.green;

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        ${current.bg}
        px-3.5
        py-3
        shadow-sm
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-[0.05em]
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-[20px]
              font-extrabold
              tracking-tight
              ${current.value}
            `}
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-[8px]
              font-medium
              text-slate-400
            "
          >
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${current.icon}
          `}
        >
          <Icon
            size={15}
            strokeWidth={2.2}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   PENDING KPI
========================================================= */

const PendingExpenseMetric = ({
  count,
  amount,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-[#F3D7A6]
        bg-[#FFF8ED]
        px-3.5
        py-3
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-[0.05em]
              text-[#A76A12]
            "
          >
            Pending Expenses
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <p
              className="
                text-[20px]
                font-extrabold
                tracking-tight
                text-[#B86D00]
              "
            >
              {count}
            </p>

            <p
              className="
                truncate
                text-[11px]
                font-extrabold
                text-[#C27808]
              "
            >
              {formatMoney(amount)}
            </p>
          </div>

          <p
            className="
              mt-1
              text-[8px]
              font-medium
              text-[#B98A4A]
            "
          >
            Not included in expense total
          </p>
        </div>

        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#FFF0CE]
            text-[#D88B12]
          "
        >
          <Clock3
            size={15}
            strokeWidth={2.2}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TABLE ROW
========================================================= */

const ExpenseRow = ({
  expense,
  onView,
  onEdit,
}) => {
  const icon =
    getExpenseIcon(
      expense?.category
    );

  return (
    <tr
      className="
        border-b
        border-slate-100
        transition
        hover:bg-[#FAFCFB]
      "
    >
      <td className="px-4 py-3">
        <p className="text-[10px] font-bold text-[#0B6B43]">
          {expense?.id}
        </p>
      </td>

      <td className="px-4 py-3">
        <p className="text-[10px] font-semibold text-[#253252]">
          {formatDisplayDate(
            expense?.date
          )}
        </p>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              bg-[#EAF5EF]
              text-[#0B6B43]
            "
          >
            {icon}
          </span>

          <div>
            <p className="text-[9px] font-bold text-[#253252]">
              {expense?.category}
            </p>

            <p className="mt-0.5 text-[8px] text-slate-400">
              {expense?.subCategory ||
                "—"}
            </p>
          </div>
        </div>
      </td>

      <td className="max-w-[230px] px-4 py-3">
        <p
          className="
            truncate
            text-[9px]
            font-semibold
            text-[#253252]
          "
          title={
            expense?.description ||
            ""
          }
        >
          {expense?.description ||
            "—"}
        </p>

        <p className="mt-0.5 truncate text-[8px] text-slate-400">
          {expense?.vendor ||
            "No vendor"}
        </p>
      </td>

      <td className="px-4 py-3">
        <p className="text-[11px] font-extrabold text-[#17221D]">
          ₹
          {formatAmount(
            expense?.amount
          )}
        </p>
      </td>

      <td className="px-4 py-3">
        <p className="text-[9px] font-semibold text-[#253252]">
          {expense?.paidBy ||
            "—"}
        </p>

        <p className="mt-0.5 text-[8px] text-slate-400">
          {expense?.paymentMode ||
            "—"}
        </p>
      </td>

      <td className="px-4 py-3">
        <ExpenseStatus
          status={
            expense?.status
          }
        />
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          <IconButton
            icon={Eye}
            title="View"
            onClick={onView}
          />

          <IconButton
            icon={Pencil}
            title="Edit"
            onClick={onEdit}
          />
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   ADD / EDIT MODAL
========================================================= */

const ExpenseModal = ({
  expense,
  onClose,
  onSave,
}) => {
  const [form, setForm] =
    useState(() => ({
      date:
        expense?.date ||
        new Date()
          .toISOString()
          .slice(0, 10),

      category:
        expense?.category ||
        "Fuel",

      subCategory:
        expense?.subCategory ||
        "",

      amount:
        expense?.amount ??
        "",

      paymentMode:
        expense?.paymentMode ||
        "Cash",

      paidBy:
        expense?.paidBy ||
        "",

      vendor:
        expense?.vendor ||
        "",

      description:
        expense?.description ||
        "",

      reference:
        expense?.reference ||
        "",

      status:
        expense?.status ||
        "Paid",
    }));

  const update = (
    key,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  const submit = (
    event
  ) => {
    event.preventDefault();

    onSave({
      ...form,
      amount: Number(
        form.amount || 0
      ),
    });
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[600]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-[560px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_25px_90px_rgba(15,23,42,0.28)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-3.5
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-[#EAF5EF]
                text-[#0B6B43]
              "
            >
              <Receipt size={15} />
            </div>

            <div>
              <h2 className="text-[13px] font-extrabold text-[#17221D]">
                {expense
                  ? "Edit Expense"
                  : "Add Expense"}
              </h2>

              <p className="mt-0.5 text-[8px] text-slate-400">
                {expense
                  ? `${expense.id} details`
                  : "Create a new expense record"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={16} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={submit}
          className="p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            <FormField label="Expense Date">
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  update(
                    "date",
                    event.target.value
                  )
                }
                required
                className={inputClass}
              />
            </FormField>

            <FormField label="Category">
              <select
                value={form.category}
                onChange={(event) =>
                  update(
                    "category",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option>Fuel</option>
                <option>
                  Vehicle Maintenance
                </option>
                <option>
                  Insurance
                </option>
                <option>
                  Registration / RC
                </option>
                <option>
                  Collection Expense
                </option>
                <option>
                  Office Expense
                </option>
                <option>
                  Legal Expense
                </option>
                <option>
                  Miscellaneous
                </option>
              </select>
            </FormField>

            <FormField label="Sub Category">
              <input
                value={
                  form.subCategory
                }
                onChange={(event) =>
                  update(
                    "subCategory",
                    event.target.value
                  )
                }
                placeholder="Enter sub category"
                className={inputClass}
              />
            </FormField>

            <FormField label="Amount">
              <div className="relative">
                <span
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[11px]
                    font-bold
                    text-slate-400
                  "
                >
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    update(
                      "amount",
                      event.target.value
                    )
                  }
                  required
                  className={`${inputClass} pl-7`}
                  placeholder="0.00"
                />
              </div>
            </FormField>

            <FormField label="Payment Mode">
              <select
                value={
                  form.paymentMode
                }
                onChange={(event) =>
                  update(
                    "paymentMode",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option>Cash</option>
                <option>Bank</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </FormField>

            <FormField label="Paid By">
              <input
                value={form.paidBy}
                onChange={(event) =>
                  update(
                    "paidBy",
                    event.target.value
                  )
                }
                placeholder="Employee / branch"
                className={inputClass}
              />
            </FormField>

            <FormField label="Vendor">
              <input
                value={form.vendor}
                onChange={(event) =>
                  update(
                    "vendor",
                    event.target.value
                  )
                }
                placeholder="Vendor name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Reference / Invoice No.">
              <input
                value={
                  form.reference
                }
                onChange={(event) =>
                  update(
                    "reference",
                    event.target.value
                  )
                }
                placeholder="Reference number"
                className={inputClass}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Description">
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Enter expense description"
                  className={`
                    ${inputClass}
                    h-auto
                    min-h-[78px]
                    resize-none
                    py-2.5
                  `}
                />
              </FormField>
            </div>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  update(
                    "status",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option>Paid</option>
                <option>Pending</option>
              </select>
            </FormField>

          </div>

          {/* FOOTER */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-end
              gap-2
              border-t
              border-slate-100
              pt-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                h-9
                rounded-lg
                border
                border-slate-200
                px-4
                text-[9px]
                font-bold
                text-slate-500
                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                h-9
                rounded-lg
                bg-[#0B6B43]
                px-4
                text-[9px]
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#095B3B]
              "
            >
              {expense
                ? "Update Expense"
                : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   VIEW MODAL
========================================================= */

const ExpenseViewModal = ({
  expense,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[600]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-[520px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_25px_90px_rgba(15,23,42,0.28)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-3.5
          "
        >
          <div>
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.05em]
                text-slate-400
              "
            >
              Expense
            </p>

            <h2
              className="
                mt-0.5
                text-[16px]
                font-extrabold
                text-[#17221D]
              "
            >
              {expense?.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-50
            "
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div
            className="
              rounded-xl
              bg-[#F2FAF5]
              px-4
              py-3
            "
          >
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-wide
                text-[#0B6B43]
              "
            >
              Amount
            </p>

            <p
              className="
                mt-1
                text-[24px]
                font-extrabold
                text-[#0B6B43]
              "
            >
              ₹
              {formatAmount(
                expense?.amount
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem
              label="Date"
              value={formatDisplayDate(
                expense?.date
              )}
            />

            <InfoItem
              label="Category"
              value={
                expense?.category
              }
            />

            <InfoItem
              label="Sub Category"
              value={
                expense?.subCategory
              }
            />

            <InfoItem
              label="Status"
              value={
                expense?.status
              }
            />

            <InfoItem
              label="Payment Mode"
              value={
                expense?.paymentMode
              }
            />

            <InfoItem
              label="Paid By"
              value={
                expense?.paidBy
              }
            />

            <InfoItem
              label="Vendor"
              value={
                expense?.vendor
              }
            />

            <InfoItem
              label="Reference"
              value={
                expense?.reference
              }
            />

            <div className="col-span-2">
              <InfoItem
                label="Description"
                value={
                  expense?.description
                }
              />
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            px-5
            py-3.5
          "
        >
          <button
            type="button"
            onClick={onDelete}
            className="
              text-[9px]
              font-bold
              text-red-500
              hover:text-red-700
            "
          >
            Delete Expense
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="
                h-8
                rounded-lg
                border
                border-slate-200
                px-3
                text-[9px]
                font-bold
                text-slate-500
              "
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-lg
                bg-[#0B6B43]
                px-3
                text-[9px]
                font-bold
                text-white
                hover:bg-[#095B3B]
              "
            >
              <Pencil size={11} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   INFO
========================================================= */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p
        className="
          text-[8px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-[10px]
          font-bold
          text-[#253252]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
};

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
  label,
  children,
}) => {
  return (
    <label className="block">
      <span
        className="
          mb-1.5
          block
          text-[8px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </span>

      {children}
    </label>
  );
};

const inputClass = `
  h-9
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-3
  text-[10px]
  font-semibold
  text-[#253252]
  outline-none
  transition
  focus:border-[#9CCEB1]
  focus:ring-1
  focus:ring-[#DCEFE4]
`;

/* =========================================================
   STATUS
========================================================= */

const ExpenseStatus = ({
  status,
}) => {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  const isPaid =
    normalized === "paid";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2
        py-1
        text-[7px]
        font-extrabold
        ${
          isPaid
            ? "bg-[#EAF5EF] text-[#0B6B43]"
            : "bg-[#FFF4DE] text-[#B86D00]"
        }
      `}
    >
      {isPaid
        ? "Paid"
        : "Pending"}
    </span>
  );
};

/* =========================================================
   ICON BUTTON
========================================================= */

const IconButton = ({
  icon: Icon,
  title,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="
        flex
        h-7
        w-7
        items-center
        justify-center
        rounded-md
        border
        border-slate-200
        bg-white
        text-slate-500
        transition
        hover:border-[#B8DAC7]
        hover:bg-[#F3FAF6]
        hover:text-[#0B6B43]
      "
    >
      <Icon size={12} />
    </button>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const EmptyExpenses = () => {
  return (
    <div className="px-5 py-12 text-center">
      <div
        className="
          mx-auto
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-slate-50
          text-slate-400
        "
      >
        <Receipt size={17} />
      </div>

      <p
        className="
          mt-3
          text-[11px]
          font-bold
          text-[#17221D]
        "
      >
        No expenses found
      </p>

      <p
        className="
          mt-1
          text-[8px]
          text-slate-400
        "
      >
        Add an expense to see it here.
      </p>
    </div>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        border-b
        border-slate-200
        px-4
        py-2.5
        text-[8px]
        font-bold
        uppercase
        tracking-[0.05em]
        text-slate-400
        ${
          align === "center"
            ? "text-center"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   CATEGORY ICON
========================================================= */

const getExpenseIcon = (
  category
) => {
  switch (category) {
    case "Fuel":
      return (
        <Fuel size={13} />
      );

    case "Vehicle Maintenance":
      return (
        <Car size={13} />
      );

    case "Office Expense":
      return (
        <Building2 size={13} />
      );

    case "Collection Expense":
      return (
        <UserRound size={13} />
      );

    case "Insurance":
      return (
        <FileText size={13} />
      );

    default:
      return (
        <Receipt size={13} />
      );
  }
};

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (
  value
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatAmount = (
  value
) => {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
};

const formatDisplayDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default ExpenseControl;