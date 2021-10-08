let isPlaying = false;
pfRecorder.init(
    DigitalPin.P2,
    AnalogPin.P0,
    PfReceiverChannel.Channel2,
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            let reversed = pfRecorder.reverseOrder(data);
            led.plot(4, 0)

            control.runInBackground(() => {
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
            basic.clearScreen()
        }
    },
    (data: number[][]) => {
        if (!isPlaying) {
            isPlaying = true;
            let reversed = pfRecorder.reverseCommands(data, 0, 0);
            led.plot(4, 0)
            
            control.runInBackground(() => {
                pfTransmitter.play(reversed);
                basic.clearScreen()
                isPlaying = false;
            })
        } else {
            isPlaying = false;
            pfTransmitter.stopPlaying();
            basic.clearScreen()
        }
    }
)