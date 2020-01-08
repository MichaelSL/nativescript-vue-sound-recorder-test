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
                            <CategoricalAxis v-tkCartesianHorizontalAxis majorTickInterval="50" />
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
    import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from "nativescript-audio";
    import { error } from "util";
    import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";
    import { isAndroid, isIOS } from "tns-core-modules/platform";
    import { alert } from "tns-core-modules/ui/dialogs";
    import { RecorderService } from "../services/recorder-service";
    import { requestPermission, hasPermission } from "nativescript-permissions";
    import RadChart from "nativescript-ui-chart/vue";
    import Vue from "nativescript-vue";
    import { setInterval, clearInterval } from "tns-core-modules/timer";
    import * as Geolocation from "nativescript-geolocation";
    import { IndexedAmplitude } from "../models/indexed-amplitude";
    import { RecordingData } from "../models/recording-data";

    Vue.use(RadChart);
    declare var android;
    const SAMPLING_INTERVAL = 200;
    const SAMPLES_PER_SECOND = 1000 / SAMPLING_INTERVAL;
    const recorderService = new RecorderService();

    let location: Promise<Geolocation.Location>;

    async function RecordFile() {
        let audioFolder = knownFolders.temp().getFolder("audio").path;
        let fileName = "/test-record";
        console.log(`=========> Android: ${isAndroid}`);
        if(isAndroid) {
            fileName += ".mp3";
            audioFolder = path.join(audioFolder,fileName);
        }
        else if(isIOS) {
            fileName += ".caf";
            audioFolder = path.join(audioFolder,fileName);
        }
        console.log(`audioFolder: ${audioFolder}`);
        return await recorderService.startRecording(path.normalize(audioFolder),SAMPLING_INTERVAL);
    }

    export default {
        methods: {
            onStartRecording: async function() {

                await Geolocation.enableLocationRequest(true);
                if (await Geolocation.isEnabled()){
                    console.log("Location is enabled");
                    location = Geolocation.getCurrentLocation({});
                    this.msg = 'Recording...';
                    this.amps = [];
                    await RecordFile();
                } else{
                    this.msg = "Location is disabled on a device.";
                    return;
                }
            },
            onStopRecording: async function() {
                await recorderService.stopRecording();
                let amps : Array<IndexedAmplitude> = null;
                
                if (isAndroid){
                    amps = recorderService
                        .getNormalizedAmplitudes()
                        .map((v,i) => { return new IndexedAmplitude({ index: i / SAMPLES_PER_SECOND, amp: v})});
                } else if (isIOS){
                    amps = recorderService
                        .getAmplitudes()
                        .map((v,i) => { return new IndexedAmplitude({ index: i / SAMPLES_PER_SECOND, amp: v})});
                } else{
                    //default OS - no adjustment
                    amps = recorderService
                        .getAmplitudes()
                        .map((v,i) => { return new IndexedAmplitude({ index: i / SAMPLES_PER_SECOND, amp: v})});
                }
                

                this.amps = amps;

                location
                    .then(result => {
                        const recordingData = new RecordingData({
                            timestamp: new Date().toISOString(),
                            amps: amps,
                            location: result
                        });

                        this.msg = `Location data aquired. Data ready to send.`;
                    })
                    .catch(e => {
                        console.log("loc error", e);
                    });

                this.msg = `Rec stopped - waiting for location`;
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