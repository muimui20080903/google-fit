import { Auth, google, fitness_v1 } from "npm:googleapis"
const json = await Deno.readTextFile("./client.json")
const jsonObj = JSON.parse(json)
const client = jsonObj.web

async function getOAuth2Client(): Promise<Auth.OAuth2Client> {
  const options = {
    clientId: client.client_id,
    clientSecret: client.client_secret,
    redirectUri: client.redirect_uris[0],
  }
  const oauth2Client = new google.auth.OAuth2(options)
  oauth2Client.setCredentials({
    refresh_token: client.refresh_token,
  })
  return oauth2Client;
}

const oauth2Client = await getOAuth2Client()
const fitnessApi: fitness_v1.Fitness = google.fitness({
  version: "v1",
  auth: oauth2Client,
})

// Data SourcesとそのなかのdataStreamIdの取得
// const { data } = await fitnessApi.users.dataSources.list({
//   userId: "me",
// });

// console.log(JSON.stringify(data));

// 睡眠情報の取得
const from = Date.parse("2024-02-01") * 1e6; // ミリ秒→ナノ秒に変換(10^6倍する)
const to = Date.parse("2024-02-12") * 1e6;

const { data } = await fitnessApi.users.dataSources.datasets.get({
  dataSourceId:
    // "raw:com.google.sleep:com.google.android.apps.fitness:user_input",
    "derived:com.google.sleep.segment:com.google.android.gms:merged",
  userId: "me",
  datasetId: `${from}-${to}`,
})

// 外部ファイルに保存
// const dataObj = JSON.stringify(data)
// Deno.writeTextFile("./data.json",dataObj)

const sleepTimeArray = data.point?.map(e => {
  return{
    startDate: new Date(e.startTimeNanos / 1e6).toLocaleString(),
      endDate: new Date(e.endTimeNanos / 1e6).toLocaleString()
  };
})
console.log(sleepTimeArray)
