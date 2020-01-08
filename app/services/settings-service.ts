export class SettingsService{
    public settingsRootUrl: string = "https://configs-endpoint";

    /**
     * getRootSettings
     */
    public getRootSettings(): Promise<any> {
        return new Promise(pr => {
            return {
                backendUrl: "http://myserver/myapp",
                maxRecordingSeconds: 60 * 60
            }
        });
    }
}