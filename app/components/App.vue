<template>
    <Page>
        <ActionBar title="Sound recorder test app" android:flat="true"/>
        <TabView android:tabBackgroundColor="#53ba82"
                 android:tabTextColor="#c4ffdf"
                 android:selectedTabTextColor="#ffffff"
                 androidSelectedTabHighlightColor="#ffffff">
            <TabViewItem title="Tab 1">
                <GridLayout columns="*" rows="*">
                    <StackLayout col="0" row="0">
                        <Label class="message" :text="msg"/>
                        <Button text="Start recording" @tap="onStartRecording"/>
                        <Button text="Stop recording" @tap="onStopRecording"/>
                    </StackLayout>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="Tab 2">
                <GridLayout columns="*" rows="*">
                    <StackLayout col="0" row="0">
                        <Button text="Write file" @tap="onWriteFile"/>
                    </StackLayout>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="Tab 3">
                <GridLayout columns="*" rows="*">
                    <Label class="message" text="Tab 3 Content" col="0" row="0"/>
                </GridLayout>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script lang="ts">
    import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';
    import { error } from 'util';
    import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";
    import { isAndroid } from "tns-core-modules/platform";
    import { alert } from "tns-core-modules/ui/dialogs";

  declare var android;


  export default {
    data() {
      let message = "Hello";
      //const temp: Folder = <Folder>knownFolders.temp();
      //const folder: Folder = <Folder>temp.getFolder("test-recs");

      let audioFolder = knownFolders.currentApp().getFolder("audio-test").path;
      const fileName = "/test-record.mp3";

      if (isAndroid) {
        const permissions = require("nativescript-permissions");
        permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "I need these permissions because I'm cool")
            .then(() => {
                audioFolder = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), fileName);
            });
    }

      const recorder = new TNSRecorder();
      recorder.debug = true;
      if(!TNSRecorder.CAN_RECORD()){
          message = "Asking for MIC permisison";
          recorder.requestRecordPermission();
      } else{
          message = "Ready to REC";
      }

      return {
        msg: message,
        onStartRecording: async () => {
            await recorder.start({
                filename: path.normalize(audioFolder),   
            infoCallback: function(recorder: any, info: number, extra: number) {
                console.log(`infoCallback: ${info} => ${extra}`);
            },
            errorCallback: function(recorder: any, error: number, extra: number) {
                console.log('errorCallback');
                alert('Error recording.');
            }
            });
        },
        onStopRecording: async () => {
            await recorder.stop();
            const imageFile = File.fromPath(path.normalize(audioFolder));
            const binarySource = imageFile.readSync((err) => {
                console.log(err);
            });
            console.log(binarySource);
        },
        onWriteFile: async () => {
            const fileToWrite = path.normalize(knownFolders.currentApp() + "test-file.txt");
            const file = File.fromPath(fileToWrite);

            try{
                await file.writeText("foo bar");

                let text = await file.readText();
                console.log(text);
            } catch (error){
                console.log(error);
            }
        }
      }
    }
  }
</script>

<style scoped>
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }
</style>
