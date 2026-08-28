// src/services/customerStorage.js

const CUSTOMER_STORAGE_KEY = "fleetopz_customers";

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

export const getLoans = () => {
  const customers = getCustomers();

  return customers
    .filter((item) => item.loan)
    .map((item) => ({
      ...item.loan,

      customerId:
        item.customer?.id || "",

      customerNumber:
        item.customer?.customerNumber || "",

      customerName:
        item.customer?.personal?.name || "",

      mobileNumber:
        item.customer?.personal?.mobileNumber || "",

      vehicle: item.vehicle || {},
    }));
};

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
export const getOutstandingAmount = (loan) => {
  const totalPayable =
    Number(
      loan?.calculation?.totalDue ||
      loan?.totalDue ||
      0
    );

  const paidAmount =
    Number(
      loan?.paymentHistory
        ?.reduce(
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