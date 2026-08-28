// src/context/CustomerContext.jsx

import { createContext, useContext, useEffect, useState } from "react";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";


// Create Context
const CustomerContext = createContext(null);


// Provider
export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);


  // Load customers when the application starts
  useEffect(() => {
    loadCustomers();
  }, []);


  // Get all customers
  const loadCustomers = () => {
    try {
      setLoading(true);

      const data = getCustomers();

      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };


  // Add new customer
  const addCustomer = (customerData) => {
    try {
      const newCustomer = createCustomer(customerData);

      setCustomers((previousCustomers) => [
        ...previousCustomers,
        newCustomer,
      ]);

      return newCustomer;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  };


  // Get customer by ID
  const findCustomer = (customerId) => {
    return getCustomerById(customerId);
  };


  // Update customer
  const editCustomer = (customerId, updatedData) => {
    try {
      const updatedCustomer = updateCustomer(
        customerId,
        updatedData
      );

      setCustomers((previousCustomers) =>
        previousCustomers.map((customer) =>
          customer.customer?.id === customerId
            ? updatedCustomer
            : customer
        )
      );

      return updatedCustomer;
    } catch (error) {
      console.error("Error editing customer:", error);
      throw error;
    }
  };


  // Delete customer
  const removeCustomer = (customerId) => {
    try {
      deleteCustomer(customerId);

      setCustomers((previousCustomers) =>
        previousCustomers.filter(
          (customer) => customer.customer?.id !== customerId
        )
      );
    } catch (error) {
      console.error("Error removing customer:", error);
      throw error;
    }
  };


  // Context values available throughout the application
  const value = {
    customers,
    loading,

    addCustomer,
    findCustomer,
    editCustomer,
    removeCustomer,

    refreshCustomers: loadCustomers,
  };


  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};


// Custom hook
export const useCustomers = () => {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error(
      "useCustomers must be used inside CustomerProvider"
    );
  }

  return context;
};