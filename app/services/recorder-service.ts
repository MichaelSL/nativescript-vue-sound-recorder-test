import { TNSPlayer, TNSRecorder, AudioRecorderOptions } from 'nativescript-audio';

export class RecorderService{
    private _recorder: TNSRecorder;

    getRecorder(debug = false): TNSRecorder{
        if (!this._recorder){
            this._recorder = new TNSRecorder();
            this._recorder.debug = debug;
        }
        return this._recorder;
    }
}