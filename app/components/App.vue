<template>
    <Page>
        <ActionBar title="Sound recorder test app" android:flat="true"/>
        <TabView android:tabBackgroundColor="#53ba82"
                 android:tabTextColor="#c4ffdf"
                 android:selectedTabTextColor="#ffffff"
                 androidSelectedTabHighlightColor="#ffffff">
            <TabViewItem title="Tab 1">
                <GridLayout columns="*" rows="*">
                    <Label class="message" :text="msg" col="0" row="0"/>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="Tab 2">
                <GridLayout columns="*" rows="*">
                    <Label class="message" text="Tab 2 Content" col="0" row="0"/>
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
  import { TNSPlayer, TNSRecorder } from 'nativescript-audio';

  export default {
    data() {
      let message = "Hello";
      const recorder = new TNSRecorder();
      recorder.debug = true;
      if(!recorder.hasRecordPermission()){
          message = "Asking for MIC permisison";
          recorder.requestRecordPermission();
      } else{
          message = "Ready to REC";
      }

      return {
        msg: message
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
