// Bounding boxs of customer details and Invoice description
const [CustomerBox, DeatilsBox] = [
  [81, 485, 122, 577],
  [240, 501, 405, 577],
];

/**
 * Finds objects within a given bounding box.
 * @param {Array} data - Array of objects with 'Bounds' property.
 * @param {Array} box - Bounding box coordinates [xMin, yMin, xMax, yMax].
 * @returns {Array} - Array of objects within the bounding box.
 */
const findObjectsWithinBox = function (data = [], box = []) {
  const objectsWithinBox = [];
  for (const obj of data) {
    if (obj.Bounds != null || obj.Bounds != undefined) {
      const objXMin = obj.Bounds[0];
      const objYMin = obj.Bounds[1];
      const objXMax = obj.Bounds[2];
      const objYMax = obj.Bounds[3];

      if (
        objXMin >= box[0] &&
        objXMax <= box[2] &&
        objYMin >= box[1] &&
        objYMax <= box[3]
      ) {
        objectsWithinBox.push(obj);
      } else if (
        ((objXMin < box[2] && objXMax > box[0]) ||
          (objXMax > box[0] && objXMin < box[2])) &&
        ((objYMin < box[3] && objYMax > box[1]) ||
          (objYMax > box[1] && objYMin < box[3]))
      ) {
        objectsWithinBox.push(obj);
      }
    }
  }
  return objectsWithinBox;
};

/**
 * Extracts the text from an array of objects.
 * @param {Array} data - Array of objects with 'Text' property.
 * @returns {string} - Concatenated text from the objects.
 */
function findObjectstext(data = []) {
  let result = "";
  for (const ele of data) {
    const text = ele.Text;
    if (text != undefined || text != null) {
      result += text;
    }
  }
  return result;
}

/**
 * Quotes a field if it contains special characters (comma or double quote).
 * @param {string} field - Field value to be quoted if necessary.
 * @returns {string} - Quoted or unquoted field value.
 */
function quoteField(field = "") {
  if (field.includes(",") || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  } else {
    return field;
  }
}

/**
 * Extracts the bill details from an array of data.
 * @param {Array} data - Array of data containing bill details.
 * @returns {Array} - Array of bill details objects.
 */
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

/**
 * Parses the data array and extracts invoice information.
 * @param {Array} data - Array of data containing invoice information.
 * @returns {Array} - Array of objects containing invoice details.
 */
const getItems = function (data = []) {
  const arr = [];
  data.forEach((ele) => {
    if (ele.Text != undefined) {
      arr.push(ele.Text);
    }
  });

  let dataString = arr.join("+");

  /**
   * Cuts a portion of a string based on start and end indices, removes any "+" characters, and returns the cut portion.
   * @param {string} str - The string that needs to be cut and saved.
   * @param {number} start - The starting index of the substring to be cut from the original string.
   * @param {number} end - The ending index position (exclusive) in the string where the cutting should stop.
   * @returns {string} - The cut portion of the string from the start index to the end index, with any "+" characters removed and leading/trailing whitespace trimmed.
   */

  function cutAndSave(str, start, end) {
    const cut = str.substring(start, end).split("+").join("").trim();
    dataString = str.substring(end).trim();
    return cut;
  }

  const Bussiness_Name = cutAndSave(dataString, 0, 18);

  dataString = dataString.replace(Bussiness_Name, "");

  const Bussiness_StreetAddress = cutAndSave(
    dataString,
    1,
    dataString.indexOf(",")
  );

  const Bussiness_City = quoteField(
    cutAndSave(dataString, 1, dataString.indexOf(",", 2))
  );

  const Bussiness_Country = quoteField(
    cutAndSave(dataString, 2, dataString.indexOf("USA") + 3)
  );

  const Bussiness_Zipcode = cutAndSave(dataString, 1, 6);

  const Invoice_Number = cutAndSave(
    dataString,
    dataString.indexOf("#") + 2,
    dataString.indexOf("Issue")
  );

  const Invoice_IssueDate = cutAndSave(dataString, 10, 23);

  const Bussiness_Description = cutAndSave(
    dataString,
    0,
    dataString.indexOf("BILL")
  );

  let text = findObjectstext(findObjectsWithinBox(data, CustomerBox)).trim();

  if (text.includes("BILL TO")) text = text.replace("BILL TO", "").trim();

  const fullNameRegex = /^[A-Za-z]+\s+[A-Za-z]+/;
  const Customer_Name = text.match(fullNameRegex)[0].trim();
  text = text.replace(Customer_Name, "").trim();

  const Customer_Email = text
    .substring(0, text.indexOf("-") - 3)
    .trim()
    .split(" ")
    .join("");

  const phoneRegex = /\d{3}-\d{3}-\d{4}/;
  const Customer_PhoneNumber = text.match(phoneRegex)[0];

  text = text.substring(text.indexOf("-") + 9).trim();

  const idx = text.indexOf("Total");
  if (idx != -1) text = text.substring(0, idx).trim();

  const words = text.split(" ");
  const Customer_Address_line1 = words.slice(0, 3).join(" ");
  const Customer_Address_line2 = words.slice(3).join(" ");

  let line = findObjectstext(findObjectsWithinBox(data, DeatilsBox)).trim();

  if (line.includes("DETAILS")) line = line.replace("DETAILS", "").trim();

  if (line.indexOf("Total") != -1)
    line = line.substring(0, line.indexOf("Total")).trim();
  const Invoice_Description = line;

  const date_regex = /\d{2}-\d{2}-\d{4}/;
  const Invoice_DueDate = dataString.match(date_regex)[0];
  dataString = dataString.replace(Invoice_DueDate, "");

  const Invoice_Tax = "10";

  const lastIndex = dataString.lastIndexOf("$");
  const secondToLastIndex = dataString.lastIndexOf("$", lastIndex - 1);
  const billDetails = dataString
    .trim()
    .substring(dataString.indexOf("AMOUNT") + 8, secondToLastIndex)
    .split("+");

  /**
   * The function extracts details from a bill and combines them with business, customer, and invoice
   * details to create an array of objects.
   * @returns an array of objects, where each object contains information about a bill, including
   * details about the business, customer, invoice, and items.
   */
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
