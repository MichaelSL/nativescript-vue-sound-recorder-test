<template>
    <Page>
        <ActionBar title="Sound recorder test app" android:flat="true"/>
        <TabView android:tabBackgroundColor="#53ba82"
                android:tabTextColor="#c4ffdf"
                android:selectedTabTextColor="#ffffff"
                androidSelectedTabHighlightColor="#ffffff">
            <TabViewItem title="Recording">
                <GridLayout columns="*" rows="*">
                    <StackLayout col="0" row="0">
                        <Label class="message" :text="msg"/>
                        <Button text="Start recording" @tap="onStartRecording"/>
                        <Button text="Stop recording" @tap="onStopRecording"/>
                        <RadCartesianChart allowAnmation="true" style="height: 100%;">
                            <LineSeries v-tkCartesianSeries :items="amps"
                                categoryProperty="index" valueProperty="amp" />
                            <CategoricalAxis v-tkCartesianHorizontalAxis />
                            <LinearAxis v-tkCartesianVerticalAxis />
                        </RadCartesianChart>
                    </StackLayout>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="Options">
                <GridLayout columns="*" rows="*">
                    <StackLayout col="0" row="0">
                        <Button text="Write file" @tap="onWriteFile"/>
                    </StackLayout>
                </GridLayout>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script lang="ts">
    import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';
    import { error } from 'util';
    import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";
    import { isAndroid, isIOS } from "tns-core-modules/platform";
    import { alert } from "tns-core-modules/ui/dialogs";
    import { RecorderService } from "../services/recorder-service";
    import { requestPermission, hasPermission } from "nativescript-permissions";
    import RadChart from 'nativescript-ui-chart/vue';
    import Vue from 'nativescript-vue';
    import { setInterval, clearInterval } from "tns-core-modules/timer";

    Vue.use(RadChart);
    declare var android;
    const recorderService = new RecorderService();

    export default {
        methods: {
            onStartRecording: async function() {
                let audioFolder = knownFolders.temp().getFolder("audio").path;
                let fileName = "/test-record";

                console.log(`=========> Android: ${isAndroid}`);
                if (isAndroid) {
                    fileName += ".mp3";
                    
                    try{
                        if (!hasPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)){
                            const permissionResult = await requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE, "We need to store recorded files somewhere.");
                        }
                    } catch {
                        console.log("Permission request failed");
                    }
                    audioFolder = path.join(android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).getAbsolutePath(), fileName);
                    this.msg = `Recording to ${audioFolder}`;
                } else  if (isIOS) {
                    this.msg = `iOS - new recording`;
                    fileName += ".caf";
                    
                    audioFolder = path.join(audioFolder, fileName);
                }

                console.log(`audioFolder: ${audioFolder}`);
                await recorderService.startRecording(path.normalize(audioFolder));
            },
            onStopRecording: async function() {
                this.msg = "Recording stopped";

                await recorderService.stopRecording();
                const amps = recorderService
                    .getAmplitudes()
                    .map((v,i) => { return { index: i, amp: v}});

                this.amps = amps;
            },
            onWriteFile: async function() {
                const fileToWrite = path.normalize(knownFolders.currentApp().getFolder("text-test").path + "test-file.txt");
                console.log(fileToWrite);
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
                msg: "",
                amps: []
            }
        },
        created(){
            if(!TNSRecorder.CAN_RECORD()){
                this.msg = "No MIC detected";
                return;
            } else{
                this.msg = "MIC detected";
            }

            if (isAndroid){
                const haveWritePermission = hasPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE);
                const haveMicPermission = hasPermission(android.Manifest.permission.RECORD_AUDIO);
                const message = `WRITE: ${haveWritePermission}; REC: ${haveMicPermission}`;
                console.log(message);
                this.msg = message;
            } else if (isIOS) {
                this.msg = "Starting on iOS";
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
