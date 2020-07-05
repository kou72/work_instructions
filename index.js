const remote = require("electron").remote;
const Dialog = remote.dialog;
const fs = require("fs");
const xlsx = require("xlsx");
const utils = xlsx.utils;
const { exec } = require("child_process");

// 画面ロード時に読み込む
function PageLoad(evt) {
  const drop = document.getElementById("drop");
  const readf = document.getElementById("readf");
  const run = document.getElementById("run");
  drop.addEventListener("dragover", handleDragOver, false);
  drop.addEventListener("drop", handleFileSelect, false);
  readf.addEventListener("click", handleFileClick, false);
  run.addEventListener("click", () => {
    exec("rlogin /entry testServer /script test.txt", (err, stdout, stderr) => {
      if (err) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    console.log("run");
  });
}

//ドラッグしたファイルが「ドラッグ＆ドロップ」エリアにある時
function handleDragOver(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  // 動作をコピーに限定する
  evt.dataTransfer.dropEffect = "copy";
}

// 選択したファイルをドロップした時
function handleFileSelect(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  const files = evt.dataTransfer.files;
  if (files.length !== 1) {
    alert("１つのファイルのみ選択できます");
  } else if (!files[0].name.match(/xls(x|m)$/)) {
    alert("拡張子が「xlsxかxlsm」のファイルのみ選択できます");
  } else {
    createJsonFile(files[0].path);
  }
}

//ファイル選択ダイアログ表示
function handleFileClick() {
  Dialog.showOpenDialog(
    null,
    {
      properties: ["openFile"],
      title: "ファイル(単独選択)",
      defaultPath: ".",
      filters: [{ name: "XCELEファイル", extensions: ["xlsx", "xlsm"] }],
    },
    (filePath) => {
      createJsonFile(filePath[0]);
    }
  );
}

//ファイル保存ダイアログ表示
function writeFile(path, data) {
  fs.writeFile(path, data, (error) => {
    if (error != null) {
      alert("save error");
      return;
    }
  });
}

function createJsonFile(filePath) {
  try {
    if (typeof arguments[0] === "undefined") {
      throw new Error("ファイル選択をキャンセルしました");
    }
    const dataExcel = (book = xlsx.readFile(filePath)); //ファイル読み込み
    const sheet_name_list = dataExcel.SheetNames;
    const Sheet1 = dataExcel.Sheets[sheet_name_list[0]];
    const Sheet1_json = utils.sheet_to_json(Sheet1);
    let errorMessage = "";

    const keysMap = {
      code: "カテゴリコード",
      title: "カテゴリ名",
      flag: "非表示フラグ",
      order: "表示順",
      hierarchy: "カテゴリ階層",
      hier1: "第1階層カテゴリコード",
      hier2: "第2階層カテゴリコード",
      hier3: "第3階層カテゴリコード",
      hier4: "第4階層カテゴリコード",
      hier5: "第5階層カテゴリコード",
    };
    const flag = Sheet1_json.some((item, index) => {
      if (typeof item[keysMap.code] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.code}が空白です。`;
        return true;
      }
      if (typeof item[keysMap.title] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.title}が空白です。`;
        return true;
      }
      if (typeof item[keysMap.flag] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.flag}が空白です。`;
        return true;
      }
      if (typeof item[keysMap.order] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.order}が空白です。`;
        return true;
      }
      if (typeof item[keysMap.hierarchy] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.hierarchy}が空白です。`;
        return true;
      }
      if (item[keysMap.hierarchy] === 1 && typeof item[keysMap.hier1] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.hier1}が空白です。`;
        return true;
      }
      if (item[keysMap.hierarchy] === 2 && typeof item[keysMap.hier2] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.hier2}が空白です。`;
        return true;
      }
      if (item[keysMap.hierarchy] === 3 && typeof item[keysMap.hier3] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.hier3}が空白です。`;
        return true;
      }
      if (item[keysMap.hierarchy] === 4 && typeof item[keysMap.hier4] === "undefined") {
        errorMessage += `${index + 2}行目の${keysMap.hier4}が空白です。`;
        return true;
      }
    });
    if (flag) {
      throw new Error(errorMessage);
    }
    function pushObject(obj) {
      const cateObj = {
        code: obj[keysMap.code] + "",
        title: obj[keysMap.title],
        flag: obj[keysMap.flag] + "",
        order: obj[keysMap.order] + "",
      };

      if (obj[keysMap.code] + "" === obj[keysMap.hier2] + "") {
        cateObj["hier1"] = obj[keysMap.hier1] + "";
      }
      if (obj[keysMap.code] + "" === obj[keysMap.hier3] + "") {
        cateObj["hier2"] = obj[keysMap.hier2] + "";
      }
      if (obj[keysMap.code] + "" === obj[keysMap.hier4] + "") {
        cateObj["hier3"] = obj[keysMap.hier3] + "";
      }
      if (obj[keysMap.code] + "" === obj[keysMap.hier5] + "") {
        cateObj["hier4"] = obj[keysMap.hier4] + "";
      }
      return cateObj;
    }
    const category1 = Sheet1_json.filter((item) => item["カテゴリ階層"] === 1).map((item) => {
      return pushObject(item);
    });
    const category2 = Sheet1_json.filter((item) => item["カテゴリ階層"] === 2).map((item) => {
      return pushObject(item);
    });
    const category3 = Sheet1_json.filter((item) => item["カテゴリ階層"] === 3).map((item) => {
      return pushObject(item);
    });
    const category4 = Sheet1_json.filter((item) => item["カテゴリ階層"] === 4).map((item) => {
      return pushObject(item);
    });
    const category5 = Sheet1_json.filter((item) => item["カテゴリ階層"] === 5).map((item) => {
      return pushObject(item);
    });
    const resultarray = category1.map((item) => {
      let cate2 = [];
      category2.forEach((item2) => {
        if (item["code"] == item2["hier1"]) {
          cate2.push(item2);
          delete item2["hier1"];
          item.child = cate2;
          let cate3 = [];
          category3.forEach((item3) => {
            if (item2["code"] === item3["hier2"]) {
              cate3.push(item3);
              delete item3["hier2"];
              item2.child = cate3;
              let cate4 = [];
              category4.forEach((item4) => {
                if (item3["code"] === item4["hier3"]) {
                  cate4.push(item4);
                  delete item4["hier3"];
                  item3.child = cate4;
                  let cate5 = [];
                  category5.forEach((item5) => {
                    if (item4["code"] === item5["hier4"]) {
                      cate5.push(item5);
                      delete item5["hier4"];
                      item4.child = cate5;
                    }
                  }); //end loop 5cate
                }
              }); //end loop 4cate
            }
          }); //end loop 3cate
        }
      }); // end loop 2cate
      return item;
    });
    const dataJSON = JSON.stringify(resultarray, undefined, 4);
    // 改行と空白を整える
    const output = dataJSON
      .replace(/:\s+/g, ":")
      .replace(/("code":"[a-zA-Z]?\d.*?",)\n+\s+("title":".*?",)\n+\s+("flag":"\d{1}",)\n+\s+("order":"\d.*",)/g, "$1$2$3$4")
      .replace(
        /({)\s+("code":"[a-zA-Z]?\d.*?",)\n+\s+("title":".*?",)\n+\s+("flag":"\d{1}",)\n+\s+("order":"\d.*")\n+\s+(})/g,
        "$1 $2$3$4$5 $6"
      );

    Dialog.showSaveDialog(
      null,
      {
        title: "保存",
        defaultPath: ".",
        filters: [{ name: "JSONファイル", extensions: ["json"] }],
      },
      (savedFiles) => {
        writeFile(savedFiles, output);
      }
    );
  } catch (e) {
    alert(e.message);
  }
}
