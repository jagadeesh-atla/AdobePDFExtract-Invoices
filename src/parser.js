const extractTextHelper = function (data, path, path2 = "/") {
  const result = [];
  data.forEach((element) => {
    if (element.Path.includes(path) && element.Text != undefined) {
      if (element.Path.includes(path2)) result.push(element.Text.trim());
    }
  });
  return result;
};

const extractBillDetailsHelper = function (data) {
  const name = extractTextHelper(data, "/Sect/Table[3]/TR", "TD/P"),
    quantity = extractTextHelper(data, "/Sect/Table[3]/TR", "TD[2]/P"),
    rate = extractTextHelper(data, "/Sect/Table[3]/TR", "TD[3]/P");

  return {
    name,
    quantity,
    rate,
  };
};

function quoteField(field) {
  if (field.includes(",") || field.includes('"')) {
    // Field contains comma or double quotes, so enclose it within double quotes and escape any existing double quotes
    return `"${field.replace(/"/g, '""')}"`;
  } else {
    // Field doesn't contain comma or double quotes, so return it as is
    return field;
  }
}

const extractBussinessDetails = function (data) {
  const [Bussiness_StreetAddress, Bussiness_City, t] = extractTextHelper(
    data,
    "/Sect/P[2]/Sub"
  )[0]
    .split(",")
    .map((el) => el.trim());

  const Bussiness_Country = quoteField(
    extractTextHelper(data, "/Sect/P[2]/Sub[2]")[0].trim()
  );

  const Bussiness_Description = extractTextHelper(data, "/Sect/P[4]")[0].trim();
  const Bussiness_Name = extractTextHelper(data, "/Sect/P")[0].trim();

  const Bussiness_Zipcode = extractTextHelper(
    data,
    "/Sect/P[2]/Sub[3]"
  )[0].trim();

  return {
    Bussiness_City,
    Bussiness_Country,
    Bussiness_Description,
    Bussiness_Name,
    Bussiness_StreetAddress,
    Bussiness_Zipcode,
  };
};

// console.log(extractBussinessDetails(data));

const extractCustomerDetails = function (data) {
  const details = extractTextHelper(data, "/Sect/P[6]");
  let Customer_Address_line1,
    Customer_Address_line2,
    Customer_Email = details[1],
    Customer_PhoneNumber,
    Customer_Name = details[0];

  if (details.length === 6) {
    Customer_Email += details[2];
    Customer_PhoneNumber = details[3];
    Customer_Address_line1 = details[4];
    Customer_Address_line2 = details[5];
  } else if (details.length === 5) {
    Customer_PhoneNumber = details[2];
    Customer_Address_line1 = details[3];
    Customer_Address_line2 = details[4];
  }

  return {
    Customer_Address_line1,
    Customer_Address_line2,
    Customer_Email,
    Customer_Name,
    Customer_PhoneNumber,
  };
};

// console.log(extractCustomerDetails(data));

const extractInvoiceDetails = function (data) {
  const Invoice_Description = extractTextHelper(
    data,
    "/Sect/Table/TR",
    "/TD/P"
  ).join(" ");

  const Invoice_DueDate = extractTextHelper(data, "/Sect/P[9]")[0]
    .split(":")[1]
    .trim();

  const Invoice_IssueDate = extractTextHelper(
    data,
    "/Sect/P[3]/Sub[3]"
  )[0].trim();

  const Invoice_Number = extractTextHelper(data, "/Sect/P[3]/Sub")[0]
    .split("#")[1]
    .trim();

  const Invoice_Tax = extractTextHelper(
    data,
    "/Sect/Table[4]/TR[2]/TD[2]/P"
  )[0].trim();

  return {
    Invoice_Description,
    Invoice_DueDate,
    Invoice_IssueDate,
    Invoice_Number,
    Invoice_Tax,
  };
};

// console.log(extractInvoiceDetails(data));

const extractBillDetails = function (data) {
  const { name, quantity, rate } = extractBillDetailsHelper(data);
  const n = name.length;
  const array = [];

  for (i = 0; i < n; i++) {
    array.push({
      Invoice_BillDetails_Name: name[i],
      Invoice_BillDetails_Quantity: quantity[i],
      Invoice_BillDetails_Rate: rate[i],
    });
  }

  return array;
};

// console.log(extractBillDetails(data));

function getItems(data) {
  const bussiness = extractBussinessDetails(data);
  const customer = extractCustomerDetails(data);
  const invoiceDetails = extractInvoiceDetails(data);
  const items = extractBillDetails(data);

  const each = [];

  items.forEach((item) => {
    each.push({
      ...bussiness,
      ...customer,
      ...item,
      ...invoiceDetails,
    });
  });

  return each;
}

// console.log(getItems(data));

module.exports = { getItems };
