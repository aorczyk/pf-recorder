let isPlaying = false;
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    PfReceiverChannel.Channel2,
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            control.runInBackground(() => {
                basic.showString('*')
                let reversed = pfRecorder.reverseOrder(data);
                basic.showString('<')
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
        }
    },
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            control.runInBackground(() => {
                basic.showString('*')
                let reversed = pfRecorder.reverseCommands(data, 0, 0);
                basic.showString('>')
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
        }
    }
)