console.time("TIME src/index.js : ");
console.log(new Date(), "\n\n");

const { getItems } = require("./parser");
const { Item, header } = require("./class");
const { extract } = require("./extractor");
const { readdirSync, existsSync, unlinkSync } = require("fs");
const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
const { join } = require("path");

const inputFolder = "./invoices";
const outputFolder = "./extractedData";

let counter = 0;

function getNextFormattedNumber(numberOf = 2) {
  const formattedNumber = counter.toString().padStart(numberOf, "0");
  counter++;
  return formattedNumber;
}

const files = readdirSync(inputFolder);
console.log(files);

// Initial setup, create credentials instance.
const credentials =
  PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
    .fromFile("pdfservices-api-credentials.json")
    .build();

// Setting Configuration for Connection and Read Timeouts
const clientConfig = PDFServicesSdk.ClientConfig.clientConfigBuilder()
  .withConnectTimeout(15000)
  .withReadTimeout(15000)
  .build();

// Create an ExecutionContext using credentials
const clientContext = PDFServicesSdk.ExecutionContext.create(
  credentials,
  clientConfig
);

// Build extractPDF options
const options =
  new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
    .addElementsToExtract(
      PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT
    )
    .build();

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
        options,
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

  console.timeEnd("TIME src/index.js : ");
  console.log(new Date(), "\n\n");
}

processFiles(files);
