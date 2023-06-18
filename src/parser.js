function quoteField(field) {
  if (field.includes(",") || field.includes('"')) {
    // Field contains comma or double quotes, so enclose it within double quotes and escape any existing double quotes
    return `"${field.replace(/"/g, '""')}"`;
  } else {
    // Field doesn't contain comma or double quotes, so return it as is
    return field;
  }
}

const getItems = function (data) {
  const arr = [];
  data.forEach((ele) => {
    if (ele.Text != undefined) {
      arr.push(ele.Text);
    }
  });

  let dataString = arr.join("+");

  function cutAndSave(str, start, end) {
    const cut = str.substring(start, end).split("+").join("").trim();
    dataString = str.substring(end).trim();
    return cut;
  }

  const Bussiness_Name = cutAndSave(dataString, 0, 18);
  // console.log(Bussiness_Name);

  dataString = dataString.replace(Bussiness_Name, "");

  const Bussiness_StreetAddress = cutAndSave(
    dataString,
    1,
    dataString.indexOf(",")
  );
  // console.log(Bussiness_StreetAddress);

  const Bussiness_City = quoteField(
    cutAndSave(dataString, 1, dataString.indexOf(",", 2))
  );
  // console.log(Bussiness_City);

  const Bussiness_Country = quoteField(
    cutAndSave(dataString, 2, dataString.indexOf("USA") + 3)
  );
  // console.log(Bussiness_Country);

  const Bussiness_Zipcode = cutAndSave(dataString, 1, 6);
  // console.log(Bussiness_Zipcode);

  const Invoice_Number = cutAndSave(
    dataString,
    dataString.indexOf("#") + 2,
    dataString.indexOf("Issue")
  );
  // console.log(Invoice_Number);

  const Invoice_IssueDate = cutAndSave(dataString, 10, 23);
  // console.log(Invoice_IssueDate);

  const Bussiness_Description = cutAndSave(
    dataString,
    0,
    dataString.indexOf("BILL")
  );
  // console.log(Bussiness_Description);

  dataString = dataString.replace("BILL TO +", "").trim();

  const Customer_Name = cutAndSave(dataString, 0, dataString.indexOf("+"));
  // console.log(Customer_Name);

  const Customer_Email = cutAndSave(
    dataString,
    0,
    dataString.indexOf("-") - 3
  ).replace(" ", "");
  // console.log(Customer_Email);

  const Customer_PhoneNumber = cutAndSave(dataString, 0, 12);
  // console.log(Customer_PhoneNumber);

  const Customer_Address_line1 = cutAndSave(
    dataString,
    0,
    dataString.indexOf("+", 2)
  );
  // console.log(Customer_Address_line1);

  const Customer_Address_line2 = cutAndSave(
    dataString,
    0,
    dataString.indexOf("+", 2)
  );
  // console.log(Customer_Address_line2);

  const Invoice_Description = cutAndSave(
    dataString,
    8,
    dataString.indexOf("PAYMENT")
  );
  // console.log(Invoice_Description);

  const Invoice_DueDate = cutAndSave(
    dataString,
    dataString.indexOf(":") + 1,
    dataString.indexOf(":") + 12
  );
  // console.log(Invoice_DueDate);

  const Invoice_Tax = 10;
  // console.log(Invoice_Tax);

  const lastIndex = dataString.lastIndexOf("$");
  const secondToLastIndex = dataString.lastIndexOf("$", lastIndex - 1);

  const billDetails = dataString
    .trim()
    .substring(dataString.indexOf("AMOUNT") + 8, secondToLastIndex)
    .split("+");

  const extractBill = function (data = []) {
    if (data[0] == "" || data[0] == " ") {
      data.shift();
    }

    const name = [],
      quantity = [],
      rate = [];

    for (i = 0; i < data.length - 4; i += 4) {
      name.push(data[i].trim());
      quantity.push(data[i + 1].trim());
      rate.push(data[i + 2].trim());
    }

    const result = [];

    for (i = 0; i < name.length; i++) {
      result.push({
        Invoice_BillDetails_Name: name[i],
        Invoice_BillDetails_Quantity: quantity[i],
        Invoice_BillDetails_Rate: rate[i],
      });
    }

    return result;
  };

  function extractAll() {
    const bussiness = {
      Bussiness_City,
      Bussiness_Country,
      Bussiness_Description,
      Bussiness_Name,
      Bussiness_StreetAddress,
      Bussiness_Zipcode,
    };

    const customer = {
      Customer_Address_line1,
      Customer_Address_line2,
      Customer_Email,
      Customer_Name,
      Customer_PhoneNumber,
    };
    const invoiceDetails = {
      Invoice_Description,
      Invoice_DueDate,
      Invoice_IssueDate,
      Invoice_Number,
      Invoice_Tax,
    };

    const items = extractBill(billDetails);

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

  return extractAll();
};

module.exports = { getItems };
