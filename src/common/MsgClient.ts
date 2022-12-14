import { IOT } from '../models/iot.model'
import { useIOTDeviceStore } from '../store/IOTDevices'

export default abstract class MsgClient {

  protected deviceStore: any
  protected client: Paho.MQTT.Client
  protected curTopic: string
  protected curSubDevice: string


  constructor() {
    this.deviceStore = useIOTDeviceStore()
  }

  public subscribe(deviceId: string) {

    if (!this.isConnected()) { return }

    if (this.curTopic && this.curSubDevice !== deviceId) {
      this.sendMsg(this.curSubDevice, {
        from: this.client.clientId,
        type: IOT.MsgType.TMP_UNSUBSCRIBED,
      })
      this.client.unsubscribe(this.curTopic)
    }

    this.curSubDevice = deviceId
    this.curTopic = `tmp/${deviceId}`
    this.client.subscribe(this.curTopic)

    this.sendMsg(deviceId, {
      from: this.client.clientId,
      type: IOT.MsgType.TMP_SUBSCRIBED,
    })
  }

  protected abstract isConnected(): boolean

  public unsubscribe(deviceId: string): void {
    if (!this.isConnected()) { return }
    this.client.unsubscribe(this.curTopic)
    this.client.unsubscribe(`tmp/${deviceId}`)
  }

  public sendMsg(deviceId: string, message: IOT.IOTMsg) {
    this.client.send(`tmp/${deviceId}`, JSON.stringify(message))
  }

  protected handleMsg(topic: string, message: string) {
    try {
      let msg = JSON.parse(message) as IOT.IOTMsg
      switch (msg.type) {
        case IOT.MsgType.DATA:
          this.deviceStore.updateDeviceData(msg.from, msg.data)
          break
        case IOT.MsgType.REGISTER:

          break
      }
    } catch (err) {
      console.log(err)
    }
  }

  abstract close(): void
}