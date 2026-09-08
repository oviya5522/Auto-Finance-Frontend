const VEHICLE_SALE_STORAGE_KEY =
  "auto_finance_vehicle_sales";

const DATA_UPDATED_EVENT =
  "auto-finance:data-updated";

/* =========================================================
   READ SALES
========================================================= */

export const getVehicleSales = () => {
  try {
    const stored = localStorage.getItem(
      VEHICLE_SALE_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to read vehicle sales:",
      error
    );

    return [];
  }
};

/* =========================================================
   SAVE SALES
========================================================= */

const saveVehicleSales = (records) => {
  localStorage.setItem(
    VEHICLE_SALE_STORAGE_KEY,
    JSON.stringify(records)
  );

  window.dispatchEvent(
    new CustomEvent(
      DATA_UPDATED_EVENT
    )
  );
};

/* =========================================================
   CREATE PENDING SALE
========================================================= */

export const createVehicleSale = (
  sale
) => {
  const records =
    getVehicleSales();

  const now =
    new Date().toISOString();

  const id =
    sale?.id ||
    `SALE-${String(
      records.length + 1
    ).padStart(4, "0")}`;

  const newSale = {
    ...sale,

    id,

    status:
      sale?.status ||
      "Pending Sale",

    saleStatus:
      sale?.saleStatus ||
      "Pending Sale",

    createdAt:
      sale?.createdAt ||
      now,

    updatedAt: now,
  };

  saveVehicleSales([
    ...records,
    newSale,
  ]);

  return newSale;
};

/* =========================================================
   GET SALE BY ID
========================================================= */

export const getVehicleSaleById = (
  saleId
) => {
  return (
    getVehicleSales().find(
      (item) =>
        item?.id === saleId
    ) || null
  );
};

/* =========================================================
   FIND SALE BY VEHICLE
========================================================= */

export const getVehicleSaleByVehicleId = (
  vehicleId,
  loanId,
  loanNumber
) => {
  return (
    getVehicleSales().find(
      (item) => {
        if (
          vehicleId &&
          String(
            item?.vehicleId
          ) === String(vehicleId)
        ) {
          return true;
        }

        if (
          loanId &&
          String(
            item?.loanId
          ) === String(loanId)
        ) {
          return true;
        }

        if (
          loanNumber &&
          String(
            item?.loanNumber
          ) === String(loanNumber)
        ) {
          return true;
        }

        return false;
      }
    ) || null
  );
};

/* =========================================================
   UPDATE SALE
========================================================= */

export const updateVehicleSale = (
  saleId,
  updates
) => {
  const records =
    getVehicleSales();

  const updated =
    records.map(
      (item) =>
        item?.id === saleId
          ? {
              ...item,
              ...updates,
              updatedAt:
                new Date().toISOString(),
            }
          : item
    );

  saveVehicleSales(updated);

  return (
    updated.find(
      (item) =>
        item?.id === saleId
    ) || null
  );
};

/* =========================================================
   MARK SALE IN PROGRESS
========================================================= */

export const startVehicleSale = (
  saleId,
  saleData = {}
) => {
  return updateVehicleSale(
    saleId,
    {
      status:
        "Sale In Progress",

      saleStatus:
        "Sale In Progress",

      saleData: {
        ...saleData,
      },

      saleStartedAt:
        new Date().toISOString(),
    }
  );
};

/* =========================================================
   COMPLETE SALE
========================================================= */

export const completeVehicleSale = (
  saleId,
  saleData = {}
) => {
  return updateVehicleSale(
    saleId,
    {
      status: "Sold",

      saleStatus: "Sold",

      saleData: {
        ...saleData,
      },

      soldAt:
        new Date().toISOString(),
    }
  );
};

/* =========================================================
   CANCEL SALE
========================================================= */

export const cancelVehicleSale = (
  saleId,
  reason = ""
) => {
  return updateVehicleSale(
    saleId,
    {
      status: "Cancelled",

      saleStatus: "Cancelled",

      cancellationReason:
        reason,

      cancelledAt:
        new Date().toISOString(),
    }
  );
};

/* =========================================================
   PENDING SALES
========================================================= */

export const getPendingVehicleSales =
  () => {
    return getVehicleSales().filter(
      (item) => {
        const status =
          String(
            item?.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status ===
          "pending sale"
        );
      }
    );
  };

/* =========================================================
   SALES IN PROGRESS
========================================================= */

export const getVehicleSalesInProgress =
  () => {
    return getVehicleSales().filter(
      (item) => {
        const status =
          String(
            item?.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status ===
          "sale in progress"
        );
      }
    );
  };

/* =========================================================
   COMPLETED SALES
========================================================= */

export const getCompletedVehicleSales =
  () => {
    return getVehicleSales().filter(
      (item) => {
        const status =
          String(
            item?.status || ""
          )
            .trim()
            .toLowerCase();

        return status === "sold";
      }
    );
  };

/* =========================================================
   CANCELLED SALES
========================================================= */

export const getCancelledVehicleSales =
  () => {
    return getVehicleSales().filter(
      (item) => {
        const status =
          String(
            item?.status || ""
          )
            .trim()
            .toLowerCase();

        return (
          status ===
          "cancelled"
        );
      }
    );
  };