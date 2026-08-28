// src/services/customerService.js

const CUSTOMER_STORAGE_KEY = "autoFinance_customers";

/*
|--------------------------------------------------------------------------
| Internal helpers
|--------------------------------------------------------------------------
*/

/**
 * Safely read customers from localStorage.
 */
const readCustomers = () => {
  try {
    const storedData = localStorage.getItem(CUSTOMER_STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);

    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error(
      "Failed to read customers from localStorage:",
      error
    );

    return [];
  }
};


/**
 * Safely write customers to localStorage.
 */
const writeCustomers = (customers) => {
  try {
    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(customers)
    );
  } catch (error) {
    console.error(
      "Failed to save customers to localStorage:",
      error
    );

    throw new Error(
      "Unable to save customer data."
    );
  }
};


/**
 * Generate a unique sequential ID.
 *
 * Customer:
 * CUS-00001
 *
 * Loan:
 * LN-00001
 */
const generateSequentialId = (
  records,
  objectPath,
  prefix
) => {
  const numbers = records
    .map((record) => {
      let value = record;

      for (const key of objectPath) {
        value = value?.[key];
      }

      if (!value || typeof value !== "string") {
        return 0;
      }

      const number = parseInt(
        value.replace(`${prefix}-`, ""),
        10
      );

      return Number.isNaN(number) ? 0 : number;
    })
    .filter((number) => number > 0);

  const highestNumber = numbers.length
    ? Math.max(...numbers)
    : 0;

  return `${prefix}-${String(
    highestNumber + 1
  ).padStart(5, "0")}`;
};


/*
|--------------------------------------------------------------------------
| Customer Read Operations
|--------------------------------------------------------------------------
*/

/**
 * Get all customers.
 */
export const getCustomers = () => {
  return readCustomers();
};


/**
 * Get one customer by Customer ID.
 */
export const getCustomerById = (customerId) => {
  const customers = readCustomers();

  return (
    customers.find(
      (record) =>
        record.customer?.id === customerId
    ) || null
  );
};


/*
|--------------------------------------------------------------------------
| Customer Create
|--------------------------------------------------------------------------
*/

/**
 * Create a new customer.
 *
 * This preserves the complete onboarding structure:
 *
 * customer
 * vehicle
 * rc
 * guarantor
 * loan
 */
export const createCustomer = (customerData) => {
  if (!customerData) {
    throw new Error(
      "Customer data is required."
    );
  }

  const customers = readCustomers();

  const now = new Date().toISOString();

  const customerId = generateSequentialId(
    customers,
    ["customer", "id"],
    "CUS"
  );

  const loanId = generateSequentialId(
    customers,
    ["loan", "id"],
    "LN"
  );


  /*
  |--------------------------------------------------------------------------
  | Customer Record
  |--------------------------------------------------------------------------
  */

  const newCustomer = {
    ...customerData,

    customer: {
      ...customerData.customer,

      id: customerId,
      customerNumber: customerId,

      createdAt:
        customerData.customer?.createdAt || now,

      updatedAt: now,

      status:
        customerData.customer?.status || "Active"
    },


    /*
    |--------------------------------------------------------------------------
    | Vehicle
    |--------------------------------------------------------------------------
    */

    vehicle: {
      ...customerData.vehicle,

      id:
        customerData.vehicle?.id ||
        `VEH-${String(customers.length + 1).padStart(5, "0")}`
    },


    /*
    |--------------------------------------------------------------------------
    | Guarantor
    |--------------------------------------------------------------------------
    */

    guarantor: {
      ...customerData.guarantor,

      hasGuarantor:
        customerData.guarantor?.hasGuarantor === true
    },


    /*
    |--------------------------------------------------------------------------
    | Loan
    |--------------------------------------------------------------------------
    */

    loan: {
      ...customerData.loan,

      id: loanId,

      loanNumber: loanId,

      status:
        customerData.loan?.status || "Active",

      createdAt:
        customerData.loan?.createdAt || now
    }
  };


  customers.push(newCustomer);

  writeCustomers(customers);

  return newCustomer;
};


/*
|--------------------------------------------------------------------------
| Customer Update
|--------------------------------------------------------------------------
*/

/**
 * Update customer information.
 *
 * This performs a deep merge for the major
 * onboarding sections so existing values are
 * not accidentally removed.
 */
export const updateCustomer = (
  customerId,
  updatedData
) => {
  const customers = readCustomers();

  const index = customers.findIndex(
    (record) =>
      record.customer?.id === customerId
  );

  if (index === -1) {
    throw new Error(
      "Customer not found."
    );
  }

  const existingCustomer =
    customers[index];

  const now = new Date().toISOString();

  const updatedCustomer = {
    ...existingCustomer,

    customer: {
      ...existingCustomer.customer,
      ...(updatedData.customer || {}),
      updatedAt: now
    },

    vehicle: {
      ...existingCustomer.vehicle,
      ...(updatedData.vehicle || {})
    },

    rc: {
      ...existingCustomer.rc,
      ...(updatedData.rc || {}),

      insurance: {
        ...existingCustomer.rc?.insurance,
        ...(updatedData.rc?.insurance || {})
      },

      endorsement: {
        ...existingCustomer.rc?.endorsement,
        ...(updatedData.rc?.endorsement || {})
      }
    },

    guarantor: {
      ...existingCustomer.guarantor,
      ...(updatedData.guarantor || {}),

      personal: {
        ...existingCustomer.guarantor?.personal,
        ...(updatedData.guarantor?.personal || {})
      },

      kyc: {
        ...existingCustomer.guarantor?.kyc,
        ...(updatedData.guarantor?.kyc || {})
      },

      documents: {
        ...existingCustomer.guarantor?.documents,
        ...(updatedData.guarantor?.documents || {})
      },

      photo: {
        ...existingCustomer.guarantor?.photo,
        ...(updatedData.guarantor?.photo || {})
      }
    },

    loan: {
      ...existingCustomer.loan,
      ...(updatedData.loan || {})
    }
  };

  customers[index] = updatedCustomer;

  writeCustomers(customers);

  return updatedCustomer;
};


/*
|--------------------------------------------------------------------------
| Customer Delete
|--------------------------------------------------------------------------
*/

/**
 * Delete a customer.
 *
 * Because the initial architecture keeps
 * customer + vehicle + guarantor + loan
 * together, deleting the customer removes
 * the complete onboarding record.
 */
export const deleteCustomer = (
  customerId
) => {
  const customers = readCustomers();

  const customerExists = customers.some(
    (record) =>
      record.customer?.id === customerId
  );

  if (!customerExists) {
    throw new Error(
      "Customer not found."
    );
  }

  const updatedCustomers =
    customers.filter(
      (record) =>
        record.customer?.id !== customerId
    );

  writeCustomers(updatedCustomers);

  return true;
};


/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

/**
 * Remove all customer data.
 *
 * Use this only during development/testing.
 */
export const clearCustomers = () => {
  localStorage.removeItem(
    CUSTOMER_STORAGE_KEY
  );
};


/**
 * Get customer count.
 */
export const getCustomerCount = () => {
  return readCustomers().length;
};