/**
 * Power Functions Recorder.
 * Records commands from LEGO Power Functions remote controls and plays them.
 * 
 * (c) 2021, Adam Orczyk
 */

//% color=#f68420 icon="\uf111" block="PF Recorder"
namespace pfRecorder {
    let data: number[][] = [];
    let isRecording = false;
    let isPlaying = false;

    function startRecord(){
        basic.clearScreen();
        led.plot(0, 0)
        serial.writeString('Recording...\n')
        data = [];
        pfReceiver.startRecord([0], data);
    }

    function stopRecord(){
        basic.showNumber(data.length);
        pfReceiver.stopRecord();
        serial.writeString(JSON.stringify(data) + '\n');
    }

    function onButtonA(){
        if (isRecording) {
            stopRecord();
        } else {
            startRecord()
        }

        isRecording = !isRecording
    }

    function onButtonB() {
        if (!isPlaying) {
            isPlaying = true;
            control.runInBackground(() => {
                basic.showString('>')
                pfTransmitter.play(data);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
        }
    }

    input.onButtonPressed(Button.A, function() {
        onButtonA()
    })

    input.onButtonPressed(Button.B, function() {
        onButtonB()
    })

    /**
     * Initialize recorder.
     */
    //% blockId="pfRecorder_init"
    //% block="initialize : receiver pin %irReceiverPin transmitter pin %irTransmitterPin control channel %recorderControlChannel"
    //% weight=100
    export function init(irReceiverPin: DigitalPin, irTransmitterPin: AnalogPin, recorderControlChannel: PfReceiverChannel){
        pfReceiver.connectIrReceiver(irReceiverPin)
        pfTransmitter.connectIrSenderLed(irTransmitterPin)

        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Forward, PfControl.Float, PfAction.Pressed, onButtonA)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Forward, PfAction.Pressed, onButtonB)
    }
}

pfRecorder.init(DigitalPin.P2, AnalogPin.P0, PfReceiverChannel.Channel2)