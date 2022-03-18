import fs from "fs";
import xml from "xml-js";
let readAllFileInFolder = (dirname) => {
  let data = [];
  return new Promise((resolve, rej) => {
    fs.readdir(dirname, function (err, filenames) {
      if (err) {
        rej(err);
        return;
      }
      filenames.map((filename, i) => {
        data.push(filename);
        if (i == filenames.length - 1) {
          resolve(data);
        }
      });
    });
  });
};
let getAllXMLFileInFolder = (path) => {
  let data = [];
  return new Promise((resolve, rej) => {
    fs.readdir(path, function (err, filenames) {
      if (err) {
        rej(err);
        return;
      }
      filenames.map((filename, i) => {
        data.push(filename);
        if (i == filenames.length - 1) {
          resolve(data.filter((x) => x.split(".")[1] == "xml"));
        }
      });
    });
  });
};
let readAndParseXML = (file, otherFIlter = []) => {
  return new Promise((resolve, rej) => {
    fs.readFile(file, function (err, data) {
      if (err) {
        rej(err);
        return;
      }
      let json = xml.xml2js(data, { compact: true, spaces: 4 });
      let arrayData =
        json.Workbook.Worksheet.length > 0
          ? json.Workbook.Worksheet[0]
          : json.Workbook.Worksheet;
      data = arrayData.Table.Row.map((x) => x.Cell)
        .map((x) => {
          
          if (x && x[0] && x[0].Data) {
            return x[0].Data._text;
          }
        })
        .filter(
          (x) =>
            x &&
            x.length > 0 &&
            !["NA", "Disponibilité", "Valeur", ...otherFIlter].includes(x)
        );

      resolve(data);
    });
  });
};

let doTheWork = (imgFolder, xmlFile, nameOfFileToExport) => {
  readAndParseXML(xmlFile).then((files) => {
    
    readAllFileInFolder(imgFolder).then((allData) => {
      
      allData = allData.map((x) => x.split(".")[0]);
      let noExistingFIles = files
        .filter((x) => !allData.includes(x))
        .join("\n");
      
      fs.writeFile("./" + nameOfFileToExport, noExistingFIles, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
  });
};

// ------------------------------- test -------------------------- //
let finishJOB = (xmlFolder, imgFolder) => {
  getAllXMLFileInFolder(xmlFolder).then((data) => {
    data.map((file) =>
      doTheWork(imgFolder, xmlFolder + "/" + file, file.split(".")[0] + ".txt")
    );
  });
};

finishJOB("C:/Git/EW2-Custom/Bernier/Tabl", "C:/Git/EW2-Custom/Bernier/Imgs");
