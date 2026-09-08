// src/services/customerStorage.js

const CUSTOMER_STORAGE_KEY = "auto_finance_customers";

/* =========================================================
   VEHICLE STATUS
========================================================= */

export const VEHICLE_STATUS = {
  ACTIVE: "ACTIVE",
  SEIZED: "SEIZED",
  PENDING_SALE: "PENDING_SALE",
  RELEASED: "RELEASED",
  SOLD: "SOLD",
};

/* =========================================================
   VEHICLE ID
========================================================= */

const createVehicleId = (customers) => {
  const highestNumber = customers.reduce(
    (max, record) => {
      const vehicleId =
        record?.vehicle?.id ||
        record?.vehicle?.vehicleId ||
        record?.loan?.vehicle?.id ||
        record?.loan?.vehicle?.vehicleId ||
        "";

      const match = String(vehicleId).match(/^VH-(\d+)$/);

      if (!match) {
        return max;
      }

      return Math.max(max, Number(match[1]));
    },
    0
  );

  return `VH-${String(highestNumber + 1).padStart(4, "0")}`;
};

export const generateVehicleId = () => {
  const customers = getCustomers();

  return createVehicleId(customers);
};

/* =========================================================
   CUSTOMER SANITIZATION
========================================================= */

const sanitizeCustomerForStorage = (customer) => {
  const safeCustomer = structuredClone(customer);

  // Do not store customer photo
  if (safeCustomer.customer?.photo) {
    safeCustomer.customer.photo = {
      fileName: "",
      fileData: "",
    };
  }

  // Do not store uploaded customer document files
  if (safeCustomer.customer?.documents?.uploads) {
    safeCustomer.customer.documents.uploads =
      safeCustomer.customer.documents.uploads.map(
        (upload) => ({
          type: upload.type || "",
          fileName: upload.fileName || "",
          fileType: upload.fileType || "",
          fileSize: upload.fileSize || 0,
          uploadedAt: upload.uploadedAt || "",
          fileData: "",
        })
      );
  }

  // Do not store insurance document file
  if (safeCustomer.rc?.insurance?.document) {
    safeCustomer.rc.insurance.document = {
      fileName:
        safeCustomer.rc.insurance.document.fileName || "",
      fileType:
        safeCustomer.rc.insurance.document.fileType || "",
      fileSize:
        safeCustomer.rc.insurance.document.fileSize || 0,
      uploadedAt:
        safeCustomer.rc.insurance.document.uploadedAt || "",
      fileData: "",
    };
  }

  return safeCustomer;
};

/* =========================================================
   CUSTOMER STORAGE
========================================================= */

export const getCustomers = () => {
  try {
    const stored = localStorage.getItem(
      CUSTOMER_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Failed to read customers:",
      error
    );

    return [];
  }
};

export const saveCustomers = (customers) => {
  localStorage.setItem(
    CUSTOMER_STORAGE_KEY,
    JSON.stringify(customers)
  );

  // Same-tab update notification
  window.dispatchEvent(
    new CustomEvent("fleetopz:data-updated")
  );
};

export const saveCustomer = (customer) => {
  const safeCustomer =
    sanitizeCustomerForStorage(customer);

  const customers = getCustomers();

  const updatedCustomers = [
    ...customers,
    safeCustomer,
  ];

  saveCustomers(updatedCustomers);

  return safeCustomer;
};

export const updateCustomer = (
  customerId,
  updatedCustomer
) => {
  const customers = getCustomers();

  const safeCustomer =
    sanitizeCustomerForStorage(
      updatedCustomer
    );

  const updatedCustomers =
    customers.map((item) =>
      item.customer?.id === customerId
        ? safeCustomer
        : item
    );

  saveCustomers(updatedCustomers);

  return safeCustomer;
};

export const getCustomerById = (customerId) => {
  const customers = getCustomers();

  return (
    customers.find(
      (item) =>
        item.customer?.id === customerId
    ) || null
  );
};

/* =========================================================
   LOANS
========================================================= */

export const getLoans = () => {
  const customers = getCustomers();

  return customers.flatMap((item) => {
    const loans = Array.isArray(item?.loans)
      ? item.loans
      : [];
    const sourceLoans = item?.loan
      ? [item.loan, ...loans]
      : loans;
    const seen = new Set();

    return sourceLoans
      .filter((loan) => {
        const key = String(
          loan?.id ||
            loan?.loanNumber ||
            ""
        );

        if (!key || seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .map((loan) => ({
        ...loan,

        customerId:
          item.customer?.id || "",

        customerNumber:
          item.customer?.customerNumber || "",

        customerName:
          item.customer?.personal?.name || "",

        mobileNumber:
          item.customer?.personal?.mobileNumber || "",

        vehicle:
          loan?.vehicle ||
          item.vehicle ||
          {},
      }));
  });
};

export const appendLoanToCustomer = (
  customerId,
  loan
) => {
  const customers = getCustomers();
  let savedLoan = null;

  const updatedCustomers = customers.map((record) => {
    if (
      String(record?.customer?.id || "") !==
      String(customerId || "")
    ) {
      return record;
    }

    const existingLoans = Array.isArray(record?.loans)
      ? record.loans
      : [];
    const existing = [
      record?.loan,
      ...existingLoans,
    ].filter(Boolean);
    const duplicate = existing.some(
      (item) =>
        String(item?.id || item?.loanNumber || "") ===
        String(loan?.id || loan?.loanNumber || "")
    );

    if (duplicate) {
      throw new Error("This loan already exists for the customer.");
    }

    savedLoan = loan;
    return {
      ...record,
      loans: [
        ...existingLoans,
        loan,
      ],
      updatedAt: new Date().toISOString(),
    };
  });

  if (!savedLoan) {
    throw new Error("Customer not found for re-loan creation.");
  }

  saveCustomers(updatedCustomers);
  return savedLoan;
};

/* =========================================================
   DELETE / CLEAR CUSTOMERS
========================================================= */

export const deleteCustomer = (customerId) => {
  const customers = getCustomers();

  const updatedCustomers =
    customers.filter(
      (item) =>
        item.customer?.id !== customerId
    );

  saveCustomers(updatedCustomers);
};

export const clearCustomers = () => {
  localStorage.removeItem(
    CUSTOMER_STORAGE_KEY
  );

  window.dispatchEvent(
    new CustomEvent("fleetopz:data-updated")
  );
};

/* =========================================================
   OUTSTANDING AMOUNT
========================================================= */

export const getOutstandingAmount = (loan) => {
  const totalPayable =
    Number(
      loan?.calculation?.totalDue ||
        loan?.totalDue ||
        0
    );

  const paidAmount =
    Number(
      loan?.paymentHistory?.reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      ) || 0
    );

  return Math.max(
    totalPayable - paidAmount,
    0
  );
};

/* =========================================================
   VEHICLE HELPERS
========================================================= */

/**
 * Get vehicle ID from a customer record.
 */
const getVehicleIdFromRecord = (record) => {
  return (
    record?.vehicle?.id ||
    record?.vehicle?.vehicleId ||
    record?.loan?.vehicle?.id ||
    record?.loan?.vehicle?.vehicleId ||
    ""
  );
};

/**
 * Find a customer record using vehicle ID.
 */
export const getCustomerByVehicleId = (
  vehicleId
) => {
  const customers = getCustomers();

  return (
    customers.find(
      (record) =>
        getVehicleIdFromRecord(record) ===
        vehicleId
    ) || null
  );
};

/**
 * Get all vehicles from customer records.
 */
export const getVehicles = () => {
  const customers = getCustomers();

  return customers
    .filter(
      (record) =>
        record?.vehicle ||
        record?.loan?.vehicle
    )
    .map((record) => {
      const vehicle = {
        ...(record.vehicle ||
          record.loan?.vehicle ||
          {}),
      };

      const vehicleId =
        vehicle.id ||
        vehicle.vehicleId ||
        "";

      return {
        ...vehicle,

        id: vehicleId,
        vehicleId,

        status:
          vehicle.status ||
          VEHICLE_STATUS.ACTIVE,

        customerId:
          record.customer?.id || "",

        customerNumber:
          record.customer?.customerNumber || "",

        customerName:
          record.customer?.personal?.name || "",

        mobileNumber:
          record.customer?.personal?.mobileNumber ||
          "",

        loan: record.loan || {},

        outstandingAmount:
          getOutstandingAmount(
            record.loan
          ),
      };
    });
};

/**
 * Get one vehicle by vehicle ID.
 */
export const getVehicleById = (
  vehicleId
) => {
  const vehicles = getVehicles();

  return (
    vehicles.find(
      (vehicle) =>
        vehicle.id === vehicleId ||
        vehicle.vehicleId === vehicleId
    ) || null
  );
};

/**
 * Get vehicles by status.
 */
export const getVehiclesByStatus = (
  status
) => {
  return getVehicles().filter(
    (vehicle) =>
      vehicle.status === status
  );
};

/* =========================================================
   INTERNAL VEHICLE UPDATE
========================================================= */

/**
 * Update only the vehicle portion of a customer record.
 *
 * This keeps customer + loan data intact.
 */
const updateVehicleRecord = (
  vehicleId,
  vehicleUpdater
) => {
  const customers = getCustomers();

  let updatedVehicle = null;

  const updatedCustomers =
    customers.map((record) => {
      const currentVehicle =
        record?.vehicle ||
        record?.loan?.vehicle ||
        {};

      const currentVehicleId =
        currentVehicle.id ||
        currentVehicle.vehicleId ||
        "";

      if (
        currentVehicleId !== vehicleId
      ) {
        return record;
      }

      const nextVehicle =
        vehicleUpdater(
          structuredClone(currentVehicle),
          record
        );

      updatedVehicle = nextVehicle;

      return {
        ...record,

        vehicle: nextVehicle,
      };
    });

  if (!updatedVehicle) {
    return null;
  }

  saveCustomers(updatedCustomers);

  return updatedVehicle;
};

/* =========================================================
   SEIZE VEHICLE
========================================================= */

/**
 * Move vehicle:
 *
 * ACTIVE → SEIZED
 *
 * This should be called only after the
 * seizure form has been submitted.
 */
export const seizeVehicle = (
  vehicleId,
  seizureDetails = {}
) => {
  const vehicle =
    getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  if (
    vehicle.status ===
    VEHICLE_STATUS.SEIZED
  ) {
    throw new Error(
      "Vehicle is already seized."
    );
  }

  if (
    vehicle.status ===
      VEHICLE_STATUS.RELEASED ||
    vehicle.status ===
      VEHICLE_STATUS.SOLD ||
    vehicle.status ===
      VEHICLE_STATUS.PENDING_SALE
  ) {
    throw new Error(
      "Vehicle cannot be seized from its current status."
    );
  }

  const now =
    new Date().toISOString();

  return updateVehicleRecord(
    vehicleId,
    (currentVehicle) => ({
      ...currentVehicle,

      status:
        VEHICLE_STATUS.SEIZED,

      seizure: {
        ...(currentVehicle.seizure ||
          {}),

        ...seizureDetails,

        seizureDate:
          seizureDetails.seizureDate ||
          now,

        updatedAt: now,
      },

      // A newly seized vehicle
      // should not have old sale data.
      sale:
        currentVehicle.sale ||
        null,

      release:
        currentVehicle.release ||
        null,
    })
  );
};

/* =========================================================
   GET SEIZED VEHICLES
========================================================= */

export const getSeizedVehicles = () => {
  return getVehiclesByStatus(
    VEHICLE_STATUS.SEIZED
  );
};

/**
 * Get seizure details for a vehicle.
 */
export const getVehicleSeizureDetails = (
  vehicleId
) => {
  const vehicle =
    getVehicleById(vehicleId);

  return vehicle?.seizure || null;
};

/* =========================================================
   RELEASE VEHICLE
========================================================= */

/**
 * Move vehicle:
 *
 * SEIZED → RELEASED
 *
 * This should be called only after
 * the release process/form is completed.
 */
export const releaseVehicle = (
  vehicleId,
  releaseDetails = {}
) => {
  const vehicle =
    getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  if (
    vehicle.status !==
    VEHICLE_STATUS.SEIZED
  ) {
    throw new Error(
      "Only seized vehicles can be released."
    );
  }

  const now =
    new Date().toISOString();

  return updateVehicleRecord(
    vehicleId,
    (currentVehicle) => ({
      ...currentVehicle,

      status:
        VEHICLE_STATUS.RELEASED,

      release: {
        ...(currentVehicle.release ||
          {}),

        ...releaseDetails,

        releaseDate:
          releaseDetails.releaseDate ||
          now,

        updatedAt: now,
      },
    })
  );
};

/* =========================================================
   GET RELEASED VEHICLES
========================================================= */

export const getReleasedVehicles = () => {
  return getVehiclesByStatus(
    VEHICLE_STATUS.RELEASED
  );
};

/**
 * Get release details for a vehicle.
 */
export const getVehicleReleaseDetails = (
  vehicleId
) => {
  const vehicle =
    getVehicleById(vehicleId);

  return vehicle?.release || null;
};

/* =========================================================
   MOVE VEHICLE TO PENDING SALE
========================================================= */

/**
 * Move vehicle:
 *
 * SEIZED → PENDING_SALE
 *
 * IMPORTANT:
 * This does NOT complete the sale.
 *
 * It only moves the vehicle into
 * the Sold Vehicles / Pending Sale
 * workflow.
 */
export const moveVehicleToPendingSale = (
  vehicleId,
  saleDetails = {}
) => {
  const vehicle =
    getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  if (
    vehicle.status !==
    VEHICLE_STATUS.SEIZED
  ) {
    throw new Error(
      "Only seized vehicles can be moved to pending sale."
    );
  }

  const now =
    new Date().toISOString();

  return updateVehicleRecord(
    vehicleId,
    (currentVehicle) => ({
      ...currentVehicle,

      status:
        VEHICLE_STATUS.PENDING_SALE,

      sale: {
        ...(currentVehicle.sale ||
          {}),

        ...saleDetails,

        saleStatus:
          "PENDING_SALE",

        initiatedAt:
          saleDetails.initiatedAt ||
          now,

        updatedAt: now,
      },
    })
  );
};

/* =========================================================
   GET PENDING SALE VEHICLES
========================================================= */

export const getPendingSaleVehicles = () => {
  return getVehiclesByStatus(
    VEHICLE_STATUS.PENDING_SALE
  );
};

/* =========================================================
   COMPLETE VEHICLE SALE
========================================================= */

/**
 * Move vehicle:
 *
 * PENDING_SALE → SOLD
 *
 * This is the actual final sale action.
 */
export const completeVehicleSale = (
  vehicleId,
  saleDetails = {}
) => {
  const vehicle =
    getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  if (
    vehicle.status !==
    VEHICLE_STATUS.PENDING_SALE
  ) {
    throw new Error(
      "Only vehicles pending sale can be marked as sold."
    );
  }

  const now =
    new Date().toISOString();

  const salePrice =
    Number(
      saleDetails.salePrice ||
        0
    );

  const saleExpenses =
    Number(
      saleDetails.saleExpenses ||
        0
    );

  const outstandingAmount =
    Number(
      saleDetails.outstandingAmount ??
        vehicle.outstandingAmount ??
        0
    );

  const netSaleProceeds =
    Math.max(
      salePrice - saleExpenses,
      0
    );

  const deficiency =
    Math.max(
      outstandingAmount -
        netSaleProceeds,
      0
    );

  const surplus =
    Math.max(
      netSaleProceeds -
        outstandingAmount,
      0
    );

  return updateVehicleRecord(
    vehicleId,
    (currentVehicle) => ({
      ...currentVehicle,

      status:
        VEHICLE_STATUS.SOLD,

      sale: {
        ...(currentVehicle.sale ||
          {}),

        ...saleDetails,

        saleStatus: "SOLD",

        salePrice,

        saleExpenses,

        outstandingAmount,

        netSaleProceeds,

        deficiency,

        surplus,

        soldAt:
          saleDetails.soldAt ||
          now,

        updatedAt: now,
      },
    })
  );
};

/* =========================================================
   GET SOLD VEHICLES
========================================================= */

export const getSoldVehicles = () => {
  return getVehiclesByStatus(
    VEHICLE_STATUS.SOLD
  );
};

/**
 * Get sale details for a vehicle.
 */
export const getVehicleSaleDetails = (
  vehicleId
) => {
  const vehicle =
    getVehicleById(vehicleId);

  return vehicle?.sale || null;
};

/* =========================================================
   CANCEL PENDING SALE
========================================================= */

/**
 * Optional:
 *
 * PENDING_SALE → SEIZED
 *
 * Use this if the sale process is
 * cancelled before final sale.
 */
export const cancelVehicleSale = (
  vehicleId,
  reason = ""
) => {
  const vehicle =
    getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  if (
    vehicle.status !==
    VEHICLE_STATUS.PENDING_SALE
  ) {
    throw new Error(
      "Only pending-sale vehicles can have their sale cancelled."
    );
  }

  const now =
    new Date().toISOString();

  return updateVehicleRecord(
    vehicleId,
    (currentVehicle) => ({
      ...currentVehicle,

      status:
        VEHICLE_STATUS.SEIZED,

      sale: {
        ...(currentVehicle.sale ||
          {}),

        saleStatus:
          "CANCELLED",

        cancellationReason:
          reason,

        cancelledAt: now,

        updatedAt: now,
      },
    })
  );
};

/* =========================================================
   VEHICLE DASHBOARD HELPERS
========================================================= */

/**
 * Get vehicle counts by status.
 */
export const getVehicleStatusCounts = () => {
  const vehicles =
    getVehicles();

  return {
    total: vehicles.length,

    active: vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        VEHICLE_STATUS.ACTIVE
    ).length,

    seized: vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        VEHICLE_STATUS.SEIZED
    ).length,

    pendingSale: vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        VEHICLE_STATUS.PENDING_SALE
    ).length,

    released: vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        VEHICLE_STATUS.RELEASED
    ).length,

    sold: vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        VEHICLE_STATUS.SOLD
    ).length,
  };
};