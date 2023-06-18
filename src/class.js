const { appendFileSync } = require("fs");

/* The class defines an Item object with properties and methods to save the object as a CSV file. */
class Item {
  constructor(data) {
    this.Bussiness_City = data.Bussiness_City;
    this.Bussiness_Country = data.Bussiness_Country;
    this.Bussiness_Description = data.Bussiness_Description;
    this.Bussiness_Name = data.Bussiness_Name;
    this.Bussiness_StreetAddress = data.Bussiness_StreetAddress;
    this.Bussiness_Zipcode = data.Bussiness_Zipcode;
    this.Customer_Address_line1 = data.Customer_Address_line1;
    this.Customer_Address_line2 = data.Customer_Address_line2;
    this.Customer_Email = data.Customer_Email;
    this.Customer_Name = data.Customer_Name;
    this.Customer_PhoneNumber = data.Customer_PhoneNumber;
    this.Invoice_BillDetails_Name = data.Invoice_BillDetails_Name;
    this.Invoice_BillDetails_Quantity = data.Invoice_BillDetails_Quantity;
    this.Invoice_BillDetails_Rate = data.Invoice_BillDetails_Rate;
    this.Invoice_Description = data.Invoice_Description;
    this.Invoice_DueDate = data.Invoice_DueDate;
    this.Invoice_IssueDate = data.Invoice_IssueDate;
    this.Invoice_Number = data.Invoice_Number;
    this.Invoice_Tax = data.Invoice_Tax;
  }

  toString() {
    return Object.values(this).join(",");
  }

  saveAsCSV(filename) {
    const csv = this.toString() + "\n";
    try {
      appendFileSync(filename, csv);
    } catch (err) {
      console.error(err);
    }
  }
}

const header = new Item({
  Bussiness_City: "Bussiness__City",
  Bussiness_Country: "Bussiness__Country",
  Bussiness_Description: "Bussiness__Description",
  Bussiness_Name: "Bussiness__Name",
  Bussiness_StreetAddress: "Bussiness__StreetAddress",
  Bussiness_Zipcode: "Bussiness__Zipcode",
  Customer_Address_line1: "Customer__Address__line1",
  Customer_Address_line2: "Customer__Address__line2",
  Customer_Email: "Customer__Email",
  Customer_Name: "Customer__Name",
  Customer_PhoneNumber: "Customer__PhoneNumber",
  Invoice_BillDetails_Name: "Invoice__BillDetails__Name",
  Invoice_BillDetails_Quantity: "Invoice__BillDetails__Quantity",
  Invoice_BillDetails_Rate: "Invoice__BillDetails__Rate",
  Invoice_Description: "Invoice__Description",
  Invoice_DueDate: "Invoice__DueDate",
  Invoice_IssueDate: "Invoice__IssueDate",
  Invoice_Number: "Invoice__Number",
  Invoice_Tax: "Invoice__Tax",
});

module.exports = { Item, header };
