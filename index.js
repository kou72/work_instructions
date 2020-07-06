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

    console.log(Sheet1_json);

    const output = `
Document.Open();
wait(CONNECT);
sopen(OPEN_LOOK);
sputs("mkdir test \\n");
swait(5, "$");
sputs("cd test \\n");
swait(5, "$");
sputs("touch test.txt \\n");
swait(5, "$");
sputs("ls -la \\n");
swait(5, "$");
sputs("rm test.txt \\n");
swait(5, "$");
sputs("cd ../ \\n");
swait(5, "$");
sputs("rm -r test \\n");
`;

    Dialog.showSaveDialog(
      null,
      {
        title: "保存",
        defaultPath: ".",
        filters: [{ name: "TEXTファイル", extensions: ["txt"] }],
      },
      (savedFiles) => {
        writeFile(savedFiles, output);
      }
    );
  } catch (e) {
    alert(e.message);
  }
}
