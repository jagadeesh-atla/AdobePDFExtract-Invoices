console.time("TIME src/index.js"); // Start the timer
console.log(new Date(), "\n"); // Log the current date and time

// Importing various modules and functions that are required for the script to run.
const { getItems } = require("./parser");
const { Item, header } = require("./class");
const { extract } = require("./extractor");
const { readdirSync, existsSync, unlinkSync } = require("fs");
const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const { join } = require("path");

const inputFolder = "./invoices";
const outputFolder = "./extractedData";

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
  const csvFilename = "./output/Extractedinvoices.csv";

  if (existsSync(csvFilename)) unlinkSync(csvFilename);

  header.saveAsCSV(csvFilename);

  for (const file of files) {
    try {
      const num = getNextFormattedNumber();
      const filename = join(inputFolder, file);
      const outputfile = join(outputFolder, `output${num}.json`);

      const { elements } = await extract(
        clientContext,
        extractPdfOptions,
        filename,
        outputfile,
        join("./", `/zips/requested${num}.zip`)
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

  console.timeEnd("TIME src/index.js"); // Stop the timer and log the elapsed time
  console.log(new Date(), "\n"); // Log the current date and time
}

processFiles(files);
