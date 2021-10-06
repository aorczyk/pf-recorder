namespace pfRecorder {
    let data: number[][] = [];
    let isRecording = false;
    let isPlaying = false;

    // Reversing commands order
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

            if (!channels[task[1]]){
                channels[task[1]] = 1;
            }
        }

        for (let n of Object.keys(channels)){
            out.push([0, +n, 1, 0, 0, 0b00010000])
        }

        serial.writeString('Reversed order:\n')
        serial.writeString(JSON.stringify(out) + '\n');
        return out;
    }

    // Reversing commands
    // Reversing only commands from given channel and output.
    export function reverseCommands(commands: number[][], channel: number, output: number): number[][]{
        let out: number[][] = [];
        let max = commands.length - 1;
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

        for (let n = 0; n <= max; n++){
            let task = commands[n];
            let taskChannel = task[1];
            let command = task[5];
            let newCommand = task[5];
            let mode = task[2];
            let data = 0b00001111 & command;

            if (taskChannel == channel){
                if (mode == 1) {
                    let red = task[3];
                    let blue = task[4];

                    if (output == 0 && reverseComboDirectMode[red]) {
                        red = reverseComboDirectMode[red]
                    } else if (output == 1 && reverseComboDirectMode[blue]) {
                        blue = reverseComboDirectMode[blue]
                    }

                    data = (blue << 2) | red;
                } else {
                    let commandOutput = (0b00010000 & command) >>> 4;
                    let newData = reverseSingleOutputMode[data];
                    if (commandOutput == output && reverseSingleOutputMode[data]) {
                        data = reverseSingleOutputMode[data];
                    }
                }

                newCommand = (0b11110000 & command) | data;
            }

            out.push([task[0], task[1], task[2], task[3], task[4], newCommand])
        }

        // Last command is usually stop.
        // out.push(commands[max])

        serial.writeString('Reversed commands:\n')
        serial.writeString(JSON.stringify(out) + '\n');
        return out;
    }

    function startRecord(){
        basic.clearScreen();
        led.plot(0, 0)
        serial.writeString('Recording...\n')
        pfReceiver.startRecord([0]);
    }

    function stopRecord(){
        pfReceiver.stopRecord();
        data = pfReceiver.getRecordedCommands();
        basic.showNumber(data.length);
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
                basic.showString('*')
                let reversed = reverseOrder(data);
                basic.showString('<')
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
        }
    }

    function reverse2() {
        if (!isPlaying) {
            isPlaying = true;
            control.runInBackground(() => {
                basic.showString('*')
                let reversed = reverseCommands(data, 0, 0);
                basic.showString('<')
                pfTransmitter.play(reversed);
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
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Forward, PfAction.Pressed, reverse)
        pfReceiver.onRCcommand(recorderControlChannel, PfControl.Float, PfControl.Backward, PfAction.Pressed, reverse2)
    }
}
pfRecorder.init(DigitalPin.P2, AnalogPin.P0, PfReceiverChannel.Channel2)
