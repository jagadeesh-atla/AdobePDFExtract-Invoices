const AdmZip = require("adm-zip");
const { existsSync, unlinkSync, writeFileSync } = require("fs");
const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");

async function extract(
  clientContext,
  options,
  inputfile,
  outputfile,
  OUTPUT_ZIP = "ExtractTextInfoFromPDF.zip"
) {
  const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();

  try {
    const input = PDFServicesSdk.FileRef.createFromLocalFile(
      inputfile,
      PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
    );

    extractPDFOperation.setInput(input);
    extractPDFOperation.setOptions(options);

    const result = await extractPDFOperation.execute(clientContext);

    //Remove if the output already exists.
    if (existsSync(OUTPUT_ZIP)) unlinkSync(OUTPUT_ZIP);

    await result.saveAsFile(OUTPUT_ZIP);

    const zip = new AdmZip(OUTPUT_ZIP);
    const jsondata = zip.readAsText("structuredData.json");

    const data = JSON.parse(jsondata);
    writeFileSync(outputfile, JSON.stringify(data, null, 4), "utf8");

    console.log(
      "Successfully extracted information and saved into " + outputfile
    );

    return data;
  } catch (err) {
    console.log("Exception encountered while executing operation", err);
    throw err; // Rethrow the error to be caught in the caller
  }
}

module.exports = { extract };
