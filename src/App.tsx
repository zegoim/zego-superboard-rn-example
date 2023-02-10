import * as React from "react";
import { useEffect, useRef } from "react";

import { StyleSheet, View, Text, findNodeHandle, Button, Platform } from "react-native";
// 导入
import ZegoExpressEngine from "zego-express-engine-whiteboard-reactnative";
import ZegoSuperBoardManager, {
  ZegoSuperBoardCustomConfigKey,
  ZegoSuperBoardRenderType,
  ZegoSuperBoardSubView,
  ZegoSuperBoardRenderView,
  ZegoSuperBoardTool,
} from "zego-superboard-reactnative";
import DocumentPicker, {
  DirectoryPickerResponse,
  DocumentPickerResponse,
  isInProgress,
} from "react-native-document-picker";

import { userInfo } from "./config";

console.log('userInfo:',userInfo)
if(userInfo.appSign === 'YOUR_APP_SIGN'){
  console.error('Please fill in your appid and appsgin!')
}
const profile = {
  appID: userInfo.appID,
  appSign: userInfo.appSign,
  scenario: 0, // 采用通用场景
};

const superboardConfig = {
  appID: userInfo.appID,
  appSign: userInfo.appSign,
  userID: "222test222111",
};

let engine: ZegoExpressEngine;
let superboardManager: ZegoSuperBoardManager;

export default function App() {
  let currentView: ZegoSuperBoardSubView | null;
  const refContainer = useRef(null);
  let currentUniqueId: string;

  const handleError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      console.warn("cancelled");
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn(
        "multiple pickers were opened, only the last will be considered"
      );
    } else {
      throw err;
    }
  };

  async function initRTC() {
    engine = await ZegoExpressEngine.createEngineWithProfile(profile);
    console.log("rtc ver:", await engine.getVersion());
  }

  async function initRTCEvent() {
    engine.on(
      "roomStateUpdate",
      async (roomID, state, errorCode, extendedData) => {
        console.log("roomStateUpdate:", roomID, state, errorCode, extendedData);
      }
    );
  }

  async function initSuperboardEvent() {
    superboardManager.on("error", (res) => {
      console.log("superboard error callback", res);
    });
    superboardManager.on(
      "remoteSuperBoardSubViewAdded",
      (
        name: any,
        createTime: any,
        fileID: any,
        fileType: any,
        uniqueID: any,
        whiteboardIDList: any
      ) => {
        console.log(
          "superboard remoteSuperBoardSubViewAdded callback",
          "name:",
          name,
          "createTime:",
          createTime,
          "fileID:",
          fileID,
          "fileType:",
          fileType,
          "uniqueID:",
          uniqueID,
          whiteboardIDList
        );
      }
    );

    superboardManager.on("remoteSuperBoardSubViewRemoved", (res) => {
      console.log("superboard remoteSuperBoardSubViewRemoved callback", res);
    });
    superboardManager.on("remoteSuperBoardSubViewSwitched", (res) => {
      console.log("superboard remoteSuperBoardSubViewSwitched callback", res);
      getCurrentView();
      currentUniqueId = res;
    });
    superboardManager.on(
      "scrollChange",
      (
        name: any,
        createTime: any,
        fileID: any,
        fileType: any,
        uniqueID: any,
        whiteboardIDList: any,
        currentPage: number,
        pageCount: number
      ) => {
        console.log(
          "superboard scrollChange callback",
          "name:",
          name,
          "createTime:",
          createTime,
          "fileID:",
          fileID,
          "fileType:",
          fileType,
          "uniqueID:",
          uniqueID,
          "whiteboardIDList:",
          whiteboardIDList,
          "currentPage:",
          currentPage,
          "pageCount:",
          pageCount
        );
      }
    );
    superboardManager.on(
      "cacheFile",
      (
        state: number,
        errorCode: number,
        seq: number,
        percent: number,
        fileID: string
      ) => {
        console.log(
          "superboard cacheFile callback",
          "state:",
          state,
          "errorCode:",
          errorCode,
          "seq:",
          seq,
          "percent:",
          percent,
          "fileID:",
          fileID
        );
      }
    );
    superboardManager.on(
      "uploadFile",
      (
        state: number,
        errorCode: number,
        seq: number,
        upload_percent: number,
        fileID: string
      ) => {
        console.log(
          "superboard uploadFile callback",
          "state:",
          state,
          "errorCode:",
          errorCode,
          "seq:",
          seq,
          "upload_percent:",
          upload_percent,
          "fileID:",
          fileID
        );
      }
    );
    superboardManager.on(
      "uploadH5File",
      (
        state: number,
        errorCode: number,
        seq: number,
        upload_percent: number,
        fileID: string
      ) => {
        console.log(
          "superboard uploadFile callback",
          "state:",
          state,
          "errorCode:",
          errorCode,
          "seq:",
          seq,
          "upload_percent:",
          upload_percent,
          "fileID:",
          fileID
        );
      }
    );
  }

  async function offSuperBoardEvent() {
    superboardManager.off("remoteSuperBoardSubViewAdded");
    superboardManager.off("scrollChange");
  }

  async function loginRoom() {
    const login_res = await engine.loginRoom("8989", {
      userID: "test123123123123",
      userName: "superboardrn user",
    });
    console.log("login_res", login_res);
  }

  async function initSuperboad(this: any) {
    const superboard_init_res = await ZegoSuperBoardManager.init(
      superboardConfig
    );
    console.log("init=", superboard_init_res);
    superboardManager = ZegoSuperBoardManager.getInstance();
    const super_ver = await superboardManager.getSDKVersion();
    console.log("superboard version:", super_ver);
    await ZegoSuperBoardManager.setContainerView({
      reactTag: findNodeHandle(refContainer.current),
    });
    await setConfig();
  }

  async function setConfig() {
    await superboardManager.enableCustomCursor(true);
    await superboardManager.enableRemoteCursorVisible(true);
    await superboardManager.enableResponseScale(true);
    await superboardManager.enableSyncScale(false);
    await superboardManager.setCustomizedConfig(
      ZegoSuperBoardCustomConfigKey.ThumbnailMode,
      "1"
    );
    console.log(
      "isEnabledCustomCursor",
      await superboardManager.isEnabledCustomCursor()
    );
    console.log(
      "isEnabledRemoteCursorVisible",
      await superboardManager.isEnabledRemoteCursorVisible()
    );
    console.log(
      "isEnableResponseScale",
      await superboardManager.isEnabledResponseScale()
    );
    console.log(
      "isEnableSyncScale",
      await superboardManager.isEnabledSyncScale()
    );
    console.log(
      "ZegoSuperBoardCustomConfigKey.ThumbnailMode",
      ZegoSuperBoardRenderType.Vector,
      ZegoSuperBoardCustomConfigKey
    );
    console.log(
      "getCustomizedConfig-ThumbnailMode ",
      await superboardManager.getCustomizedConfig(
        ZegoSuperBoardCustomConfigKey.ThumbnailMode
      )
    );
    await superboardManager.enableHandwriting(false);
    console.log(
      "isHandwritingEnabled",
      await superboardManager.isEnabledHandwriting()
    );
  }

  async function getCurrentView() {
    currentView = await superboardManager
      .getSuperBoardView()
      .getCurrentSuperBoardSubView();
    if (currentView) {
      const model = await currentView?.getCurrentSuperBoardSubViewModel();
      console.log("model", model);
      //@ts-ignore
      currentUniqueId = model.uniqueID;
      console.log("currentUniqueId", currentUniqueId);
    }
  }

  async function createWhiteboardView() {
    const viewCreateCallback = await superboardManager.createWhiteboardView({
      name: "test whiteboard",
      pageCount: 5,
      perPageWidth: 960,
      perPageHeight: 540,
    });
    console.log("viewCreateCallback", viewCreateCallback);
    getCurrentView();
  }

  async function destroySuperBoardSubView() {
    console.log("destory", currentUniqueId);
    const res = await superboardManager.destroySuperBoardSubView(
      currentUniqueId
    );
    console.log("destroySuperBoardSubView", res);
  }

  async function flipToNextPage() {
    const res = await currentView?.flipToNextPage();
    console.log("flipToNextPage", res, await currentView?.getPageCount());
  }

  async function flipToPrePage() {
    const res = await currentView?.flipToPrePage();
    console.log("flipToPrePage:", res, await currentView?.getCurrentPage());
    // const res = await currentView?.flipToPage(5);
    // console.log('flipToPage:',res,await currentView?.getCurrentPage());
  }

  async function preStep() {
    const res = await currentView?.preStep();
    console.log("preStep", res);
  }

  async function nextStep() {
    const res = await currentView?.nextStep();
    console.log("nextStep", res);
  }

  async function getViewlist() {
    const list1 = await superboardManager.querySuperBoardSubViewList();
    console.log(
      "querySuperBoardSubViewList",
      list1.subViewModelList[0].whiteboardIDList
    );
    console.log(
      "getSuperBoardSubViewModelList",
      await superboardManager.getSuperBoardSubViewModelList()
    );
  }

  async function uninit() {
    const res = await superboardManager.unInit();
    console.log("unInit=", res);
  }

  async function uploadFile(filePath: string, renderType: 3) {
    await superboardManager.uploadFile(filePath, renderType);
  }

  async function setToolType() {
    await superboardManager.setToolType(ZegoSuperBoardTool.Selector);
    console.log("gettooltype:", await superboardManager.getToolType());
  }

  async function addText() {
    const res = await currentView?.addText("test1111", 100, 100);
    console.log("addText", res);
  }

  async function inputText() {
    const res = await currentView?.inputText();
    console.log("inputText", res);
  }

  async function setBrush(size: number) {
    await superboardManager.setBrushSize(size);
    await superboardManager.setBrushColor("#ffffff");
    console.log("getBrushSize", await superboardManager.getBrushSize());
    console.log("getBrushColor", await superboardManager.getBrushColor());
    // await superboardManager.setCustomCursorAttribute(ZegoSuperboardTool.Pen, {
    //   iconPath: 'https://superboard-demo.zego.im/img/custom-icon.png',
    //   offsetX: 0,
    //   offsetY: 0,
    // });
  }

  async function setFont() {
    await superboardManager.setFontBold(true);
    await superboardManager.setFontItalic(true);
    await superboardManager.setFontSize(48);
    await superboardManager.setCustomFontFromAsset('SourceHanSansSC-Regular','SourceHanSansSC-Bold')
    console.log("isFontBold", await superboardManager.isFontBold());
    console.log("isFontItalic", await superboardManager.isFontItalic());
    console.log("getFontSize", await superboardManager.getFontSize());
  }

  async function createFileView() {
    // const res = await superboardManager.createFileView({
    //   fileID: "wPufYRPLGzqx-BW1",
    // });
    const res = await superboardManager.createFileView({
      fileID: "mQz5blnYpJNnoDR9",
    });
    console.log("createFileView =", res);
  }

  async function switchSuperBoardSubView() {
    const res = await superboardManager
      .getSuperBoardView()
      .switchSuperBoardSubView("2F0B25C0135BC65BACED7B56D97DC72F");
    console.log("switchSuperBoardSubView", res);
  }

  async function switchExcelSheet() {
    const model = await currentView?.getCurrentSuperBoardSubViewModel();
    console.log("model", model, model?.uniqueID);
    if (model) {
      const res = await superboardManager
        .getSuperBoardView()
        .switchSuperBoardSubViewWithSheetIndex(model.uniqueID,3);
      console.log("switchSuperBoardSubViewWithSheetIndex =", res);
    }
  }

  async function getCurrentSheetName() {
    const res = await currentView?.getCurrentSheetName();
    const list = await currentView?.getExcelSheetNameList();
    console.log("getCurrentSheetName res", res, list);
  }
  var cacheSeq: number;
  async function cacheFile() {
    const res = await superboardManager.cacheFile("wPufYRPLGzqx-BW1");
    cacheSeq = res.seq;
    console.log("cacheFile res", cacheSeq);
  }

  async function cancelCacheFile() {
    console.log("cacheSeq", cacheSeq);
    const res = await superboardManager.cancelCacheFile(9);
    console.log("cancelCacheFile res", res);
  }

  async function queryFileCached() {
    console.log(
      "queryFileCached",
      await superboardManager.queryFileCached("ppEoHhuIKVP7WYoK")
    );
    getThumbnailUrlList();
  }
  async function undo() {
    await currentView?.undo();
  }
  async function redo() {
    await currentView?.redo();
  }

  async function clearCurrentPage() {
    await currentView?.clearCurrentPage();
  }

  async function clearAllPage() {
    await currentView?.clearAllPage();
  }

  async function setOperationMode() {
    console.log(111);
    await currentView?.setOperationMode(4 | 8);
  }

  async function getVisibleSize() {
    console.log("visibleSize:", await currentView?.getVisibleSize());
  }

  async function clearSelected() {
    await currentView?.clearSelected();
  }

  async function addImage() {
    await currentView?.addImage(
      0,
      "https://img1.baidu.com/it/u=722430420,1974228945&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500",
      0,
      0
    );
    // await currentView?.setBackgroundImage('https://img1.baidu.com/it/u=722430420,1974228945&fm=253&fmt=auto&app=138&f=JPEG?w=889&h=500',0)
    // await currentView?.clearBackgroundImage();
  }

  async function getThumbnailUrlList() {
    const list = await currentView?.getThumbnailUrlList();
    const notes = await currentView?.getPPTNotes(1);
    console.log("getThumbnailUrlList", list);
    console.log("notes", notes);
    clear();
  }

  async function clear() {
    await superboardManager.clearCache();
    await superboardManager.clear();
  }

  React.useEffect(() => {
    initRTC().then(async () => {
      await initRTCEvent();
      await initSuperboad();
      await initSuperboardEvent();
      await loginRoom();
      getCurrentView();
    });
  }, []);

  // const viewRef = useRef();

  return (
    <View style={styles.container}>
      <Text>superboard RN</Text>
      <ZegoSuperBoardRenderView
        ref={refContainer}
        style={{ height: 500, width: 300 }}
      />
      <View style={styles.fixToText}>
        <Button title="createWb" onPress={createWhiteboardView} />
        <Button title="createFile" onPress={createFileView} />
        {/* <Button title="switch" onPress={switchSuperBoardSubView} /> */}
        <Button title="switchExcelSheet" onPress={switchExcelSheet} />
        {/* <Button title="uploadFile" onPress={uploadFile} /> */}
        {/* <Button title="flipToPrePage" onPress={flipToPrePage} />
        <Button title="flipToNextPage" onPress={flipToNextPage} /> */}
        {/* <Button title="uninit" onPress={uninit} /> */}

        {/* <Button
          title="setToolType(2)"
          onPress={() => {
            setToolType();
          }}
        /> */}
      </View>
      <View style={styles.fixToText}>
        <Button title="flipToPrePage" onPress={flipToPrePage} />
        <Button title="flipToNextPage" onPress={flipToNextPage} />
        <Button title="preStep" onPress={preStep} />
        <Button title="nextStep" onPress={nextStep} />
      </View>
      <View style={styles.fixToText}>
        <Button title="addText" onPress={addText} />
        <Button title="inputText" onPress={inputText} />
        <Button title="getViewlist" onPress={getViewlist} />
        <Button title="clearSelected" onPress={clearSelected} />
      </View>
      <View style={styles.fixToText}>
        <Button title="setFont" onPress={setFont} />
        <Button
          title="setBrushSize"
          onPress={() => {
            setBrush(20);
          }}
        />
      </View>
      <View style={styles.fixToText}>
        <Button
          title="uploadFile"
          onPress={async () => {
            try {
              DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
                mode: "open",
              }).then(async (res) => {
                let path =
                  Platform.OS === "ios"
                    ? decodeURIComponent(res.uri).replace("file://", "")
                    : res.uri;

                console.log("path", path);
                const uploadRes = await superboardManager.uploadFile(
                  path,
                  ZegoSuperBoardRenderType.VectorAndIMG
                );
                console.log("uploadRes", uploadRes);
              });
            } catch (e) {
              handleError(e);
            }
          }}
        />
        <Button
          title="uploadH5File"
          onPress={async () => {
            try {
              DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
                mode: "open",
              }).then(async (res) => {
                let path =
                  Platform.OS === "ios"
                    ? decodeURIComponent(res.uri).replace("file://", "")
                    : res.uri;

                console.log("path", path);
                const config = {
                  width: 1600,
                  height: 900,
                  pageCount: 7,
                  thumbnailList: ["1", "1", "1", "1", "1", "1", "1"],
                };
                const uploadRes = await superboardManager.uploadH5File(
                  path,
                  config
                );
                console.log("uploadRes", uploadRes);
              });
            } catch (e) {
              handleError(e);
            }
          }}
        />
        {/* <Button title="cacheFile" onPress={cacheFile} />
        <Button title="cancelCacheFile" onPress={cancelCacheFile} />
        <Button title="queryFileCached" onPress={queryFileCached} /> */}
      </View>
      <View style={styles.fixToText}>
        <Button title="undo" onPress={undo} />
        <Button title="redo" onPress={redo} />
        <Button title="clearCurrentPage" onPress={clearCurrentPage} />
        <Button title="clearAllPage" onPress={clearAllPage} />
      </View>
      <View style={styles.fixToText}>
        <Button title="setOperationMode" onPress={setOperationMode} />
        <Button title="getVisibleSize" onPress={getVisibleSize} />
        <Button title="addImage" onPress={addImage} />
      </View>
      <View style={styles.fixToText}>
        <Button title="destroy" onPress={destroySuperBoardSubView} />
        <Button title="uninit" onPress={uninit} />
        <Button title="offSuperBoardEvent" onPress={offSuperBoardEvent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 500,
  },
  fixToText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
