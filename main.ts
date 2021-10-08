/**
 * Power Functions Recorder.
 * Records commands from LEGO Power Functions remote controls and plays them.
 *
 * (c) 2021, Adam Orczyk
 */

//% color=#f68420 icon="\uf111" block="PF Recorder"
namespace pfRecorder {
    let data: number[][][] = [[]];
    let recordNr = 0;
    let maxRecordNr = 9;
    let isRecording = false;
    let isPlaying = false;

    function showRecordInfo(){
        if (data[recordNr] == null) {
            data[recordNr] = []
        }

        basic.showNumber(recordNr);
        basic.showNumber(data[recordNr].length);
    }

    function nextRecordNr(){
        if (isPlaying || isRecording) {
            return;
        }

        recordNr += 1;
        if (recordNr > maxRecordNr){
            recordNr = 0;
        }

        showRecordInfo();
    }

    function prevRecordNr() {
        if (isPlaying || isRecording) {
            return;
        }

        recordNr -= 1;
        if (recordNr < 0) {
            recordNr = maxRecordNr
        }

        showRecordInfo();
    }

    function startRecord(){
        basic.clearScreen();
        led.plot(2, 2)
        serial.writeLine('Recording...')
        pfReceiver.startRecord([0]);
    }

    function stopRecord(){
        pfReceiver.stopRecord();
        data[recordNr] = pfReceiver.getRecordedCommands();
        basic.showNumber(data[recordNr].length);
        serial.writeLine(JSON.stringify(data[recordNr]));
    }

    function onButtonA(){
        if (isPlaying){
            return;
        }

        if (isRecording) {
            stopRecord();
        } else {
            startRecord()
        }

        isRecording = !isRecording
    }
    
    function onButtonB() {
        if (isRecording) {
            return;
        }

        if (!isPlaying) {
            if (data[recordNr].length > 0){
                isPlaying = true;
                basic.clearScreen();
                led.plot(4, 0)

                control.runInBackground(() => {
                    pfTransmitter.play(data[recordNr]);
                    basic.clearScreen();
                    isPlaying = false;
                })
            } else {
                basic.showNumber(0);
            }
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
            basic.clearScreen();
        }
    }

    input.onButtonPressed(Button.A, function () {
        onButtonA()
    })

    input.onButtonPressed(Button.B, function () {
        onButtonB()
    })

    input.onButtonPressed(Button.AB, function () {
        nextRecordNr()
    })

    /**
     * Initialize recorder. 
     * Functions: 
     * start/stop record - Button A or Rremote Control Red and Blue Forward
     * , start/stop play - Button B or RC Red Forward
     * , next record number - Button AB or RC Blue Forward
     * , previous record number - RC Blue Backward
     * , run custom action 1 - RC Red Backward
     * , run custom action 2 - RC Red and Blue Backward.
     * @param irReceiverPin IR receiver pin, eg: DigitalPin.P2
     * @param irTransmitterPin IR diode pin, eg: AnalogPin.P0
     * @param recorderControlChannel channel (0-3) for controlling recorder from PF remote control, eg: 1
     * @param customAction1 the function which is run when red and blue button is switched to Forward
     * @param customAction2 the function which is run when red and blue button is switched to Backward
     */
    //% blockId="pfRecorder_init"
    //% block="initialize : receiver pin %irReceiverPin transmitter pin %irTransmitterPin remote control channel %recorderControlChannel" || custom action 1 %customAction1 custom action 2 %customAction2
    //% weight=100
    export function init(
        irReceiverPin: DigitalPin, 
        irTransmitterPin: AnalogPin, 
        recorderControlChannel: PfReceiverChannel, 
        customAction1?: (commands?: number[][]) => void,
        customAction2?: (commands?: number[][]) => void
    ){
        pfReceiver.connectIrReceiver(irReceiverPin)
        pfTransmitter.connectIrSenderLed(irTransmitterPin)

        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Forward, PfControl.Forward, PfAction.Pressed, onButtonA)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Forward, PfControl.Float, PfAction.Pressed, onButtonB)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Forward, PfAction.Pressed, nextRecordNr)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Backward, PfAction.Pressed, prevRecordNr)

        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Backward, PfControl.Float, PfAction.Pressed, () => {
            if (isPlaying || isRecording) {
                return;
            }
            customAction1(data[recordNr])
        })
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Backward, PfControl.Backward, PfAction.Pressed, () => {
            if (isPlaying || isRecording) {
                return;
            }
            customAction2(data[recordNr])
        })
    }

    /**
     * Returns commands list in reversed order.
     * @param commands the recorded commands
     */
    //% blockId="pfRecorder_reverse_order"
    //% block="reverse commands order %commands"
    //% weight=95
    export function reverseOrder(commands: number[][]): number[][] {
        let out: number[][] = [];
        let max = commands.length - 1;

        type Channel = {
            [key: number]: number
        }

        let channels: Channel = {}

        for (let n = max; n >= 0; n--) {
            let task = commands[n];
            out.push(task)

            if (!channels[task[1]]) {
                channels[task[1]] = 1;
            }
        }

        // Last command in reverse order should be stop.
        for (let n of Object.keys(channels)) {
            out.push([0, +n, 1, 0, 0, 0b00010000])
        }

        serial.writeLine('Reversed order:')
        serial.writeLine(JSON.stringify(out));
        return out;
    }

    /**
     * Processes and returns command list reversing only commands from given channel and output.
     * @param commands the recorded commands
     * @param channel the channel (0-3), eg. 0
     * @param output the output: 0 (Red), 1 (Blue), eg. 0
     */
    //% blockId="pfRecorder_reverse_commands"
    //% block="reverse commands %commands from channel %channel output %output"
    //% weight=90
    export function reverseCommands(commands: number[][], channel: number, output: number): number[][] {
        type ReverseMap = {
            [key: number]: number;
        };

        const reverseComboDirectMode: ReverseMap = {
            1: 0b10,
            2: 0b01,
        }

        const reverseSingleOutputMode: ReverseMap = {
            1: 0b1111,
            2: 0b1110,
            3: 0b1101,
            4: 0b1100,
            5: 0b1011,
            6: 0b1010,
            7: 0b1001,

            15: 0b0001,
            14: 0b0010,
            13: 0b0011,
            12: 0b0100,
            11: 0b0101,
            10: 0b0110,
            9: 0b0111,
        }

        const reverseSingleOutputMode2: ReverseMap = {
            4: 0b0101,
            5: 0b0100,
        }

        let out = commands.map(row => {
            let taskChannel = row[1];
            let command = row[5];
            let newCommand = row[5];
            let mode = row[2];
            let data = 0b00001111 & command;
            let red = row[3];
            let blue = row[4];

            if (taskChannel == channel) {
                if (mode == 1) {
                    if (output == 0 && reverseComboDirectMode[red]) {
                        red = reverseComboDirectMode[red]
                    } else if (output == 1 && reverseComboDirectMode[blue]) {
                        blue = reverseComboDirectMode[blue]
                    }

                    data = (blue << 2) | red;
                } else {
                    let saMode = (0b00100000 & command) >>> 5;
                    let commandOutput = (0b00010000 & command) >>> 4;
                    let newData = saMode == 0 ? reverseSingleOutputMode[data] : reverseSingleOutputMode2[data];
                    if (commandOutput == output && newData) {
                        data = newData;
                    }
                }

                newCommand = (0b11110000 & command) | data;
            }

            return [row[0], row[1], row[2], red, blue, newCommand]
        })

        serial.writeLine('Reversed commands:')
        serial.writeLine(JSON.stringify(out));
        return out;
    }
}