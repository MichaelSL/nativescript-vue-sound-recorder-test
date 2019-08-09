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

    let getFileAndRecorder = () => {
        let audioFolder = knownFolders.currentApp().getFolder("audio-test").path;
        let fileName = "/test-record";

        if (isAndroid) {
            fileName += ".mp3";
            const permissions = require("nativescript-permissions");
            
            permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "I need these permissions because I'm cool")
                .then(() => {
                    audioFolder = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), fileName);
                });
        }

        const recorder = new TNSRecorder();
        recorder.debug = true;
        if(!TNSRecorder.CAN_RECORD()){
            this.msg = "Asking for MIC permisison";
            recorder.requestRecordPermission();
        } else{
            this.msg = "Ready to REC";
        }
    };

    export default {
        methods: {
            onStartRecording: async () => {
                let audioFolder = knownFolders.currentApp().getFolder("audio-test").path;
                let fileName = "/test-record";

                if (isAndroid) {
                    fileName += ".mp3";
                    const permissions = require("nativescript-permissions");
                    
                    permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "I need these permissions because I'm cool")
                        .then(() => {
                            audioFolder = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), fileName);
                        });
                }

                const recorder = new TNSRecorder();
                recorder.debug = true;
                if(!TNSRecorder.CAN_RECORD()){
                    this.msg = "Asking for MIC permisison";
                    recorder.requestRecordPermission();
                } else{
                    this.msg = "Ready to REC";
                }

                await recorder.start({
                    filename: path.normalize(audioFolder),
                    metering: true,
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
                let audioFolder = knownFolders.currentApp().getFolder("audio-test").path;
                let fileName = "/test-record";

                if (isAndroid) {
                    fileName += ".mp3";
                    const permissions = require("nativescript-permissions");
                    
                    await permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "I need these permissions because I'm cool");
                    audioFolder = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), fileName);                        
                }

                const recorder = new TNSRecorder();
                recorder.debug = true;
                if(!TNSRecorder.CAN_RECORD()){
                    this.msg = "Asking for MIC permisison";
                    recorder.requestRecordPermission();
                } else{
                    this.msg = "Ready to REC";
                }

                await recorder.stop();
                const audioFile = File.fromPath(path.normalize(audioFolder));
                const binarySource = audioFile.readSync((err) => {
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
        },
        data() {
            return {
                msg: "Hello!"
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
