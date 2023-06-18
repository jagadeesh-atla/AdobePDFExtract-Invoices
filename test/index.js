console.time("START");

const { getItems } = require("../src/parser.js");
const { Item, header } = require("../src/class.js");
const { extract } = require("../src/extractor.js");
const { readdirSync, existsSync, unlinkSync } = require("fs");
const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const { join } = require("path");

const inputFolder = "./test/invoices";
const outputFolder = "./test/extractedData";

let counter = 0;

/**
 * Returns a formatted number with leading zeros and increments the counter.
 * @param {number} [numberOf=2] - The length of the formatted number.
 * @returns {string} - The formatted number with leading zeros.
 */
function getNextFormattedNumber(numberOf = 2) {
  const formattedNumber = counter.toString().padStart(numberOf, "0");
  counter++;
  return formattedNumber;
}

const files = readdirSync(inputFolder);
console.log(files);

const credentials =
  PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
    .fromFile("pdfservices-api-credentials.json")
    .build();

const clientConfig = PDFServicesSdk.ClientConfig.clientConfigBuilder()
  .withConnectTimeout(15000)
  .withReadTimeout(15000)
  .build();

const clientContext = PDFServicesSdk.ExecutionContext.create(
  credentials,
  clientConfig
);

const extractPdfOptions =
  new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
    .addElementsToExtract(
      PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT
    )
    .build();

/**
 * Processes a list of files by extracting data from them and saving the extracted data as JSON and CSV files.
 * @param {string[]} files - An array of file names to be processed.
 */
async function processFiles(files) {
  const csvFilename = "./test/output/Extractedinvoices.csv";
  if (existsSync(csvFilename)) unlinkSync(csvFilename);

  header.saveAsCSV(csvFilename);

  for (const file of files) {
    try {
      const num = getNextFormattedNumber(0);
      const filename = join(inputFolder, file);
      const outputfile = join(outputFolder, `output${num}.json`);
      const { elements } = await extract(
        clientContext,
        extractPdfOptions,
        filename,
        outputfile,
        join("./test", `/zips/requested${num}.zip`)
      );

      const items = getItems(elements);

      items.forEach((item) => {
        const csvItem = new Item(item);
        csvItem.saveAsCSV(csvFilename);
      });
    } catch (error) {
      console.error("Error processing file:", error);
    }
  }
}

processFiles(files);

console.timeEnd("START");
