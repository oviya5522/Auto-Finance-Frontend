1. Project Purpose

This project is a frontend-first Auto Finance / Loan Management application built with React, Vite, Tailwind CSS and React Router. The customer module is the root business entity. Customer onboarding collects customer, KYC, vehicle/RC, optional guarantor and loan information. The completed record is persisted locally for the frontend prototype and reused by the Customers and Loan Management modules.

2. High-Level Business Flow

Customer list → Add Customer

Customer Onboarding Step 1 → Customer information

Step 2 → KYC & required document selection/upload

Step 3 → Vehicle and RC information

Step 4 → Optional guarantor

Step 5 → Loan, interest, tenure and repayment calculation

Step 6 → Compact review

Create Customer → save customer + related loan to localStorage

Confirmed loan → repayment schedule is generated and can be shown in a separate schedule modal

Customers page and Loan Management page read the saved record rather than hardcoded business rows

3. Current Folder Structure

Finance-Frontend/
├── node_modules/
├── public/
├── src/
│   ├── assets/
│   │
│   ├── Components/
│   │   ├── customers/
│   │   │   └── onboarding/
│   │   │       ├── CustomerInfoStep.jsx
│   │   │       ├── GuarantorStep.jsx
│   │   │       ├── KycDocumentsStep.jsx
│   │   │       ├── LoanDetailsStep.jsx
│   │   │       ├── ReviewStep.jsx
│   │   │       ├── SummaryCard.jsx
│   │   │       └── VehicleRcStep.jsx
│   │   │
│   │   ├── loans/
│   │   │   └── RepaymentScheduleModal.jsx
│   │   │
│   │   └── SideBar.jsx
│   │
│   ├── context/
│   │   └── CustomerContext.jsx
│   │
│   ├── data/
│   │   └── schemas/
│   │       └── customerSchema.js
│   │
│   ├── pages/
│   │   ├── customers/
│   │   │   ├── CustomerDetails.jsx
│   │   │   ├── CustomerOnboarding.jsx
│   │   │   └── CustomerPage.jsx
│   │   │
│   │   └── loan/
│   │       └── Loan.jsx
│   │
│   ├── services/
│   │   ├── customerService.js
│   │   ├── customerStorage.js
│   │   ├── loanCalculator.js
│   │   └── repaymentSchedule.js
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md

4. File-by-File Responsibilities

File

Responsibility

src/main.jsx

Application entry point. Mounts the React application into the browser DOM.

src/App.jsx

Top-level routing/layout. Renders the sidebar and routes for Customers, Customer Onboarding, Customer Details and Loan Management.

src/App.css

Application-level CSS that is not handled by Tailwind utilities.

src/index.css

Global CSS / Tailwind base styles and global browser styling.

src/Components/SideBar.jsx

Persistent left navigation. Holds main navigation items, active-state styling and sidebar collapse behavior.

src/data/schemas/customerSchema.js

Canonical shape of a customer onboarding record and createEmptyCustomer() for a fresh independent record.

src/context/CustomerContext.jsx

React context for customer data/state. Current Customers page reads storage directly, so avoid creating a second source of truth.

src/services/customerStorage.js

Local persistence layer. Reads/writes customer records in localStorage, sanitizes file data before persistence, exposes customer/loan retrieval helpers and broadcasts update events.

src/services/customerService.js

Customer business/service operations. Review before adding logic that might duplicate customerStorage.js.

src/services/loanCalculator.js

Calculates loan-level summary values from amount, rate, tenure, interest type, repayment method and frequency.

src/services/repaymentSchedule.js

Generates period-by-period repayment rows after loan confirmation and provides schedule totals.

src/pages/customers/CustomerPage.jsx

Customer LIST page: summary cards, search/filter toolbar, customer table/mobile cards and onboarding/details navigation.

src/pages/customers/CustomerOnboarding.jsx

Six-step centered modal wizard. Owns onboarding state, navigation, validation state, final save and repayment schedule modal launch.

src/pages/customers/CustomerDetails.jsx

Single customer DETAIL page opened from the eye/View action.

src/pages/loan/Loan.jsx

Loan Management LIST page. Derives loan rows from saved customer records and shows loan-level information.

src/Components/customers/onboarding/CustomerInfoStep.jsx

Step 1 customer personal/contact information UI.

src/Components/customers/onboarding/KycDocumentsStep.jsx

Step 2 KYC fields and required document selection/upload. Minimum two selected documents with files.

src/Components/customers/onboarding/VehicleRcStep.jsx

Step 3 vehicle, registration, RC, compliance and insurance UI. Permit/FC are conditional for commercial vehicles.

src/Components/customers/onboarding/GuarantorStep.jsx

Step 4 optional guarantor flow.

src/Components/customers/onboarding/LoanDetailsStep.jsx

Step 5 loan inputs, interest configuration, automatic calculations and optional charges/initial payment sections.

src/Components/customers/onboarding/ReviewStep.jsx

Step 6 compact final review of customer, KYC, vehicle and loan essentials.

src/Components/customers/onboarding/SummaryCard.jsx

Reusable compact summary card for calculated financial values.

src/Components/loans/RepaymentScheduleModal.jsx

Separate post-confirmation repayment schedule popup showing installment rows.

5. Core Data Model

The customer is the root business record. Vehicle, RC, guarantor and loan are related portions of the same onboarding record.

{
  customer: {
    id,
    customerNumber,
    status,
    personal,
    kyc,
    documents,
    photo
  },

  vehicle: {
    vehicleType,
    brand,
    model,
    variant,
    colour,
    manufacturingYear,
    fuelType,
    vehicleValue
  },

  rc: {
    registrationNumber,
    rcBookNumber,
    location,
    chassisNumber,
    engineNumber,
    taxExpiry,
    permitExpiry,
    fcExpiry,
    insurance,
    endorsement
  },

  guarantor: {
    hasGuarantor,
    personal,
    kyc,
    documents,
    photo
  },

  loan: {
    id,
    loanNumber,
    vehicleAmount,
    loanAmount,
    downPayment,
    interest,
    repayment,
    calculation,
    charges,
    collection,
    firstDueDate,
    repaymentSchedule,
    status
  }
}

6. Onboarding Step Responsibilities

Step

Purpose

Step 1 – Customer

Basic customer identity/contact information. Date is automatically assigned; avoid unnecessary duplicates.

Step 2 – KYC & Documents

Identity fields plus selection/upload of at least two document types. File contents should not be persisted in localStorage.

Step 3 – Vehicle & RC

Vehicle data, registration/RC identifiers, compliance and insurance. Do not duplicate the RC document upload.

Step 4 – Guarantor

Optional guarantor. Ask whether one exists; show guarantor form only when applicable.

Step 5 – Loan

Loan amount, interest type/rate, repayment method, frequency and tenure. Calculate principal, interest, total payable and payment amount.

Step 6 – Review

Compact confirmation showing only important customer, KYC, vehicle and loan information.

7. Persistence & Single Source of Truth

The frontend prototype uses localStorage under the key "fleetopz_customers". CustomerPage and Loan.jsx should both read this same source.

saveCustomer(finalCustomer) persists the complete business record.

getCustomers() returns the root customer records.

getLoans() derives loan rows from those customer records.

getOutstandingAmount(loan) should be the shared outstanding calculation used by both customer and loan views.

The storage layer removes Base64 photo/document/insurance file data before saving.

The storage layer dispatches fleetopz:data-updated so the same browser tab can refresh UI state.

8. Financial Calculation Concepts

Principal = financed loan amount.

Interest = interest generated by the selected calculation method.

Total Payable = principal + interest under the current design.

EMI / Payment Amount = amount due per payment period according to the selected repayment method.

Outstanding = total payable minus actual payments received; it should not remain equal to original total payable after payments begin.

9. Page Responsibilities

Route

Business Focus

Primary Data Source

/customers

Customer portfolio / customer list

getCustomers()

/customers/onboarding

Create customer + initial loan

React onboarding state → saveCustomer()

/customers/:customerId

Single customer details

getCustomerById()

/loan

Loan portfolio / loan management

getLoans()

10. Common Pitfalls

Do not introduce a second customer data source when customerStorage.js already owns persistence.

Do not hardcode customer or loan rows.

Do not store photo/PDF Base64 contents in localStorage.

Do not put the repayment table inside LoanDetailsStep.jsx; use the separate repayment schedule modal/view.

Do not use calculation.totalDue as true outstanding once payments are recorded.

Keep CustomerPage (list) separate from CustomerDetails (single record).

Keep schema paths consistent: registration is rc.registrationNumber, while vehicle identity is stored under vehicle.*.

11. Recommended Development Order

1. Read customerSchema.js to understand the canonical record shape.

2. Read CustomerOnboarding.jsx to understand how the record is built.

3. Read customerStorage.js to understand persistence and shared retrieval.

4. Read loanCalculator.js and repaymentSchedule.js for financial behavior.

5. Read CustomerPage.jsx for the customer list and CustomerDetails.jsx for one customer.

6. Read Loan.jsx for loan portfolio presentation.

7. Add paymentHistory/payment logic before implementing collections and true outstanding balances.

8. When a backend is introduced, replace the persistence layer rather than duplicating business data in every page.

12. Quick Start for a New Developer

Start with these files in this order to understand the system quickly:

App.jsx — routes and application layout

customerSchema.js — master data structure

CustomerOnboarding.jsx — record creation workflow

customerStorage.js — local persistence and shared access

CustomerPage.jsx — customer list

CustomerDetails.jsx — single customer view

Loan.jsx — loan list

loanCalculator.js — loan summary calculations

repaymentSchedule.js — installment schedule generation

13. Architecture Overview

CustomerPage
    │
    └── Add Customer
            │
            ▼
CustomerOnboarding
    │
    ├── CustomerInfoStep
    ├── KycDocumentsStep
    ├── VehicleRcStep
    ├── GuarantorStep
    ├── LoanDetailsStep
    └── ReviewStep
            │
            ▼
      finalCustomer object
            │
            ├── loanCalculator.js
            ├── repaymentSchedule.js
            │
            ▼
      customerStorage.js
            │
            ▼
    localStorage
    "fleetopz_customers"
            │
       ┌────┴─────┐
       ▼          ▼
 CustomerPage   Loan.jsx
       │
       ▼
CustomerDetails

Maintenance note: This guide reflects the folder structure visible in the supplied project screenshot and the implementation decisions made in this conversation. Update it when file responsibilities, storage ownership, routing, or the canonical schema changes.