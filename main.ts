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

    // type ReverseMap = {
    //     [key: number]: number;
    // };

    // let reverseComboDirectMode: ReverseMap = {
    //     // Combo direct mode
    //     0b01: 0b10,
    //     0b10: 0b01,
    // }

    // let reverseSingleOutputMode: ReverseMap = {
    //     // Single output mode
    //     0b0001: 0b1111,
    //     0b0010: 0b1110,
    //     0b0011: 0b1101,
    //     0b0100: 0b1100,
    //     0b0101: 0b1011,
    //     0b0110: 0b1010,
    //     0b0111: 0b1001,

    //     0b1111: 0b0001,
    //     0b1110: 0b0010,
    //     0b1101: 0b0011,
    //     0b1100: 0b0100,
    //     0b1011: 0b0101,
    //     0b1010: 0b0110,
    //     0b1001: 0b0111,
    // }

    // Reversing commands (beta)
    // ToDo: reverse only specified channel and output.
    function reverseCommands(commands: number[][]): number[][]{
        let out: number[][] = [];
        let max = commands.length - 1;

        for (let n = max; n >= 0; n--){
            let task = commands[n];

            // // let channel = (0b001100000000 & task[0]) >>> 8;
            // let mode = (0b000001110000 & task[0]) >>> 4;
            // let data: number = 0;

            // if (mode == 1) {
            //     let red: number = (0b000000000011 & task[0]);
            //     let blue: number = (0b000000001100 & task[0]) >>> 2;

            //     data = (reverseComboDirectMode[blue] << 2) | reverseComboDirectMode[red];
            // } else {
            //     let output = (0b000000110000 & task[0]) >>> 4;

            //     data = reverseSingleOutputMode[(0b000000001111 & task[0])];
            // }

            // let newTask: number = (0b111111110000 & task[0]) | data;
            // out.push([newTask, task[1], task[2]])
            out.push(task)
        }

        // Last command is usually stop.
        out.push(commands[max])

        serial.writeString('Reversed:\n')
        serial.writeString(JSON.stringify(out) + '\n');
        return out;
    }

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

    function reverse() {
        if (!isPlaying) {
            isPlaying = true;
            control.runInBackground(() => {
                basic.showString('<')
                pfTransmitter.play(reverseCommands(data));
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

    input.onButtonPressed(Button.A, function () {
        onButtonA()
    })

    input.onButtonPressed(Button.AB, function () {
        reverse()
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
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Backward, PfControl.Float, PfAction.Pressed, onButtonB)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Backward, PfAction.Pressed, reverse)
    }
}

pfRecorder.init(DigitalPin.P2, AnalogPin.P0, PfReceiverChannel.Channel2)