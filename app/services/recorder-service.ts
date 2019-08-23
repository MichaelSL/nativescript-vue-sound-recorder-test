import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';
import { setInterval, clearInterval } from "tns-core-modules/timer";

export class RecorderService{
    private _recorder: TNSRecorder;
    private _timerId: any;
    private _amplitudes: Array<number> = [];
    private _isRecording: boolean = false;

    private resetMeters(){
        if (this._timerId){
            try {
                clearInterval(this._timerId);
            } catch {

            }
        }
        this._amplitudes = [];
    }

    public getRecorder(debug = false): TNSRecorder{
        if (!this._recorder){
            this._recorder = new TNSRecorder();
            this._recorder.debug = debug;
        }
        return this._recorder;
    }

    public startRecording(filename: string): Promise<any>{
        const recorder = this.getRecorder(true);

        return recorder.start({
            filename: filename,
            metering: true,
            infoCallback: function(recorder: any, info: number, extra: number) {
                console.log(`infoCallback: ${info} => ${extra}`);
            },
            errorCallback: function(recorder: any, error: number, extra: number) {
                console.log('errorCallback');
            }
        }).then(v => {
            this._isRecording = true;
            this.resetMeters();

            this._timerId = setInterval(() =>{
                let amp = recorder.getMeters();
                this._amplitudes.push(amp);
            }, 200);
        });
    }

    public stopRecording(): Promise<any>{
        if (!this._isRecording){
            return Promise.resolve();
        }
        const recorder = this.getRecorder(true);
        clearInterval(this._timerId);
        return recorder.stop();
    }

    public getAmplitudes(): Array<number>{
        return this._amplitudes;
    }
}