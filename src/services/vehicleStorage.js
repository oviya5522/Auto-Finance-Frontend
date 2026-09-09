// src/services/vehicleStorage.js

import {
  getCustomers,
  saveCustomers,
  VEHICLE_STATUS,
} from "./customerStorage";

/* =========================================================
   STORAGE
========================================================= */

const VEHICLE_STORAGE_KEY =
  "auto_finance_vehicle_records";

const DATA_UPDATED_EVENT =
  "auto-finance:data-updated";

/* =========================================================
   STATUS
========================================================= */

export const VEHICLE_LIFECYCLE_STATUS = {
  ACTIVE: "Active",
  SEIZED: "Seized",
  RELEASED: "Released",
  PENDING_SALE: "Pending Sale",
  SOLD: "Sold",
};

/* =========================================================
   UTILITIES
========================================================= */

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const nowIso = () =>
  new Date().toISOString();

const dispatchUpdate = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      DATA_UPDATED_EVENT
    )
  );
};

const generateId = (
  prefix,
  records = []
) => {
  const highestNumber =
    records.reduce(
      (max, record) => {
        const rawId =
          String(
            record?.id || ""
          );

        const match =
          rawId.match(
            new RegExp(
              `^${prefix}-(\\d+)$`
            )
          );

        if (!match) {
          return max;
        }

        return Math.max(
          max,
          Number(match[1])
        );
      },
      0
    );

  return `${prefix}-${String(
    highestNumber + 1
  ).padStart(4, "0")}`;
};

/* =========================================================
   READ MASTER VEHICLE RECORDS
========================================================= */

export const getVehicleRecords = () => {
  try {
    const stored =
      localStorage.getItem(
        VEHICLE_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to read vehicle records:",
      error
    );

    return [];
  }
};

/* =========================================================
   SAVE MASTER VEHICLE RECORDS
========================================================= */

const saveVehicleRecords = (
  records
) => {
  localStorage.setItem(
    VEHICLE_STORAGE_KEY,
    JSON.stringify(records)
  );

  dispatchUpdate();
};

/* =========================================================
   OUTSTANDING
========================================================= */

const getOutstandingFromLoan = (
  loan
) => {
  const totalDue =
    Number(
      loan?.calculation?.totalDue ||
        loan?.totalDue ||
        0
    );

  const paid =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory.reduce(
          (sum, payment) =>
            sum +
            Number(
              payment?.amount || 0
            ),
          0
        )
      : 0;

  return Math.max(
    totalDue - paid,
    0
  );
};

/* =========================================================
   BUILD VEHICLE RECORD
========================================================= */

const buildVehicleRecord = (
  customerRecord
) => {
  if (!customerRecord) {
    return null;
  }

  const customer =
    customerRecord?.customer ||
    {};

  const loan =
    customerRecord?.loan ||
    {};

  const vehicle =
    customerRecord?.vehicle ||
    loan?.vehicle ||
    {};

  const rc =
    customerRecord?.rc ||
    loan?.rc ||
    {};

  const vehicleId =
    vehicle?.vehicleId ||
    vehicle?.id ||
    loan?.vehicleId ||
    loan?.vehicle?.vehicleId ||
    loan?.vehicle?.id ||
    "";

  if (!vehicleId) {
    return null;
  }

  const rawStatus =
    normalize(
      vehicle?.status
    );

  let lifecycleStatus =
    VEHICLE_LIFECYCLE_STATUS.ACTIVE;

  if (
    rawStatus === "seized"
  ) {
    lifecycleStatus =
      VEHICLE_LIFECYCLE_STATUS.SEIZED;
  } else if (
    rawStatus === "released"
  ) {
    lifecycleStatus =
      VEHICLE_LIFECYCLE_STATUS.RELEASED;
  } else if (
    rawStatus === "pending sale"
  ) {
    lifecycleStatus =
      VEHICLE_LIFECYCLE_STATUS.PENDING_SALE;
  } else if (
    rawStatus === "sold"
  ) {
    lifecycleStatus =
      VEHICLE_LIFECYCLE_STATUS.SOLD;
  }

  return {
    id: vehicleId,

    vehicleId,

    customerId:
      customer?.id || "",

    customerNumber:
      customer?.customerNumber || "",

    customerName:
      customer?.personal?.name ||
      "",

    mobileNumber:
      customer?.personal?.mobileNumber ||
      "",

    brand:
      vehicle?.brand || "",

    model:
      vehicle?.model || "",

    variant:
      vehicle?.variant || "",

    vehicleType:
      vehicle?.vehicleType || "",

    fuelType:
      vehicle?.fuelType || "",

    colour:
      vehicle?.colour ||
      vehicle?.color ||
      "",

    manufacturingYear:
      vehicle?.manufacturingYear ||
      "",

    vehicleValue:
      Number(
        vehicle?.vehicleValue ||
          0
      ),

    registrationNumber:
      rc?.registrationNumber ||
      vehicle?.registrationNumber ||
      loan?.registrationNumber ||
      loan?.rc
        ?.registrationNumber ||
      "",

    rc: {
      ...rc,
    },

    loanId:
      loan?.id || "",

    loanNumber:
      loan?.loanNumber || "",

    loanAmount:
      Number(
        loan?.loanAmount ||
          loan?.vehicleAmount ||
          loan?.calculation
            ?.loanAmount ||
          0
      ),

    outstandingAmount:
      getOutstandingFromLoan(
        loan
      ),

    loanStatus:
      loan?.status ||
      "Active",

    status:
      lifecycleStatus,

    /*
     * Lifecycle history.
     */
    seizure:
      null,

    release:
      null,

    sale:
      null,

    createdAt:
      customerRecord?.createdAt ||
      nowIso(),

    updatedAt:
      customerRecord?.updatedAt ||
      nowIso(),
  };
};

/* =========================================================
   SYNC MASTER VEHICLES FROM CUSTOMERS
========================================================= */

export const syncVehiclesFromCustomers =
  () => {
    const customers =
      getCustomers();

    const existing =
      getVehicleRecords();

    const existingMap =
      new Map(
        existing.map(
          (vehicle) => [
            String(
              vehicle?.vehicleId ||
                vehicle?.id ||
                ""
            ),
            vehicle,
          ]
        )
      );

    customers.forEach(
      (customerRecord) => {
        const base =
          buildVehicleRecord(
            customerRecord
          );

        if (!base) {
          return;
        }

        const key =
          String(
            base.vehicleId
          );

        const previous =
          existingMap.get(
            key
          );

        if (previous) {
          existingMap.set(
            key,
            {
              ...base,

              /*
               * NEVER overwrite lifecycle state
               * from customer storage once it has
               * been explicitly changed.
               */
              status:
                previous.status ||
                base.status,

              seizure:
                previous.seizure ||
                null,

              release:
                previous.release ||
                null,

              sale:
                previous.sale ||
                null,

              createdAt:
                previous.createdAt ||
                base.createdAt,

              updatedAt:
                previous.updatedAt ||
                base.updatedAt,
            }
          );
        } else {
          existingMap.set(
            key,
            base
          );
        }
      }
    );

    const records =
      Array.from(
        existingMap.values()
      );

    saveVehicleRecords(
      records
    );

    return records;
  };

/* =========================================================
   GET ALL VEHICLES
========================================================= */

export const getVehicles = () => {
  const records = getVehicleRecords();

  if (records.length) {
    return records;
  }

  return syncVehiclesFromCustomers();
};

/* =========================================================
   GET ONE VEHICLE
========================================================= */

export const getVehicleById = (
  vehicleId
) => {
  const records =
    getVehicles();

  return (
    records.find(
      (vehicle) =>
        String(
          vehicle?.vehicleId ||
            vehicle?.id ||
            ""
        ) ===
        String(
          vehicleId || ""
        )
    ) || null
  );
};

/* =========================================================
   FIND VEHICLE BY IDENTIFIERS
========================================================= */

export const getVehicleByIdentifiers = (
  vehicleId,
  loanId,
  loanNumber
) => {
  const records = getVehicleRecords();

  const normalizedVehicleId =
    String(vehicleId || "").trim();

  const normalizedLoanId =
    String(loanId || "").trim();

  const normalizedLoanNumber =
    String(loanNumber || "").trim();

  /* =====================================================
     FIRST: MASTER VEHICLE STORAGE
  ====================================================== */

  const masterVehicle =
    records.find((vehicle) => {
      const currentVehicleId =
        String(
          vehicle?.vehicleId ||
            vehicle?.id ||
            ""
        ).trim();

      const currentLoanId =
        String(
          vehicle?.loanId ||
            ""
        ).trim();

      const currentLoanNumber =
        String(
          vehicle?.loanNumber ||
            ""
        ).trim();

      return (
        (
          normalizedVehicleId &&
          currentVehicleId ===
            normalizedVehicleId
        ) ||
        (
          normalizedLoanId &&
          currentLoanId ===
            normalizedLoanId
        ) ||
        (
          normalizedLoanNumber &&
          currentLoanNumber ===
            normalizedLoanNumber
        )
      );
    }) || null;

  if (masterVehicle) {
    return masterVehicle;
  }

  /* =====================================================
     FALLBACK: CUSTOMER STORAGE
     
     IMPORTANT:
     Do NOT call syncVehiclesFromCustomers()
     here. That would dispatch another update event
     and can cause React render loops.
  ====================================================== */

  const customers =
    getCustomers();

  const customerRecord =
    customers.find((record) => {
      const vehicle =
        record?.vehicle ||
        record?.loan?.vehicle ||
        {};

      const loan =
        record?.loan ||
        {};

      const currentVehicleId =
        String(
          vehicle?.vehicleId ||
            vehicle?.id ||
            loan?.vehicleId ||
            ""
        ).trim();

      const currentLoanId =
        String(
          loan?.id ||
            ""
        ).trim();

      const currentLoanNumber =
        String(
          loan?.loanNumber ||
            ""
        ).trim();

      return (
        (
          normalizedVehicleId &&
          currentVehicleId ===
            normalizedVehicleId
        ) ||
        (
          normalizedLoanId &&
          currentLoanId ===
            normalizedLoanId
        ) ||
        (
          normalizedLoanNumber &&
          currentLoanNumber ===
            normalizedLoanNumber
        )
      );
    }) || null;

  if (!customerRecord) {
    return null;
  }

  /* =====================================================
     BUILD VEHICLE OBJECT FROM CUSTOMER STORAGE
  ====================================================== */

  const vehicle =
    customerRecord?.vehicle ||
    customerRecord?.loan?.vehicle ||
    {};

  const loan =
    customerRecord?.loan ||
    {};

  const customer =
    customerRecord?.customer ||
    {};

  const resolvedVehicleId =
    vehicle?.vehicleId ||
    vehicle?.id ||
    loan?.vehicleId ||
    "";

  return {
    ...vehicle,

    id:
      resolvedVehicleId,

    vehicleId:
      resolvedVehicleId,

    customerId:
      customer?.id ||
      "",

    customerName:
      customer?.personal?.name ||
      "",

    mobileNumber:
      customer?.personal?.mobileNumber ||
      "",

    loanId:
      loan?.id ||
      "",

    loanNumber:
      loan?.loanNumber ||
      "",

    loanAmount:
      Number(
        loan?.loanAmount ||
          loan?.vehicleAmount ||
          loan?.calculation?.loanAmount ||
          0
      ),

    outstandingAmount:
      getOutstandingFromLoan(
        loan
      ),

    loanStatus:
      loan?.status ||
      "Active",

    status:
      vehicle?.status ||
      VEHICLE_LIFECYCLE_STATUS.ACTIVE,

    seizure:
      null,

    sale:
      null,

    release:
      null,
  };
};
/* =========================================================
   UPDATE VEHICLE
========================================================= */

export const updateVehicle = (
  vehicleId,
  updates = {}
) => {
  const records =
    getVehicles();

  let result = null;

  const updated =
    records.map(
      (vehicle) => {
        const currentId =
          vehicle?.vehicleId ||
          vehicle?.id ||
          "";

        if (
          String(
            currentId
          ) !==
          String(
            vehicleId
          )
        ) {
          return vehicle;
        }

        result = {
          ...vehicle,
          ...updates,
          updatedAt:
            nowIso(),
        };

        return result;
      }
    );

  if (!result) {
    return null;
  }

  saveVehicleRecords(
    updated
  );

  return result;
};

/* =========================================================
   SYNC STATUS TO CUSTOMER STORAGE
========================================================= */

/* =========================================================
   SYNC STATUS TO CUSTOMER STORAGE
========================================================= */

const syncStatusToCustomer = (
  vehicle,
  status,
  lifecycleData = {}
) => {
  try {
    const customers = getCustomers();

    const vehicleId =
      vehicle?.vehicleId ||
      vehicle?.id ||
      "";

    const loanId =
      vehicle?.loanId ||
      "";

    const loanNumber =
      vehicle?.loanNumber ||
      "";

    const normalizedStatus =
      normalize(status);

    const currentTime =
      lifecycleData?.updatedAt ||
      nowIso();

    let changed = false;

    const updatedCustomers =
      customers.map((record) => {
        const loan =
          record?.loan || {};

        const storedVehicle =
          record?.vehicle ||
          loan?.vehicle ||
          {};

        const storedVehicleId =
          storedVehicle?.vehicleId ||
          storedVehicle?.id ||
          "";

        const matchesVehicle =
          String(storedVehicleId) ===
          String(vehicleId);

        const matchesLoan =
          Boolean(loanId) &&
          String(loan?.id || "") ===
          String(loanId);

        const matchesLoanNumber =
          Boolean(loanNumber) &&
          String(
            loan?.loanNumber || ""
          ) ===
          String(loanNumber);

        if (
          !matchesVehicle &&
          !matchesLoan &&
          !matchesLoanNumber
        ) {
          return record;
        }

        changed = true;

        /* =================================================
           SEIZED
        ================================================== */

        if (
          normalizedStatus ===
          normalize(
            VEHICLE_LIFECYCLE_STATUS.SEIZED
          )
        ) {
          const nextVehicle = {
            ...(record?.vehicle || {}),
            ...(loan?.vehicle || {}),

            status:
              VEHICLE_LIFECYCLE_STATUS.SEIZED,

            seizedAt:
              lifecycleData?.seizedAt ||
              currentTime,
          };

          const nextLoan = {
            ...loan,

            /*
             * Keep the loan active.
             * Seizing the vehicle does NOT mean
             * the loan is foreclosed.
             */
            vehicle:
              nextVehicle,

            updatedAt:
              currentTime,
          };

          return {
            ...record,

            vehicle:
              nextVehicle,

            loan:
              nextLoan,

            updatedAt:
              currentTime,
          };
        }

        /* =================================================
           RELEASED
        ================================================== */

        if (
          normalizedStatus ===
          normalize(
            VEHICLE_LIFECYCLE_STATUS.RELEASED
          )
        ) {
          const nextVehicle = {
            ...(record?.vehicle || {}),
            ...(loan?.vehicle || {}),

            status:
              VEHICLE_LIFECYCLE_STATUS.RELEASED,

            releasedAt:
              lifecycleData?.releasedAt ||
              currentTime,

            releasedBy:
              lifecycleData?.releasedBy ||
              "Admin",
          };

          const nextLoan = {
            ...loan,

            vehicle:
              nextVehicle,

            updatedAt:
              currentTime,
          };

          return {
            ...record,

            vehicle:
              nextVehicle,

            loan:
              nextLoan,

            updatedAt:
              currentTime,
          };
        }

        /* =================================================
           PENDING SALE
        ================================================== */

        if (
          normalizedStatus ===
          normalize(
            VEHICLE_LIFECYCLE_STATUS.PENDING_SALE
          )
        ) {
          const nextVehicle = {
            ...(record?.vehicle || {}),
            ...(loan?.vehicle || {}),

            status:
              VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,

            saleStartedAt:
              lifecycleData?.saleStartedAt ||
              currentTime,
          };

          const nextLoan = {
            ...loan,

            vehicle:
              nextVehicle,

            updatedAt:
              currentTime,
          };

          return {
            ...record,

            vehicle:
              nextVehicle,

            loan:
              nextLoan,

            updatedAt:
              currentTime,
          };
        }

        /* =================================================
           SOLD
        ================================================== */

        if (
          normalizedStatus ===
          normalize(
            VEHICLE_LIFECYCLE_STATUS.SOLD
          )
        ) {
          const soldAt =
            lifecycleData?.soldAt ||
            currentTime;

          const nextVehicle = {
            ...(record?.vehicle || {}),
            ...(loan?.vehicle || {}),

            status:
              VEHICLE_LIFECYCLE_STATUS.SOLD,

            soldAt,
          };

          const nextLoan = {
            ...loan,

            /*
             * Final loan state after vehicle sale.
             */
            status:
              "Foreclosed",

            loanStatus:
              "FORECLOSED",

            foreclosureStatus:
              "FORECLOSED",

            foreclosureDate:
              soldAt,

            foreclosedAt:
              soldAt,

            foreclosureReason:
              "Vehicle sold/auctioned after default and seizure.",

            nextDueDate:
              null,

            nextDueAmount:
              0,

            vehicle:
              nextVehicle,

            updatedAt:
              currentTime,
          };

          return {
            ...record,

            vehicle:
              nextVehicle,

            loan:
              nextLoan,

            updatedAt:
              currentTime,
          };
        }

        /* =================================================
           ACTIVE / FALLBACK
        ================================================== */

        const nextVehicle = {
          ...(record?.vehicle || {}),
          ...(loan?.vehicle || {}),

          status:
            status ||
            VEHICLE_LIFECYCLE_STATUS.ACTIVE,
        };

        const nextLoan = {
          ...loan,

          vehicle:
            nextVehicle,

          updatedAt:
            currentTime,
        };

        return {
          ...record,

          vehicle:
            nextVehicle,

          loan:
            nextLoan,

          updatedAt:
            currentTime,
        };
      });

    if (changed) {
      saveCustomers(
        updatedCustomers
      );
    }

    return changed;
  } catch (error) {
    console.error(
      "Failed to sync vehicle status to customer storage:",
      error
    );

    return false;
  }
};

/* =========================================================
   SEIZE VEHICLE
========================================================= */

export const addVehicleSeizure = (
  seizure = {}
) => {
  const vehicle =
    getVehicleByIdentifiers(
      seizure?.vehicleId,
      seizure?.loanId,
      seizure?.loanNumber
    );

  if (!vehicle) {
    throw new Error(
      "Vehicle not found."
    );
  }

  const currentStatus =
    normalize(
      vehicle.status
    );

  if (
    currentStatus ===
    "seized"
  ) {
    throw new Error(
      "Vehicle is already seized."
    );
  }

  if (
    currentStatus ===
    "sold"
  ) {
    throw new Error(
      "Sold vehicle cannot be seized."
    );
  }

  if (
    currentStatus ===
    "pending sale"
  ) {
    throw new Error(
      "Pending Sale vehicle cannot be seized."
    );
  }

  const now =
    nowIso();

  const records =
    getVehicles();

  const seizureId =
    seizure?.id ||
    generateId(
      "SEIZE",
      records.map(
        (item) => ({
          id:
            item?.seizure
              ?.id,
        })
      )
    );

  const seizureRecord =
    {
      id:
        seizureId,

      vehicleId:
        vehicle.vehicleId,

      registrationNumber:
        vehicle.registrationNumber,

      vehicleName:
        seizure?.vehicleName ||
        [
          vehicle.brand,
          vehicle.model,
          vehicle.variant,
        ]
          .filter(Boolean)
          .join(" ") ||
        "Vehicle",

      vehicleType:
        seizure?.vehicleType ||
        vehicle.vehicleType ||
        "",

      customerId:
        vehicle.customerId,

      customerName:
        vehicle.customerName,

      loanId:
        vehicle.loanId,

      loanNumber:
        vehicle.loanNumber,

      loanAmount:
        Number(
          seizure?.loanAmount ??
            vehicle.loanAmount ??
            0
        ),

      outstandingAmount:
        Number(
          seizure?.outstandingAmount ??
            vehicle.outstandingAmount ??
            0
        ),

      principalOutstanding:
        Number(
          seizure?.principalOutstanding ??
            0
        ),

      interestOutstanding:
        Number(
          seizure?.interestOutstanding ??
            0
        ),

      reason:
        seizure?.reason || "",

      remarks:
        seizure?.remarks || "",

      attachment:
        seizure?.attachment ||
        null,

      seizedAt:
        seizure?.seizedAt ||
        now,

      seizedBy:
        seizure?.seizedBy ||
        seizure?.createdBy ||
        "Admin",

      createdAt:
        seizure?.createdAt ||
        now,

      updatedAt:
        now,
    };

  const updated =
    records.map(
      (item) => {
        const currentId =
          item?.vehicleId ||
          item?.id ||
          "";

        if (
          String(
            currentId
          ) !==
          String(
            vehicle.vehicleId
          )
        ) {
          return item;
        }

        return {
          ...item,

          status:
            VEHICLE_LIFECYCLE_STATUS.SEIZED,

          seizure:
            seizureRecord,

          /*
           * New seizure starts a new cycle.
           */
          release:
            null,

          sale:
            null,

          updatedAt:
            now,
        };
      }
    );

  saveVehicleRecords(
    updated
  );

  /*
   * Mirror status to customer/loan.
   */
  syncStatusToCustomer(
    vehicle,
    VEHICLE_LIFECYCLE_STATUS.SEIZED,
    {
      seizedAt:
        seizureRecord.seizedAt,
    }
  );

  return seizureRecord;
};

/* =========================================================
   ALL LIFECYCLE / SEIZURE RECORDS
========================================================= */

/*
 * IMPORTANT:
 *
 * This function intentionally returns ALL lifecycle
 * records, not just currently seized vehicles.
 *
 * This is what allows:
 *
 * SEIZED -> RELEASED
 * SEIZED -> PENDING SALE
 * PENDING SALE -> SOLD
 *
 * to remain visible in their respective pages.
 */

export const getVehicleSeizures =
  () => {
    return getVehicles()
      .filter(
        (vehicle) =>
          Boolean(
            vehicle?.seizure
          )
      )
      .map(
        (vehicle) => ({
          ...(vehicle?.seizure ||
            {}),

          /*
           * Always expose current identifiers.
           */
          vehicleId:
            vehicle.vehicleId,

          registrationNumber:
            vehicle.registrationNumber,

          customerId:
            vehicle.customerId,

          customerName:
            vehicle.customerName,

          loanId:
            vehicle.loanId,

          loanNumber:
            vehicle.loanNumber,

          vehicleName:
            vehicle.seizure
              ?.vehicleName ||
            [
              vehicle.brand,
              vehicle.model,
              vehicle.variant,
            ]
              .filter(Boolean)
              .join(" ") ||
            "Vehicle",

          vehicleType:
            vehicle.seizure
              ?.vehicleType ||
            vehicle.vehicleType ||
            "",

          loanAmount:
            Number(
              vehicle.seizure
                ?.loanAmount ??
                vehicle.loanAmount ??
                0
            ),

          outstandingAmount:
            Number(
              vehicle.seizure
                ?.outstandingAmount ??
                vehicle.outstandingAmount ??
                0
            ),

          seizedAt:
            vehicle.seizure
              ?.seizedAt ||
            "",

          seizedBy:
            vehicle.seizure
              ?.seizedBy ||
            "Admin",

          reason:
            vehicle.seizure
              ?.reason ||
            "",

          remarks:
            vehicle.seizure
              ?.remarks ||
            "",

          attachment:
            vehicle.seizure
              ?.attachment ||
            null,

          /*
           * Current lifecycle status.
           */
          status:
            vehicle.status,

          /*
           * Lifecycle containers.
           */
          seizure:
            vehicle.seizure ||
            null,

          release:
            vehicle.release ||
            null,

          sale:
            vehicle.sale ||
            null,

          vehicle:
            vehicle,
        })
      );
  };

/* =========================================================
   GET SEIZURE BY ID
========================================================= */

/*
 * IMPORTANT:
 *
 * Searches ALL lifecycle records.
 * Therefore a released/pending/sold record
 * can still be found by its original seizure ID.
 */

export const getVehicleSeizureById = (
  seizureId
) => {
  return (
    getVehicleSeizures().find(
      (record) =>
        String(
          record?.id || ""
        ) ===
        String(
          seizureId || ""
        )
    ) || null
  );
};

/* =========================================================
   GET LIFECYCLE BY VEHICLE ID
========================================================= */

export const getVehicleSeizureByVehicleId =
  (
    vehicleId,
    loanId,
    loanNumber
  ) => {
    return (
      getVehicleSeizures().find(
        (record) => {
          if (
            vehicleId &&
            String(
              record?.vehicleId ||
                ""
            ) ===
              String(
                vehicleId
              )
          ) {
            return true;
          }

          if (
            loanId &&
            String(
              record?.loanId ||
                ""
            ) ===
              String(
                loanId
              )
          ) {
            return true;
          }

          if (
            loanNumber &&
            String(
              record?.loanNumber ||
                ""
            ) ===
              String(
                loanNumber
              )
          ) {
            return true;
          }

          return false;
        }
      ) || null
    );
  };

/* =========================================================
   RELEASE VEHICLE
========================================================= */

/*
 * SEIZED -> RELEASED
 *
 * The original seizure record is NOT deleted.
 * Instead the vehicle lifecycle status changes
 * and release information is stored.
 */

export const releaseVehicleSeizure =
  (
    seizureId,
    releasedBy = "Admin",
    remarks = ""
  ) => {
    const seizure =
      getVehicleSeizureById(
        seizureId
      );

    if (!seizure) {
      console.error(
        "Seizure record not found."
      );

      return null;
    }

    const vehicle =
      getVehicleById(
        seizure.vehicleId
      );

    if (!vehicle) {
      console.error(
        "Vehicle record not found."
      );

      return null;
    }

    /*
     * Only currently seized vehicles
     * can be released.
     */
    if (
      normalize(
        vehicle.status
      ) !== "seized"
    ) {
      console.error(
        "Only seized vehicles can be released."
      );

      return null;
    }

    const now =
      nowIso();

    const release = {
      releaseStatus:
        VEHICLE_LIFECYCLE_STATUS.RELEASED,

      releasedAt:
        now,

      releasedBy:
        releasedBy ||
        "Admin",

      remarks:
        remarks || "",

      updatedAt:
        now,
    };

    /*
     * Preserve the original seizure information
     * and add the release container.
     */
    const updated =
      updateVehicle(
        vehicle.vehicleId,
        {
          status:
            VEHICLE_LIFECYCLE_STATUS.RELEASED,

          release,

          /*
           * Keep seizure history.
           */
          seizure:
            vehicle.seizure ||
            seizure,

          updatedAt:
            now,
        }
      );

    if (!updated) {
      console.error(
        "Failed to update vehicle lifecycle."
      );

      return null;
    }

    /*
     * Mirror Released status into customer/loan.
     */
    syncStatusToCustomer(
      updated,
      VEHICLE_LIFECYCLE_STATUS.RELEASED,
      {
        releasedAt:
          release.releasedAt,

        releasedBy:
          release.releasedBy,
      }
    );

    /*
     * Return a complete lifecycle record.
     */
    return {
      ...seizure,

      ...updated,

      status:
        VEHICLE_LIFECYCLE_STATUS.RELEASED,

      seizure:
        updated.seizure ||
        seizure,

      release,

      sale:
        updated.sale ||
        null,

      vehicle:
        updated,
    };
  };

/* =========================================================
   MOVE TO PENDING SALE
========================================================= */

/*
 * SEIZED -> PENDING SALE
 */

export const markVehicleForSale =
  (
    seizureId,
    saleData = {}
  ) => {
    const seizure =
      getVehicleSeizureById(
        seizureId
      );

    if (!seizure) {
      console.error(
        "Seizure record not found."
      );

      return null;
    }

    const vehicle =
      getVehicleById(
        seizure.vehicleId
      );

    if (!vehicle) {
      console.error(
        "Vehicle record not found."
      );

      return null;
    }

    if (
      normalize(
        vehicle.status
      ) !== "seized"
    ) {
      console.error(
        "Only seized vehicles can move to Pending Sale."
      );

      return null;
    }

    const now =
      nowIso();

    const sale = {
      ...(vehicle.sale ||
        {}),

      ...(saleData || {}),

      saleStatus:
        VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,

      initiatedAt:
        saleData?.initiatedAt ||
        now,

      updatedAt:
        now,
    };

    const updated =
      updateVehicle(
        vehicle.vehicleId,
        {
          status:
            VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,

          sale,

          /*
           * Preserve original seizure.
           */
          seizure:
            vehicle.seizure ||
            seizure,
        }
      );

    if (!updated) {
      return null;
    }

    syncStatusToCustomer(
      updated,
      VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,
      {
        saleStartedAt:
          sale.initiatedAt,
      }
    );

    return {
      ...updated,

      seizure:
        updated.seizure ||
        seizure,

      sale,
    };
  };

/* =========================================================
   DIRECT MOVE TO PENDING SALE
========================================================= */

export const moveVehicleToPendingSale =
  (
    vehicleId,
    saleDetails = {}
  ) => {
    const vehicle =
      getVehicleById(
        vehicleId
      );

    if (!vehicle) {
      return null;
    }

    if (
      normalize(
        vehicle.status
      ) !== "seized"
    ) {
      return null;
    }

    const now =
      nowIso();

    const sale = {
      ...(vehicle.sale ||
        {}),

      ...(saleDetails || {}),

      saleStatus:
        VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,

      initiatedAt:
        saleDetails?.initiatedAt ||
        now,

      updatedAt:
        now,
    };

    const updated =
      updateVehicle(
        vehicle.vehicleId,
        {
          status:
            VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,

          sale,
        }
      );

    if (!updated) {
      return null;
    }

    syncStatusToCustomer(
      updated,
      VEHICLE_LIFECYCLE_STATUS.PENDING_SALE,
      {
        saleStartedAt:
          sale.initiatedAt,
      }
    );

    return updated;
  };

/* =========================================================
   COMPLETE SALE
========================================================= */

/*
 * PENDING SALE -> SOLD
 */

/* =========================================================
   COMPLETE VEHICLE SALE
========================================================= */

export const completeVehicleSale = (
  vehicleId,
  saleDetails = {}
) => {
  const records = getVehicles();

  /*
   * First try normal vehicle ID lookup.
   */
  let vehicle =
    records.find(
      (item) =>
        String(
          item?.vehicleId ||
            item?.id ||
            ""
        ) ===
        String(vehicleId || "")
    ) || null;

  /*
   * Compatibility:
   * If the caller accidentally sends a seizure/lifecycle
   * record ID, try resolving it from the stored lifecycle data.
   */
  if (!vehicle) {
    vehicle =
      records.find(
        (item) =>
          String(
            item?.seizure?.id || ""
          ) ===
            String(vehicleId || "") ||
          String(
            item?.sale?.id || ""
          ) ===
            String(vehicleId || "")
      ) || null;
  }

  if (!vehicle) {
    throw new Error(
      "Vehicle sale record not found."
    );
  }

  /*
   * The vehicle must currently be in Pending Sale.
   */
  if (
    normalize(
      vehicle?.status
    ) !==
    normalize(
      VEHICLE_LIFECYCLE_STATUS.PENDING_SALE
    )
  ) {
    throw new Error(
      `Only vehicles pending sale can be marked as sold. Current status: ${
        vehicle?.status || "Unknown"
      }`
    );
  }

  const now =
    nowIso();

  const salePrice =
    Number(
      saleDetails?.salePrice || 0
    );

  const saleExpenses =
    Number(
      saleDetails?.saleExpenses || 0
    );

  const outstandingAmount =
    Number(
      saleDetails?.outstandingAmount ??
        vehicle?.outstandingAmount ??
        0
    );

  const netSaleProceeds =
    Math.max(
      salePrice -
        saleExpenses,
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

  const soldAt =
    saleDetails?.soldAt ||
    now;

  const sale = {
    ...(vehicle?.sale || {}),

    ...saleDetails,

    saleStatus:
      VEHICLE_LIFECYCLE_STATUS.SOLD,

    salePrice,

    saleExpenses,

    outstandingAmount,

    netSaleProceeds,

    deficiency,

    surplus,

    soldAt,

    updatedAt:
      now,
  };

  /*
   * =======================================================
   * 1. VEHICLE
   *
   * PENDING SALE → SOLD
   * =======================================================
   */

  const updatedVehicle =
    updateVehicle(
      vehicle.vehicleId,
      {
        status:
          VEHICLE_LIFECYCLE_STATUS.SOLD,

        sale,

        updatedAt:
          now,
      }
    );

  if (!updatedVehicle) {
    throw new Error(
      "Unable to update vehicle sale status."
    );
  }

  /*
   * =======================================================
   * 2. CUSTOMER / LOAN
   *
   * Mark related loan as FORECLOSED.
   *
   * This is different from normal completion:
   *
   * Normal payment:
   * ACTIVE → CLOSED
   *
   * Default + seizure + sale:
   * ACTIVE/OVERDUE → SEIZED → SOLD
   * and loan → FORECLOSED
   * =======================================================
   */

  const customers =
    getCustomers();

  const updatedCustomers =
    customers.map(
      (record) => {
        const loan =
          record?.loan || {};

        const storedVehicle =
          record?.vehicle ||
          loan?.vehicle ||
          {};

        const storedVehicleId =
          storedVehicle?.vehicleId ||
          storedVehicle?.id ||
          "";

        const matchesVehicle =
          String(
            storedVehicleId
          ) ===
          String(
            vehicle?.vehicleId || ""
          );

        const matchesLoan =
          vehicle?.loanId &&
          String(
            loan?.id || ""
          ) ===
          String(
            vehicle.loanId
          );

        const matchesLoanNumber =
          vehicle?.loanNumber &&
          String(
            loan?.loanNumber || ""
          ) ===
          String(
            vehicle.loanNumber
          );

        if (
          !matchesVehicle &&
          !matchesLoan &&
          !matchesLoanNumber
        ) {
          return record;
        }

        /*
         * Keep vehicle information synchronized
         * in BOTH record.vehicle and loan.vehicle.
         */
        const nextVehicle = {
          ...(record?.vehicle || {}),
          ...(loan?.vehicle || {}),

          status:
            VEHICLE_LIFECYCLE_STATUS.SOLD,

          soldAt,
        };

        const nextLoan = {
          ...loan,

          /*
           * FINAL LOAN STATUS
           */
          status:
            "Foreclosed",

          foreclosureStatus:
            "Foreclosed",

          foreclosedAt:
            now,

          foreclosureReason:
            "Vehicle sold after seizure.",

          updatedAt:
            now,

          vehicle:
            nextVehicle,
        };

        return {
          ...record,

          vehicle:
            nextVehicle,

          loan:
            nextLoan,

          updatedAt:
            now,
        };
      }
    );

  saveCustomers(
    updatedCustomers
  );

  /*
   * =======================================================
   * 3. FINAL VEHICLE/CUSTOMER SYNC
   * =======================================================
   */

  syncStatusToCustomer(
    updatedVehicle,
    VEHICLE_LIFECYCLE_STATUS.SOLD,
    {
      soldAt,
    }
  );

  return {
    ...updatedVehicle,
    sale,
  };
};

/* =========================================================
   CANCEL SALE
========================================================= */

/*
 * PENDING SALE -> SEIZED
 */

export const cancelVehicleSale =
  (
    vehicleId,
    reason = ""
  ) => {
    const vehicle =
      getVehicleById(
        vehicleId
      );

    if (!vehicle) {
      return null;
    }

    if (
      normalize(
        vehicle.status
      ) !==
      "pending sale"
    ) {
      return null;
    }

    const now =
      nowIso();

    const sale = {
      ...(vehicle.sale ||
        {}),

      saleStatus:
        "Cancelled",

      cancellationReason:
        reason || "",

      cancelledAt:
        now,

      updatedAt:
        now,
    };

    const updated =
      updateVehicle(
        vehicle.vehicleId,
        {
          status:
            VEHICLE_LIFECYCLE_STATUS.SEIZED,

          sale,
        }
      );

    if (!updated) {
      return null;
    }

    syncStatusToCustomer(
      updated,
      VEHICLE_LIFECYCLE_STATUS.SEIZED
    );

    return updated;
  };

/* =========================================================
   STATUS LISTS
========================================================= */

export const getSeizedVehicles =
  () =>
    getVehicles().filter(
      (vehicle) =>
        normalize(
          vehicle?.status
        ) === "seized"
    );

export const getPendingSaleVehicles =
  () =>
    getVehicles().filter(
      (vehicle) =>
        normalize(
          vehicle?.status
        ) ===
        "pending sale"
    );

export const getReleasedVehicles =
  () =>
    getVehicles().filter(
      (vehicle) =>
        normalize(
          vehicle?.status
        ) === "released"
    );

export const getSoldVehicles =
  () =>
    getVehicles().filter(
      (vehicle) =>
        normalize(
          vehicle?.status
        ) === "sold"
    );

/* =========================================================
   DETAILS
========================================================= */

export const getVehicleSeizureDetails =
  (
    vehicleId
  ) => {
    const vehicle =
      getVehicleById(
        vehicleId
      );

    return (
      vehicle?.seizure ||
      null
    );
  };

export const getVehicleReleaseDetails =
  (
    vehicleId
  ) => {
    const vehicle =
      getVehicleById(
        vehicleId
      );

    return (
      vehicle?.release ||
      null
    );
  };

export const getVehicleSaleDetails =
  (
    vehicleId
  ) => {
    const vehicle =
      getVehicleById(
        vehicleId
      );

    return (
      vehicle?.sale ||
      null
    );
  };

/* =========================================================
   CURRENT LIFECYCLE
========================================================= */

export const getCurrentVehicleLifecycle =
  (
    vehicleId,
    loanId,
    loanNumber
  ) => {
    return (
      getVehicleByIdentifiers(
        vehicleId,
        loanId,
        loanNumber
      ) || null
    );
  };

/* =========================================================
   STATUS COUNTS
========================================================= */

export const getVehicleStatusCounts =
  () => {
    const vehicles =
      getVehicles();

    return {
      total:
        vehicles.length,

      active:
        vehicles.filter(
          (vehicle) =>
            normalize(
              vehicle?.status
            ) === "active"
        ).length,

      seized:
        vehicles.filter(
          (vehicle) =>
            normalize(
              vehicle?.status
            ) === "seized"
        ).length,

      pendingSale:
        vehicles.filter(
          (vehicle) =>
            normalize(
              vehicle?.status
            ) ===
            "pending sale"
        ).length,

      released:
        vehicles.filter(
          (vehicle) =>
            normalize(
              vehicle?.status
            ) === "released"
        ).length,

      sold:
        vehicles.filter(
          (vehicle) =>
            normalize(
              vehicle?.status
            ) === "sold"
        ).length,
    };
  };

/* =========================================================
   LEGACY COMPATIBILITY
========================================================= */

export const updateVehicleSeizure =
  (
    seizureId,
    updates = {}
  ) => {
    const seizure =
      getVehicleSeizureById(
        seizureId
      );

    if (!seizure) {
      return null;
    }

    const vehicle =
      getVehicleById(
        seizure.vehicleId
      );

    if (!vehicle) {
      return null;
    }

    const nextVehicle =
      updateVehicle(
        vehicle.vehicleId,
        {
          ...updates,

          status:
            updates?.status ||
            vehicle.status,

          seizure:
            updates?.seizure ??
            vehicle.seizure,

          release:
            updates?.release ??
            vehicle.release,

          sale:
            updates?.sale ??
            vehicle.sale,
        }
      );

    if (!nextVehicle) {
      return null;
    }

    /*
     * Mirror status if an explicit status change
     * happened through this compatibility API.
     */
    if (updates?.status) {
      syncStatusToCustomer(
        nextVehicle,
        updates.status,
        updates
      );
    }

    return {
      ...seizure,

      ...nextVehicle,

      vehicleId:
        nextVehicle.vehicleId,

      status:
        nextVehicle.status,

      seizure:
        nextVehicle.seizure,

      release:
        nextVehicle.release,

      sale:
        nextVehicle.sale,

      vehicle:
        nextVehicle,
    };
  };

export const syncVehicleStatusToCustomers =
  (
    vehicleRecord
  ) => {
    if (!vehicleRecord) {
      return false;
    }

    return syncStatusToCustomer(
      vehicleRecord,
      vehicleRecord.status ||
        VEHICLE_LIFECYCLE_STATUS.ACTIVE
    );
  };