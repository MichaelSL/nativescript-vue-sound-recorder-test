import * as Geolocation from "nativescript-geolocation";
import { IndexedAmplitude } from './indexed-amplitude';

export class RecordingData{
    public timestamp: string;
    public amps: Array<IndexedAmplitude>;
    public location: Geolocation.Location;

    public constructor(init?:Partial<RecordingData>) {
        Object.assign(this, init);
    }
}